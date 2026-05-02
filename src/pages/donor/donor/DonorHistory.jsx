import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getUser, getToken, getMyDonationHistory } from "../../api";

const PRODUCT_LABELS = {
  UNP001: "Rice",
  UNP002: "Dhal",
  UNP003: "Milk Powder",
  UNP004: "Flour",
  UNP005: "Sugar",
  UNP006: "Salt",
  PRO001: "Vegetable Curry",
  PRO002: "Chicken Fried Rice",
  PRO003: "Egg Sandwich",
  PRO004: "Fish Curry",
  PRO005: "Dhal Curry (Cooked)",
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
};

const getProductLabel = (productId) => {
  return PRODUCT_LABELS[productId] || productId || "Unknown Product";
};

export default function DonorHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      const user = getUser();
      const donorId = user?._id || user?.id || user?.userId;

      if (!donorId) {
        setError("No logged-in donor found.");
        setLoading(false);
        return;
      }

      try {
        const data = await getMyDonationHistory().catch(e => ({ data: [], message: e?.message }));
        setHistory(data?.data || data || []);
      } catch (err) {
        setError(err.message || "Network error");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredHistory = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    let result = [...history];

    if (term) {
      result = result.filter((form) => {
        const formId = String(form.donationFormId || form._id || "").toLowerCase();

        const matchesItem = (form.items || []).some((item) => {
          const productId = String(item.productId || "").toLowerCase();
          const productLabel = getProductLabel(item.productId).toLowerCase();
          const processingType = String(item.processingType || "").toLowerCase();

          return (
            productId.includes(term) ||
            productLabel.includes(term) ||
            processingType.includes(term)
          );
        });

        return formId.includes(term) || matchesItem;
      });
    }

    result.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime() || 0;
      const timeB = new Date(b.createdAt).getTime() || 0;
      return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [history, searchTerm, sortOrder]);

  const totalForms = history.length;

  const totalItems = history.reduce(
    (sum, form) => sum + (form.items?.length || 0),
    0
  );

  const totalQuantity = history.reduce((sum, form) => {
    return (
      sum +
      (form.items || []).reduce(
        (itemSum, item) => itemSum + (Number(item.quantity) || 0),
        0
      )
    );
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-100 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="relative mb-8 overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-700/90 via-emerald-600/80 to-teal-500/70 opacity-90"></div>

          <div className="relative z-10 p-6 md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-100/80">
                  Donor Dashboard
                </p>

                <h1 className="text-3xl md:text-4xl font-extrabold text-white">
                  Donation History
                </h1>

                <p className="mt-2 text-sm md:text-base text-emerald-50/90 max-w-2xl">
                  View all donation applications that have been received and
                  recorded by the system.
                </p>
              </div>

              <Link
                to="/donor-dashboard"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-bold text-emerald-700 shadow hover:scale-[1.02] transition"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-emerald-100">
            <p className="text-sm font-medium text-slate-500">Received Forms</p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-700">
              {totalForms}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm border border-emerald-100">
            <p className="text-sm font-medium text-slate-500">Total Items</p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-700">
              {totalItems}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm border border-emerald-100">
            <p className="text-sm font-medium text-slate-500">Total Quantity</p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-700">
              {totalQuantity}
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-4 md:p-5 shadow-sm border border-slate-200">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Search by form ID or product
              </label>

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search donation form, Rice, Chicken Fried Rice..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="w-full md:w-56">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Sort by
              </label>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {loading && (
            <div className="rounded-2xl bg-white p-6 text-sm text-slate-600 shadow-sm border border-slate-200">
              Loading history...
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && filteredHistory.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 py-16 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl">
                📦
              </div>

              <h3 className="text-xl font-bold text-slate-700">
                No matching donation history
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Received donations will appear here once they are recorded by the
                system.
              </p>
            </div>
          )}

          {filteredHistory.map((form) => (
            <article
              key={form._id}
              className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white px-6 py-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                        🎁
                      </div>

                      <div>
                        <h2 className="text-lg font-extrabold text-slate-800">
                          {form.donationFormId || form._id}
                        </h2>

                        <p className="text-sm text-slate-500">
                          Submitted on {formatDateTime(form.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-2 md:items-end">
                    <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                      {form.Status}
                    </span>

                    <span className="text-sm text-slate-500">
                      {form.items?.length || 0} item(s)
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {(form.items || []).map((item, index) => (
                    <div
                      key={item._id || index}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 border border-slate-200">
                          Item {index + 1}
                        </span>

                        <span className="text-xs font-semibold text-emerald-700">
                          {item.processingType || "—"}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-800">
                        {getProductLabel(item.productId)}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Product ID: {item.productId || "—"}
                      </p>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-xl bg-white p-3 border border-slate-200">
                          <p className="text-xs text-slate-500">Quantity</p>
                          <p className="mt-1 font-bold text-slate-800">
                            {item.quantity || 0}
                          </p>
                        </div>

                        <div className="rounded-xl bg-white p-3 border border-slate-200">
                          <p className="text-xs text-slate-500">Unit</p>
                          <p className="mt-1 font-bold text-slate-800">
                            {item.unit || "—"}
                          </p>
                        </div>

                        <div className="rounded-xl bg-white p-3 border border-slate-200 col-span-2">
                          <p className="text-xs text-slate-500">Storage Type</p>
                          <p className="mt-1 font-bold text-slate-800">
                            {item.StorageType || "—"}
                          </p>
                        </div>

                        <div className="rounded-xl bg-white p-3 border border-slate-200 col-span-2">
                          <p className="text-xs text-slate-500">
                            Expiration Date
                          </p>
                          <p className="mt-1 font-bold text-slate-800">
                            {item.expirationDate
                              ? formatDateTime(item.expirationDate)
                              : "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}