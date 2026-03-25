import { useMemo, useState } from "react";
import { createRequest } from "../api";

export default function Request({ showToast, setActiveTab }) {
  const [form, setForm] = useState({
    organizationName: "",
    contactPhone: "",
    peopleCount: "",
    urgencyLevel: "MEDIUM",
    neededBefore: "",
    location: { address: "" },
    requestedItems: [{ itemName: "", quantity: 1, unit: "kg", category: "" }],
    dietaryNeeds: [],
    notes: "",
  });

  const [dietInput, setDietInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const itemCount = useMemo(
    () => form.requestedItems.filter((item) => item.itemName.trim()).length,
    [form.requestedItems]
  );

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
      next[index] = { ...next[index], [field]: value };
      return { ...prev, requestedItems: next };
    });
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      requestedItems: [
        ...prev.requestedItems,
        { itemName: "", quantity: 1, unit: "kg", category: "" },
      ],
    }));
  };

  const removeItem = (index) => {
    setForm((prev) => ({
      ...prev,
      requestedItems: prev.requestedItems.filter((_, i) => i !== index),
    }));
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

  const submit = async (e) => {
    e.preventDefault();

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
        organizationName: "",
        contactPhone: "",
        peopleCount: "",
        urgencyLevel: "MEDIUM",
        neededBefore: "",
        location: { address: "" },
        requestedItems: [{ itemName: "", quantity: 1, unit: "kg", category: "" }],
        dietaryNeeds: [],
        notes: "",
      });

      setTimeout(() => setActiveTab("history"), 700);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid xl:grid-cols-[1.5fr_0.9fr] gap-6">
      <form onSubmit={submit} className="bg-white rounded-3xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Request Form</h2>
          <button
            type="button"
            onClick={addItem}
            className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-700 font-semibold"
          >
            + Add Item
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Organization Name" value={form.organizationName} onChange={(e) => updateField("organizationName", e.target.value)} />
          <Input label="Contact Phone" value={form.contactPhone} onChange={(e) => updateField("contactPhone", e.target.value)} />
          <Input label="People Count" type="number" value={form.peopleCount} onChange={(e) => updateField("peopleCount", e.target.value)} />
          <Select label="Urgency Level" value={form.urgencyLevel} onChange={(e) => updateField("urgencyLevel", e.target.value)} options={["LOW", "MEDIUM", "HIGH"]} />
          <Input label="Needed Before" type="date" value={form.neededBefore} onChange={(e) => updateField("neededBefore", e.target.value)} />

          <div className="md:col-span-2">
            <Input label="Address" value={form.location.address} onChange={(e) => updateAddress(e.target.value)} />
          </div>
        </div>

        <div className="mt-8">
          <h3 className="font-semibold text-slate-800 mb-4">Requested Items</h3>

          <div className="space-y-4">
            {form.requestedItems.map((item, index) => (
              <div key={index} className="grid md:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border">
                <Input label="Item Name" value={item.itemName} onChange={(e) => updateItem(index, "itemName", e.target.value)} />
                <Input label="Quantity" type="number" value={item.quantity} onChange={(e) => updateItem(index, "quantity", e.target.value)} />
                <Input label="Unit" value={item.unit} onChange={(e) => updateItem(index, "unit", e.target.value)} />
                <div>
                  <Input label="Category" value={item.category} onChange={(e) => updateItem(index, "category", e.target.value)} />
                  {form.requestedItems.length > 1 && (
                    <button type="button" onClick={() => removeItem(index)} className="mt-2 text-sm text-red-600 font-medium">
                      Remove item
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Dietary Needs</label>

          <div className="flex gap-3">
            <input
              value={dietInput}
              onChange={(e) => setDietInput(e.target.value)}
              placeholder="Vegetarian, Halal, Diabetic..."
              className="flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <button type="button" onClick={addDiet} className="px-4 py-3 rounded-xl bg-emerald-600 text-white font-semibold">
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {form.dietaryNeeds.map((need) => (
              <span key={need} className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                {need}
                <button type="button" onClick={() => removeDiet(need)}>×</button>
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Notes</label>
          <textarea
            rows="5"
            value={form.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="Add any special information"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-8 w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold py-4"
        >
          {submitting ? "Submitting..." : "Submit Request"}
        </button>
      </form>

      <div className="bg-white rounded-3xl shadow-lg p-6 h-fit">
        <h2 className="text-xl font-bold text-slate-800 mb-5">Live Summary</h2>

        <div className="space-y-4">
          <SummaryRow label="Organization" value={form.organizationName || "—"} />
          <SummaryRow label="Urgency" value={form.urgencyLevel} />
          <SummaryRow label="People Count" value={form.peopleCount || 0} />
          <SummaryRow label="Address" value={form.location.address || "—"} />
          <SummaryRow label="Items Added" value={itemCount} />
          <SummaryRow label="Needed Before" value={form.neededBefore || "—"} />
        </div>
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
      <input {...props} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400" />
    </div>
  );
}

function Select({ label, options, ...props }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
      <select {...props} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400">
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between items-center rounded-2xl bg-slate-50 border px-4 py-3">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-800 text-right">{value}</span>
    </div>
  );
}