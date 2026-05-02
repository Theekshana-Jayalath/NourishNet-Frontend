import React, { useEffect, useState } from "react";
import { Search, Package, Calendar, User, AlertCircle, RefreshCw, Clock, TrendingUp } from "lucide-react";
import axios from "../../api/axiosInstance";
import { getDonationForms } from "../../api";
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

const FoodItemsBoard = () => {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

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
    const sorted = [...localImageMap].sort((a, b) => {
      const aMax = Math.max(...a.keywords.map((k) => k.length));
      const bMax = Math.max(...b.keywords.map((k) => k.length));
      return bMax - aMax;
    });

    for (const entry of sorted) {
      for (const k of entry.keywords) {
        try {
          const re = new RegExp(`\\b${k.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, 'i');
          if (re.test(n)) return entry.img;
        } catch (e) {
          if (n.includes(k)) return entry.img;
        }
      }
    }
    return `https://source.unsplash.com/featured/?${encodeURIComponent(name || 'food')},food`;
  };

  useEffect(() => {
    let mounted = true;

    async function loadDonations() {
      setLoading(true);
      try {
  const payload = await getDonationForms();
  setError(null);
        const forms = Array.isArray(payload) ? payload : (payload && payload.data) || [];

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
                entries: [{
                  donor: donorName,
                  qty,
                  unit,
                  submitDate,
                  expireDate,
                  formId: form._id,
                }],
              };
            } else {
              agg[key].totalQuantity = (agg[key].totalQuantity || 0) + qty;
              agg[key].entries.push({ donor: donorName, qty, unit, submitDate, expireDate, formId: form._id });
            }
          });
        });

        const boardItems = Object.values(agg).map((it) => {
          it.entries = (it.entries || []).sort((a, b) => {
            if (!a.submitDate) return 1;
            if (!b.submitDate) return -1;
            return new Date(b.submitDate) - new Date(a.submitDate);
          });
          return it;
        });

        if (mounted) setItems(boardItems);
      } catch (err) {
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
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "All" || item.type === filterType;
    return matchSearch && matchType;
  });

  const getTypeBadge = (type) => {
    const normalized = (type || 'Unprocessed').toLowerCase();
    if (normalized === 'processed') {
      return 'bg-green-100 text-green-700';
    }
    return 'bg-amber-100 text-amber-700';
  };

  const isExpiringSoon = (expireDate) => {
    if (!expireDate) return false;
    const today = new Date();
    const expire = new Date(expireDate);
    const diffDays = Math.ceil((expire - today) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-teal-900">Food Inventory</h1>
          <p className="text-slate-500 text-sm mt-1">Manage donated food items</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search items..."
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-300 w-64 bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setReloadKey(k => k + 1)}
            className="p-2 rounded-lg border border-slate-200 bg-white text-teal-600 hover:bg-teal-50 transition-colors"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex gap-2">
          {['All', 'Processed', 'Unprocessed'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterType === type
                  ? 'bg-teal-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="text-sm text-slate-500">
          {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="inline-flex items-center gap-2 text-slate-500">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-teal-500 border-t-transparent"></div>
            <span>Loading inventory...</span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
          <button
            onClick={() => { setError(null); setReloadKey(k => k + 1); }}
            className="px-3 py-1 rounded-md bg-red-100 text-red-700 text-sm hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* Items Table */}
      {!loading && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Unit</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Qty</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Donation History</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-slate-400">
                    <Package size={40} className="mx-auto mb-2 text-slate-300" />
                    <p>No food items found</p>
                  </td>
                </tr>
              )}
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Product */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-100"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/48x48?text=Food'; }}
                      />
                      <div>
                        <div className="font-medium text-slate-800">{item.name}</div>
                        {item.description && (
                          <div className="text-xs text-slate-400 truncate max-w-[180px]">{item.description}</div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getTypeBadge(item.type)}`}>
                      {item.type || 'Unprocessed'}
                    </span>
                  </td>

                  {/* Unit */}
                  <td className="px-5 py-4 text-sm text-slate-600">{item.unit || 'pcs'}</td>

                  {/* Total Quantity */}
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center justify-center min-w-[60px] bg-teal-50 text-teal-700 font-semibold px-2 py-1 rounded-lg text-sm">
                      {item.totalQuantity || 0}
                    </span>
                  </td>

                  {/* Donation History - compact list */}
                  <td className="px-5 py-4">
                    <div className="space-y-1.5">
                      {(item.entries || []).slice(0, 3).map((entry, idx) => (
                        <div key={idx} className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-semibold text-teal-600 min-w-[50px]">{entry.qty} {entry.unit}</span>
                          {entry.donor && (
                            <span className="text-slate-400 flex items-center gap-0.5">
                              <User size={10} /> {entry.donor.split(' ')[0]}
                            </span>
                          )}
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500">Submitted: {formatDate(entry.submitDate)}</span>
                          <span className="text-slate-400">•</span>
                          <span className={`${isExpiringSoon(entry.expireDate) ? 'text-amber-600 font-medium' : 'text-slate-500'}`}>
                            Expires: {formatDate(entry.expireDate)}
                            {isExpiringSoon(entry.expireDate) && <span className="ml-1 text-amber-600">⚠️</span>}
                          </span>
                        </div>
                      ))}
                      {(item.entries || []).length > 3 && (
                        <div className="text-xs text-teal-500 mt-1">
                          + {(item.entries.length - 3)} more donation{(item.entries.length - 3) !== 1 ? 's' : ''}
                        </div>
                      )}
                      {(!item.entries || item.entries.length === 0) && (
                        <div className="text-xs text-slate-400 italic">No donations</div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      {!loading && items.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 px-2 py-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <TrendingUp size={14} />
              Total items: {items.length}
            </span>
            <span>
              Total quantity: {items.reduce((sum, item) => sum + (item.totalQuantity || 0), 0)} units
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Expiring soon
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
              Good stock
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodItemsBoard;