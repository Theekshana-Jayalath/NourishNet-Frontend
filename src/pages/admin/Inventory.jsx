import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import axios from "../../api/axiosInstance";
// local images
import riceImg from '../../assets/rice.png';
import dhalImg from '../../assets/dhal.png';
import flourImg from '../../assets/flour.png';
import sugarImg from '../../assets/sugar.png';
import saltImg from '../../assets/salt.png';
import milkPowderImg from '../../assets/milkPowder.png';
import vegCurryImg from '../../assets/vegitableCurry.png';
import fishCurryImg from '../../assets/fishCurry.png';
import chickenFriedRiceImg from '../../assets/chickenFriedRice.png';
import eggSandwichImg from '../../assets/eggSandwich.png';

// items will be loaded from backend donationForms collection
const sampleItems = [];

const FoodItemsBoard = () => {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");

  // (read-only) no selection or add controls in Inventory view
  const [items, setItems] = useState(sampleItems);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // simple helper to generate an image URL based on product name using Unsplash source
  const localImageMap = [
    { keywords: ['rice'], img: riceImg },
    { keywords: ['dhal', 'dal', 'lentil'], img: dhalImg },
    { keywords: ['flour'], img: flourImg },
    { keywords: ['sugar'], img: sugarImg },
    { keywords: ['salt'], img: saltImg },
    { keywords: ['milk', 'powder'], img: milkPowderImg },
    { keywords: ['veg', 'vegetable', 'vegitable'], img: vegCurryImg },
    { keywords: ['fish'], img: fishCurryImg },
    { keywords: ['chicken'], img: chickenFriedRiceImg },
    { keywords: ['egg'], img: eggSandwichImg },
  ];

  const imageForName = (name) => {
    const n = (name || '').toLowerCase();
    // prefer longer/more specific keywords first
    const sorted = [...localImageMap].sort((a, b) => {
      const aMax = Math.max(...a.keywords.map((k) => k.length));
      const bMax = Math.max(...b.keywords.map((k) => k.length));
      return bMax - aMax;
    });

    for (const entry of sorted) {
      for (const k of entry.keywords) {
        // match whole words where possible
        try {
          const re = new RegExp(`\\b${k.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, 'i');
          if (re.test(n)) return entry.img;
        } catch (e) {
          // fallback to substring match if regex fails for some keyword
          if (n.includes(k)) return entry.img;
        }
      }
    }

    const query = encodeURIComponent(name || 'food');
    return `https://source.unsplash.com/featured/?${query},food`;
  };

  useEffect(() => {
    let mounted = true;

  async function loadDonations() {
      setLoading(true);
      try {
  const res = await axios.get('/donationForms');
        setError(null);
        // backend returns { count, data } — support that shape, and also support direct array
        const payload = res.data;
        const forms = Array.isArray(payload)
          ? payload
          : (payload && payload.data) || [];

        // Aggregate items by productId or name so repeated donations of the same product
        // are shown as a single row with summed total quantity but also keep a list
        // of per-donation entries (qty, submitDate, expireDate) so admin can see
        // each donor's contribution separately.
        const agg = {};

        forms.forEach((form) => {
          const itemsList = (form.items && form.items.length)
            ? form.items
            : [{ name: null, productId: null, qty: 1, unit: 'pcs', notes: form.notes, expireDate: form.expireDate }];

          const submitDate = form.createdAt || form.submittedAt || form.submittedOn || form.date || null;
          const donorName = form.donorName || form.name || form.fullName || null;

          itemsList.forEach((it) => {
            const rawName = it.name || it.productName || null;
            const code = it.productId || null;
            const name = rawName || (code ? `Product ${code}` : (donorName || 'Donation Item'));
            const key = String(code || rawName || name).toLowerCase().trim();
            const qty = Number(it.quantity || it.qty || 1) || 0;
            const unit = it.unit || 'pcs';
            const expireDate = it.expirationDate || it.expireDate || form.expirationDate || form.expireDate || null;

            if (!agg[key]) {
              agg[key] = {
                id: key,
                name,
                description: it.notes || form.notes || '',
                totalQuantity: qty,
                unit,
                type: form.donationType || 'Unprocessed',
                image: imageForName(name),
                // entries: per-donation contributions
                entries: [
                  {
                    donor: donorName,
                    qty,
                    unit,
                    submitDate,
                    expireDate,
                    formId: form._id,
                  },
                ],
              };
            } else {
              agg[key].totalQuantity = (agg[key].totalQuantity || 0) + qty;
              // push the specific donation entry
              agg[key].entries.push({ donor: donorName, qty, unit, submitDate, expireDate, formId: form._id });
            }
          });
        });

        const boardItems = Object.values(agg).map((it) => {
          // sort entries by submitDate (earliest first)
          it.entries = (it.entries || []).sort((a, b) => {
            if (!a.submitDate) return 1;
            if (!b.submitDate) return -1;
            return new Date(a.submitDate) - new Date(b.submitDate);
          });
          return it;
        });

  if (mounted) setItems(boardItems);
      } catch (err) {
        // fallback: keep items empty and log for debugging
        console.error('Failed to load donation forms', err);
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

  const filteredItems = items.filter((item) => {
    const matchSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchType =
      filterType === "All" || item.type === filterType;

  return matchSearch && matchType;
  });

  return (
    <div className="p-6 bg-teal-50 rounded-3xl shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-teal-900">
          Available Food Items
        </h1>

        {/* Search */}
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

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select
          className="border rounded-lg px-4 py-2"
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Processed">Processed</option>
          <option value="Unprocessed">Unprocessed</option>
        </select>

  {/* date filter removed per request */}
      </div>

      {/* Items Grid */}
      {loading && <div className="text-sm text-gray-600 mb-4">Loading donations…</div>}
      {error && (
        <div className="text-sm text-red-600 mb-4">
          Failed to load donations: {error}. <button className="underline" onClick={() => {
            setError(null); setItems([]); setReloadKey(k => k + 1);
          }}>Retry</button>
        </div>
      )}
  {/* debug payload removed */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full table-auto">
          <thead className="bg-teal-50 text-left">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Unit</th>
              <th className="px-4 py-3">Total Quantity</th>
              <th className="px-4 py-3">Donations (qty / submit / expire)</th>
            </tr>
          </thead>

          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-3 align-top">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-16 h-12 object-cover rounded" />
                    <div>
                      <div className="font-semibold text-teal-900">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.description}</div>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3 align-top">
                  <div className="text-sm">{item.type || 'Unprocessed'}</div>
                </td>

                <td className="px-4 py-3 align-top">{item.unit || 'pcs'}</td>

                <td className="px-4 py-3 align-top font-semibold">{item.totalQuantity || 0}</td>

                <td className="px-4 py-3 align-top">
                  <div className="space-y-2">
                    {(item.entries || []).map((e, idx) => (
                      <div key={idx} className="text-sm border rounded px-3 py-2 bg-gray-50">
                        <div className="text-sm">
                          <span className="font-semibold">{e.qty}</span> {e.unit}
                          {e.donor ? <span className="ml-2 text-gray-600">by {e.donor}</span> : null}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          <span>Submitted: {e.submitDate ? new Date(e.submitDate).toLocaleDateString() : '—'}</span>
                          <span className="mx-2">|</span>
                          <span>Expire: {e.expireDate ? new Date(e.expireDate).toLocaleDateString() : '—'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FoodItemsBoard;
