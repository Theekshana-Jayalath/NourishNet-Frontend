import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { createRequest, getUser } from "../../api";
import FoodItemsBoard from "../FoodItemBoard";

export default function Request({ showToast, setActiveTab }) {
  const user = getUser();

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };

  const tomorrowDate = getTomorrowDate();

  const emptyItem = {
    itemName: "",
    quantity: 1,
    unit: "kg",
    category: "",
    maxAvailable: null,
  };

  const [form, setForm] = useState({
    organizationName: user?.organizationName || user?.name || user?.username || "",
    contactPhone: user?.contactNumber || user?.contact || "",
    peopleCount: "",
    urgencyLevel: "MEDIUM",
    neededBefore: "",
    location: { address: user?.address || "" },
    requestedItems: [{ ...emptyItem }],
    dietaryNeeds: [],
    notes: "",
  });

  const [dietInput, setDietInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const calendarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setCalendarOpen(false);
      }
    };

    if (calendarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [calendarOpen]);

  const selectedNeededBeforeDate = useMemo(() => {
    if (!form.neededBefore) return undefined;
    const parsed = new Date(form.neededBefore);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }, [form.neededBefore]);

  const itemCount = useMemo(
    () => form.requestedItems.filter((item) => item.itemName.trim()).length,
    [form.requestedItems]
  );

  const totalUnits = useMemo(() => {
    return form.requestedItems
      .filter((item) => item.itemName.trim())
      .reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  }, [form.requestedItems]);

  const selectedBoardItems = useMemo(() => {
    return form.requestedItems.filter((item) => item.itemName.trim());
  }, [form.requestedItems]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateAddress = (value) => {
    setForm((prev) => ({
      ...prev,
      location: { ...prev.location, address: value },
    }));
  };

  const updateItem = (index, field, value) => {
    setForm((prev) => {
      const next = [...prev.requestedItems];
      const currentItem = next[index];

      if (field === "quantity") {
        const digitsOnly = String(value).replace(/\D/g, "");

        if (digitsOnly === "") {
          next[index] = { ...currentItem, quantity: "" };
          return { ...prev, requestedItems: next };
        }

        let numericValue = Number(digitsOnly);

        if (numericValue <= 0) {
          numericValue = 1;
        }

        if (
          currentItem.maxAvailable !== null &&
          currentItem.maxAvailable !== undefined &&
          numericValue > Number(currentItem.maxAvailable)
        ) {
          numericValue = Number(currentItem.maxAvailable);
        }

        next[index] = { ...currentItem, quantity: numericValue };
        return { ...prev, requestedItems: next };
      }

      next[index] = { ...currentItem, [field]: value };
      return { ...prev, requestedItems: next };
    });
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      requestedItems: [...prev.requestedItems, { ...emptyItem }],
    }));
  };

  const removeItem = (index) => {
    setForm((prev) => {
      const remaining = prev.requestedItems.filter((_, i) => i !== index);
      return {
        ...prev,
        requestedItems: remaining.length ? remaining : [{ ...emptyItem }],
      };
    });
  };

  const handleBoardItemSelect = (selectedItem) => {
    const availableQuantity = Number(
      selectedItem.maxAvailable ?? selectedItem.quantity ?? 0
    );
    const selectedQuantity = Number(selectedItem.quantity || 1);

    if (availableQuantity <= 0) {
      showToast("This item is out of stock", "error");
      return;
    }

    setForm((prev) => {
      const next = [...prev.requestedItems];

      const existingIndex = next.findIndex(
        (item) =>
          item.itemName.trim().toLowerCase() === selectedItem.name.trim().toLowerCase()
      );

      if (existingIndex !== -1) {
        next[existingIndex] = {
          ...next[existingIndex],
          itemName: selectedItem.name,
          unit: selectedItem.unit,
          category: selectedItem.type || next[existingIndex].category,
          maxAvailable: availableQuantity,
          quantity: Math.min(selectedQuantity, availableQuantity),
        };

        return { ...prev, requestedItems: next };
      }

      const firstEmptyIndex = next.findIndex((item) => !item.itemName.trim());

      const newItem = {
        itemName: selectedItem.name,
        quantity: Math.min(selectedQuantity, availableQuantity),
        unit: selectedItem.unit,
        category: selectedItem.type || "",
        maxAvailable: availableQuantity,
      };

      if (firstEmptyIndex !== -1) {
        next[firstEmptyIndex] = newItem;
        return { ...prev, requestedItems: next };
      }

      return {
        ...prev,
        requestedItems: [...next, newItem],
      };
    });

    showToast(`${selectedItem.name} added to Resource Catalog`);
  };

  const addDiet = () => {
    const value = dietInput.trim();
    if (!value) return;
    if (form.dietaryNeeds.includes(value)) {
      setDietInput("");
      return;
    }

    setForm((prev) => ({
      ...prev,
      dietaryNeeds: [...prev.dietaryNeeds, value],
    }));
    setDietInput("");
  };

  const removeDiet = (value) => {
    setForm((prev) => ({
      ...prev,
      dietaryNeeds: prev.dietaryNeeds.filter((d) => d !== value),
    }));
  };

  const handleContactPhoneChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
    updateField("contactPhone", digitsOnly);
  };

  const handlePeopleCountChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");

    if (value === "") {
      updateField("peopleCount", "");
      return;
    }

    const numericValue = Number(value);

    if (numericValue <= 0) {
      updateField("peopleCount", "");
      return;
    }

    updateField("peopleCount", value);
  };

  const blockNonNumericKeys = (e) => {
    const allowedKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
    ];

    if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey) return;

    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const blockInvalidPeopleCountKeys = (e) => {
    const allowedKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
    ];

    if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey) return;

    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
      return;
    }

    const currentValue = e.currentTarget.value;
    const selectionStart = e.currentTarget.selectionStart ?? currentValue.length;
    const selectionEnd = e.currentTarget.selectionEnd ?? currentValue.length;

    const nextValue =
      currentValue.slice(0, selectionStart) +
      e.key +
      currentValue.slice(selectionEnd);

    if (Number(nextValue) <= 0) {
      e.preventDefault();
    }
  };

  const blockInvalidQuantityKeys = (e) => {
    const allowedKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
    ];

    if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey) return;

    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleSubmitValidation = () => {
    if (!/^\d{10}$/.test(form.contactPhone)) {
      showToast("Contact phone must contain exactly 10 numbers", "error");
      return false;
    }

    if (!form.peopleCount || Number(form.peopleCount) <= 0) {
      showToast("People count must be a positive number greater than 0", "error");
      return false;
    }

    if (!form.neededBefore) {
      showToast("Please select a needed before date", "error");
      return false;
    }

    const selectedDate = new Date(form.neededBefore);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate <= today) {
      showToast("Needed before must be a future date", "error");
      return false;
    }

    const invalidQuantityItem = form.requestedItems.find((item) => {
      if (!item.itemName.trim()) return false;
      const quantity = Number(item.quantity);
      if (!quantity || quantity <= 0) return true;
      if (
        item.maxAvailable !== null &&
        item.maxAvailable !== undefined &&
        quantity > Number(item.maxAvailable)
      ) {
        return true;
      }
      return false;
    });

    if (invalidQuantityItem) {
      showToast(
        `Quantity for ${invalidQuantityItem.itemName} cannot exceed available stock`,
        "error"
      );
      return false;
    }

    return true;
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!handleSubmitValidation()) return;

    try {
      setSubmitting(true);

      const payload = {
        organizationName: form.organizationName,
        contactPhone: form.contactPhone,
        peopleCount: Number(form.peopleCount),
        urgencyLevel: form.urgencyLevel,
        neededBefore: form.neededBefore,
        location: {
          address: form.location.address,
        },
        requestedItems: form.requestedItems
          .filter((item) => item.itemName.trim())
          .map((item) => ({
            itemName: item.itemName,
            quantity: Number(item.quantity),
            unit: item.unit,
            category: item.category,
          })),
        dietaryNeeds: form.dietaryNeeds,
        notes: form.notes,
      };

      const res = await createRequest(payload);
      showToast(`${res.message} (${res.data?.requestId || "Created"})`);

      setForm({
        organizationName: user?.organizationName || user?.name || user?.username || "",
        contactPhone: user?.contactNumber || user?.contact || "",
        peopleCount: "",
        urgencyLevel: "MEDIUM",
        neededBefore: "",
        location: { address: user?.address || "" },
        requestedItems: [{ ...emptyItem }],
        dietaryNeeds: [],
        notes: "",
      });

      setCalendarOpen(false);
      setTimeout(() => setActiveTab("history"), 700);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <FoodItemsBoard
          onSelectItem={handleBoardItemSelect}
          selectedItems={selectedBoardItems}
        />
      </div>

      <div className="mb-10">
        <h2 className="text-4xl font-extrabold tracking-tight text-[#003331]">
          Initialize Resource Request
        </h2>
        <p className="mt-2 max-w-3xl text-lg text-[#3f4948]">
          Draft a new distribution requirement. All fields marked with an
          architectural precision ensure timely delivery to your community.
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.6fr_0.75fr]">
        <form onSubmit={submit} className="space-y-8">
          <section className="rounded-[32px] bg-white p-7 shadow-xl shadow-teal-900/5">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e4e9e9] text-[#003331]">
                <span className="material-symbols-outlined">business</span>
              </div>
              <h3 className="text-2xl font-bold text-[#171d1d]">Organization Identity</h3>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Organization Name"
                value={form.organizationName}
                readOnly
                disabled
              />

              <Input
                label="Contact Phone"
                value={form.contactPhone}
                onChange={handleContactPhoneChange}
                onKeyDown={blockNonNumericKeys}
                inputMode="numeric"
                maxLength={10}
                placeholder="Enter 10-digit number"
              />

              <Input
                label="People Count"
                type="text"
                value={form.peopleCount}
                onChange={handlePeopleCountChange}
                onKeyDown={blockInvalidPeopleCountKeys}
                inputMode="numeric"
                placeholder="Enter people count"
              />

              <Select
                label="Urgency Level"
                value={form.urgencyLevel}
                onChange={(e) => updateField("urgencyLevel", e.target.value)}
                options={["LOW", "MEDIUM", "HIGH"]}
              />

              <div className="relative" ref={calendarRef}>
                <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.18em] text-[#3f4948]">
                  Needed Before
                </label>

                <button
                  type="button"
                  onClick={() => setCalendarOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between rounded-full border-none bg-[#e4e9e9] px-5 py-4 text-left text-lg text-[#171d1d] outline-none ring-0 focus:ring-2 focus:ring-[#003331]/20"
                >
                  <span>
                    {form.neededBefore
                      ? format(new Date(form.neededBefore), "MM / dd / yyyy")
                      : "mm / dd / yyyy"}
                  </span>
                  <span className="material-symbols-outlined text-[#707978]">
                    calendar_today
                  </span>
                </button>

                {calendarOpen && (
                  <div className="absolute left-0 top-[calc(100%+12px)] z-50 rounded-[24px] bg-[#2a2a38] p-4 shadow-2xl">
                    <DayPicker
                      mode="single"
                      selected={selectedNeededBeforeDate}
                      onSelect={(date) => {
                        if (!date) return;
                        updateField("neededBefore", format(date, "yyyy-MM-dd"));
                        setCalendarOpen(false);
                      }}
                      disabled={{ before: tomorrowDate }}
                      showOutsideDays
                      className="text-white"
                      classNames={{
                        months: "flex flex-col",
                        month: "space-y-4",
                        caption: "flex justify-center items-center relative mb-2",
                        caption_label: "text-white text-lg font-semibold",
                        nav: "flex items-center gap-2",
                        nav_button:
                          "h-8 w-8 bg-transparent text-white hover:bg-white/10 rounded-md",
                        table: "w-full border-collapse",
                        head_row: "flex",
                        head_cell:
                          "w-10 h-10 text-sm font-medium text-slate-300 flex items-center justify-center",
                        row: "flex w-full",
                        cell: "h-10 w-10 text-center text-sm p-0 relative",
                        day: "h-10 w-10 rounded-xl text-sm font-medium text-white hover:bg-cyan-500/20 transition",
                        day_selected:
                          "bg-cyan-500 text-white ring-2 ring-cyan-400",
                        day_today:
                          "border border-cyan-400 text-cyan-300",
                        day_outside: "text-slate-500",
                        day_disabled:
                          "text-slate-600 opacity-30 cursor-not-allowed hover:bg-transparent",
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <TextArea
                  label="Delivery Address"
                  rows={4}
                  value={form.location.address}
                  onChange={(e) => updateAddress(e.target.value)}
                  placeholder="Full street address, city, and zip code"
                />
              </div>
            </div>
          </section>

          <section className="rounded-[32px] bg-white p-7 shadow-xl shadow-teal-900/5">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e4e9e9] text-[#003331]">
                <span className="material-symbols-outlined">inventory_2</span>
              </div>
              <h3 className="text-2xl font-bold text-[#171d1d]">Resource Catalog</h3>
            </div>

            <div className="space-y-4">
              {form.requestedItems.map((item, index) => (
                <div
                  key={index}
                  className="rounded-[28px] border border-[#bfc8c7]/20 bg-[#eff5f5] p-5"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#171d1d]">
                        {item.itemName?.trim() || `Item ${index + 1}`}
                      </p>
                      <p className="text-xs uppercase tracking-[0.18em] text-[#3f4948]/70">
                        Request manifest
                      </p>
                      {item.maxAvailable !== null && item.maxAvailable !== undefined && (
                        <p className="mt-1 text-xs font-semibold text-[#004b49]">
                          Available: {item.maxAvailable} {item.unit}
                        </p>
                      )}
                    </div>

                    {form.requestedItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="rounded-full p-2 text-red-600 transition hover:bg-red-50"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-4">
                    <Input
                      label="Item Name"
                      value={item.itemName}
                      readOnly
                      disabled
                      placeholder="e.g. Rice"
                    />

                    <Input
                      label="Quantity"
                      type="text"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", e.target.value)}
                      onKeyDown={blockInvalidQuantityKeys}
                      inputMode="numeric"
                      placeholder="Enter quantity"
                    />

                    <Input
                      label="Unit"
                      value={item.unit}
                      readOnly
                      disabled
                      placeholder="kg, boxes..."
                    />

                    <Input
                      label="Category"
                      value={item.category}
                      readOnly
                      disabled
                      placeholder="Dry Goods"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <label className="mb-2 block text-sm font-extrabold uppercase tracking-[0.18em] text-[#3f4948]">
                Dietary Needs
              </label>

              <div className="flex flex-col gap-3 md:flex-row">
                <input
                  value={dietInput}
                  onChange={(e) => setDietInput(e.target.value)}
                  placeholder="Vegetarian, Halal, Diabetic..."
                  className="flex-1 rounded-full border-none bg-[#e4e9e9] px-5 py-4 text-sm outline-none ring-0 focus:ring-2 focus:ring-[#003331]/20"
                />
                <button
                  type="button"
                  onClick={addDiet}
                  className="rounded-full bg-gradient-to-r from-[#003331] to-[#004b49] px-6 py-4 font-bold text-white shadow-lg shadow-teal-900/10"
                >
                  Add Need
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {form.dietaryNeeds.map((need) => (
                  <span
                    key={need}
                    className="inline-flex items-center gap-2 rounded-full bg-[#a5ede3]/40 px-4 py-2 text-sm font-semibold text-[#004b49]"
                  >
                    {need}
                    <button type="button" onClick={() => removeDiet(need)}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <TextArea
                label="Notes"
                rows={5}
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder="Add any special distribution notes"
              />
            </div>
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-gradient-to-r from-[#003331] to-[#004b49] px-10 py-5 text-xl font-bold text-white shadow-2xl shadow-teal-900/10 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Official Request"}
            </button>
          </div>
        </form>

        <aside className="space-y-6">
          <div className="rounded-[32px] bg-white p-7 shadow-xl shadow-teal-900/5">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-[#171d1d]">Live Summary</h3>
              <span className="rounded-full bg-[#a5ede3]/60 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#004b49]">
                Draft Mode
              </span>
            </div>

            <div className="space-y-5">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#3f4948]/70">
                  Requesting For
                </p>
                <p className="mt-2 text-xl font-bold text-[#171d1d]">
                  {form.organizationName || "—"}
                </p>
                <p className="mt-1 text-sm text-[#3f4948]">
                  {form.location.address || "Address not fully specified"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-y border-[#bfc8c7]/20 py-5">
                <SummaryStat label="People Served" value={form.peopleCount || 0} />
                <SummaryStat label="Urgency" value={form.urgencyLevel} />
              </div>

              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#3f4948]/70">
                  Request Manifest
                </p>
                <div className="mt-3 space-y-2">
                  {form.requestedItems.filter((item) => item.itemName.trim()).length === 0 ? (
                    <p className="text-sm text-[#3f4948]">No items added yet</p>
                  ) : (
                    form.requestedItems
                      .filter((item) => item.itemName.trim())
                      .map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="font-medium text-[#171d1d]">{item.itemName}</span>
                          <span className="font-bold text-[#003331]">
                            {item.quantity}
                            {item.unit}
                          </span>
                        </div>
                      ))
                  )}
                </div>

                <div className="mt-3 h-1.5 rounded-full bg-[#dee3e3]">
                  <div
                    className="h-full rounded-full bg-[#003331]"
                    style={{
                      width: `${Math.min(itemCount * 20, 100)}%`,
                    }}
                  />
                </div>
                <p className="mt-2 text-right text-xs text-[#3f4948]">
                  {itemCount} item{itemCount !== 1 ? "s" : ""} total
                </p>
              </div>

              <div className="rounded-[28px] bg-[#eff5f5] p-5">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#3f4948]/70">
                  Target Date
                </p>
                <p className="mt-2 text-lg font-bold text-[#003331]">
                  {form.neededBefore || "No date selected"}
                </p>
              </div>

              <div className="rounded-[28px] bg-[#eff5f5] p-6 text-center">
                <button
                  type="button"
                  className="rounded-full bg-gradient-to-r from-[#003331] to-[#004b49] px-8 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white"
                >
                  Pin Location
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] bg-gradient-to-br from-[#003331] to-[#004b49] p-7 text-white shadow-xl shadow-teal-900/10">
            <h3 className="text-2xl font-bold">Request Metrics</h3>
            <div className="mt-6 space-y-4">
              <MetricRow label="Items Added" value={itemCount} />
              <MetricRow label="Total Units" value={totalUnits} />
              <MetricRow label="Dietary Tags" value={form.dietaryNeeds.length} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.18em] text-[#3f4948]">
        {label}
      </label>
      <input
        {...props}
        className="w-full rounded-full border-none bg-[#e4e9e9] px-5 py-4 text-lg text-[#171d1d] outline-none ring-0 focus:ring-2 focus:ring-[#003331]/20 disabled:cursor-not-allowed disabled:text-[#171d1d] disabled:opacity-100"
      />
    </div>
  );
}

function TextArea({ label, ...props }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.18em] text-[#3f4948]">
        {label}
      </label>
      <textarea
        {...props}
        className="w-full rounded-[28px] border-none bg-[#e4e9e9] px-5 py-4 text-lg text-[#171d1d] outline-none ring-0 focus:ring-2 focus:ring-[#003331]/20"
      />
    </div>
  );
}

function Select({ label, options, ...props }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.18em] text-[#3f4948]">
        {label}
      </label>
      <select
        {...props}
        className="w-full rounded-full border-none bg-[#e4e9e9] px-5 py-4 text-lg text-[#171d1d] outline-none ring-0 focus:ring-2 focus:ring-[#003331]/20"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function SummaryStat({ label, value }) {
  return (
    <div>
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#3f4948]/70">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black text-[#003331]">{value}</p>
    </div>
  );
}

function MetricRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
      <span className="font-medium text-teal-100">{label}</span>
      <span className="text-xl font-black">{value}</span>
    </div>
  );
}