import React, { useEffect, useMemo, useState } from "react";
import { Search, PlusCircle } from "lucide-react";
import { getDonationForms } from "../api";

// local images
import riceImg from "../assets/rice.png";
import dhalImg from "../assets/dhal.png";
import flourImg from "../assets/flour.png";
import sugarImg from "../assets/sugar.png";
import saltImg from "../assets/salt.png";
import milkPowderImg from "../assets/milkPowder.png";
import vegCurryImg from "../assets/vegitableCurry.png";
import fishCurryImg from "../assets/fishCurry.png";
import chickenFriedRiceImg from "../assets/chickenFriedRice.png";
import eggSandwichImg from "../assets/eggSandwich.png";

// items will be loaded from backend donationForms collection
const sampleItems = [];

const FoodItemsBoard = ({ onSelectItem, selectedItems = [] }) => {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");

  // UI state for selecting a quantity when adding an item
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedQty, setSelectedQty] = useState(1);

  // store confirmation messages per-item so they show only on the relevant card
  const [messages, setMessages] = useState({});
  const [items, setItems] = useState(sampleItems);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  // local optimistic quantities added from this component (id -> qty)
  const [localAdded, setLocalAdded] = useState({});

  const localImageMap = [
    { keywords: ["rice"], img: riceImg },
    { keywords: ["dhal", "dal", "lentil"], img: dhalImg },
    { keywords: ["flour"], img: flourImg },
    { keywords: ["sugar"], img: sugarImg },
    { keywords: ["salt"], img: saltImg },
    { keywords: ["milk", "powder"], img: milkPowderImg },
    { keywords: ["veg", "vegetable", "vegitable"], img: vegCurryImg },
    { keywords: ["fish"], img: fishCurryImg },
    { keywords: ["chicken"], img: chickenFriedRiceImg },
    { keywords: ["egg"], img: eggSandwichImg },
  ];

  const imageForName = (name) => {
    const n = (name || "").toLowerCase();

    const sorted = [...localImageMap].sort((a, b) => {
      const aMax = Math.max(...a.keywords.map((k) => k.length));
      const bMax = Math.max(...b.keywords.map((k) => k.length));
      return bMax - aMax;
    });

    for (const entry of sorted) {
      for (const k of entry.keywords) {
        try {
          const re = new RegExp(
            `\\b${k.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`,
            "i"
          );
          if (re.test(n)) return entry.img;
        } catch {
          if (n.includes(k)) return entry.img;
        }
      }
    }

    const query = encodeURIComponent(name || "food");
    return `https://source.unsplash.com/featured/?${query},food`;
  };

  useEffect(() => {
    let mounted = true;

    async function loadDonations() {
      setLoading(true);
      try {
        // use centralized helper which calls the configured backend BASE_URL
        const payload = await getDonationForms();
        setError(null);
  const forms = Array.isArray(payload) ? payload : (payload && payload.data) || [];

        const agg = {};

        forms.forEach((form) => {
          const itemsList =
            form.items && form.items.length
              ? form.items
              : [
                  {
                    name: null,
                    productId: null,
                    qty: 1,
                    unit: "pcs",
                    notes: form.notes,
                    expireDate: form.expireDate,
                  },
                ];

          itemsList.forEach((it) => {
            const rawName = it.name || it.productName || null;
            const code = it.productId || null;
            const name = rawName || (code ? `Product ${code}` : form.donorName || "Donation Item");
            const key = String(code || rawName || name).toLowerCase().trim();
            const qty = Number(it.qty || it.quantity || 1) || 0;

            if (!agg[key]) {
              agg[key] = {
                id: key,
                name,
                description: it.notes || form.notes || "",
                quantity: qty,
                unit: it.unit || "pcs",
                type: form.donationType || "Unprocessed",
                expireDate: it.expireDate || form.expireDate || "",
                image: imageForName(name),
                rawForms: [form],
              };
            } else {
              agg[key].quantity = (agg[key].quantity || 0) + qty;

              if (it.expireDate) {
                const prev = agg[key].expireDate;
                agg[key].expireDate = prev
                  ? it.expireDate < prev
                    ? it.expireDate
                    : prev
                  : it.expireDate;
              }

              if (!agg[key].rawForms.find((f) => f._id === form._id)) {
                agg[key].rawForms.push(form);
              }
            }
          });
        });

        const boardItems = Object.values(agg);

        if (mounted) setItems(boardItems);
      } catch (err) {
        console.error("Failed to load donation forms", err);
        setError(err.message || String(err));
        setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDonations();

    return () => {
      mounted = false;
    };
  }, [reloadKey]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === "All" || item.type === filterType;
      return matchSearch && matchType;
    });
  }, [items, search, filterType]);

  const getSelectedQuantityFromParent = (itemName) => {
    const found = selectedItems.find(
      (selected) => selected.itemName?.toLowerCase() === itemName.toLowerCase()
    );
    return found ? Number(found.quantity || 0) : 0;
  };

  // compute available quantity for a given item id/name
  const availableFor = (item) => {
    const base = Number(item.quantity || 0);
    const parentSelected = getSelectedQuantityFromParent(item.name || item.id || '');
    const locallyAdded = Number(localAdded[item.id] || 0);
    return Math.max(0, base - parentSelected - locallyAdded);
  };

  // when parent selectedItems changes, clear optimistic local additions to avoid double-counting
  useEffect(() => {
    setLocalAdded({});
  }, [selectedItems]);

  return (
    <div className="p-6 bg-teal-50 rounded-3xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-teal-900">Available Food Items</h1>

        <div className="relative">
          <Search className="absolute left-3 top-3 text-teal-500" />
          <input
            type="text"
            placeholder="Search items..."
            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <select
          className="border rounded-lg px-4 py-2"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Processed">Processed</option>
          <option value="Unprocessed">Unprocessed</option>
        </select>
      </div>

      {loading && <div className="text-sm text-gray-600 mb-4">Loading donations…</div>}

      {error && (
        <div className="text-sm text-red-600 mb-4">
          Failed to load donations: {error}.{" "}
          <button
            className="underline"
            onClick={() => {
              setError(null);
              setItems([]);
              setReloadKey((k) => k + 1);
            }}
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const parentSelectedQty = getSelectedQuantityFromParent(item.name);

          return (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-md overflow-hidden border hover:shadow-lg transition"
            >
              <img
                src={item.image}
                alt={item.name}
                className="h-40 w-full object-cover"
              />

              <div className="p-4">
                <h2 className="text-lg font-semibold text-teal-900">{item.name}</h2>

                <p className="text-sm text-gray-500">{item.description}</p>

                <div className="mt-3 space-y-1 text-sm">
                  <p>
                    <span className="font-semibold">Quantity:</span> {availableFor(item)} {item.unit}
                  </p>

                  <p>
                    <span className="font-semibold">Type:</span>{" "}
                    <span
                      className={`px-2 py-1 rounded text-white text-xs ${
                        item.type === "Processed" ? "bg-teal-700" : "bg-teal-500"
                      }`}
                    >
                      {item.type}
                    </span>
                  </p>
                </div>

                <div className="mt-4">
                  {availableFor(item) > 0 ? (
                    <button
                      className="w-full flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-900 text-white py-2 rounded-lg"
                      onClick={() => {
                        setSelectedItemId(item.id);
                        setSelectedQty(1);
                      }}
                    >
                      <PlusCircle size={18} />
                      Add
                    </button>
                  ) : (
                    <button className="w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-600 py-2 rounded-lg" disabled>
                      Out of stock
                    </button>
                  )}

                  {selectedItemId === item.id && (
                    <div className="mt-3 flex items-center gap-2">
                      <select
                        className="border rounded-lg px-3 py-2"
                        value={selectedQty}
                        onChange={(e) => setSelectedQty(Number(e.target.value))}
                      >
                        {Array.from({ length: Math.max(1, availableFor(item)) }, (_, i) => i + 1)
                          .slice(0, availableFor(item))
                          .map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                      </select>

                      <button
                        className="bg-green-600 hover:bg-green-800 text-white px-4 py-2 rounded-lg"
                        onClick={() => {
                          // prevent confirming if nothing available
                          const available = availableFor(item);
                          if (available <= 0) return;

                          onSelectItem?.({
                            id: item.id,
                            name: item.name,
                            quantity: selectedQty,
                            unit: item.unit,
                            type: item.type,
                            description: item.description,
                            image: item.image,
                            maxAvailable: available,
                          });

                          // optimistic local update until parent reflects change
                          setLocalAdded((prev) => ({
                            ...prev,
                            [item.id]: (prev[item.id] || 0) + Number(selectedQty),
                          }));

                          setMessages((prev) => ({
                            ...prev,
                            [item.id]: `${selectedQty} ${item.unit} of ${item.name} selected.`,
                          }));

                          setSelectedItemId(null);
                        }}
                      >
                        Confirm
                      </button>

                      <button
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded-lg"
                        onClick={() => setSelectedItemId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {messages[item.id] && (
                    <p className="mt-2 text-sm text-green-700">{messages[item.id]}</p>
                  )}

                  {parentSelectedQty > 0 && (
                    <p className="mt-2 text-sm text-green-700">
                      Added in request: {parentSelectedQty} {item.unit}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FoodItemsBoard;