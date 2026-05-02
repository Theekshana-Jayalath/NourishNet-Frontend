import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { BASE_URL, getToken, getUser, getDonationForms, getMyPendingDonations } from "../../api";

export default function PendingDonations() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [donorsMap, setDonorsMap] = useState({});

  const loadDonor = useCallback(async (id) => {
  if (!id) return;

    try {
      const token = getToken();

  const res = await fetch(`http://localhost:3000/api/users/${id}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        console.warn('Failed to fetch user', id, res.status);
        setDonorsMap((m) => ({ ...m, [id]: { name: 'Unknown (unreachable)', username: 'unknown', _networkError: true } }));
        return;
      }

      const data = await res.json().catch(() => ({}));
      const user = data.data || data.user || data || {};
      const role = (user.role || "").toLowerCase();

      // Only accept real donors. If the user exists but is not a donor, mark it
      // so forms submitted by non-donor accounts can be filtered out.
      if (role !== "donor") {
        setDonorsMap((m) => ({
          ...m,
          [id]: { _notDonor: true, role: role, name: user.name || user.username || "Unknown" },
        }));
        return;
      }

      setDonorsMap((m) => ({ ...m, [id]: user }));
    } catch (e) {}
  }, []);

  const getDonorIdFromForm = (f) => {
    if (!f) return null;

    if (f.donorId)
      return (f.donorId._id || f.donorId.id || f.donorId).toString();

    if (f.donor) {
      if (typeof f.donor === "string") return f.donor;
      return (f.donor._id || f.donor.id || f.donor).toString();
    }

    if (f.createdBy)
      return (f.createdBy._id || f.createdBy.id || f.createdBy).toString();

    return null;
  };

  const extractNameFromForm = (f) => {
    if (!f) return null;
    // common possible fields where a name might be stored on the form
    return (
      f.donorName ||
      f.submitterName ||
      (f.donor && (f.donor.name || f.donor.username)) ||
      (f.createdBy && (f.createdBy.name || f.createdBy.username)) ||
      null
    );
  };

  const prefetchDonors = useCallback(
    (forms) => {
      const current = getUser();

      if (!Array.isArray(forms)) return;

      const uniqueIds = Array.from(
        new Set(forms.map((f) => getDonorIdFromForm(f)).filter(Boolean))
      );

      if ((current?.role || "").toLowerCase() === "donor") {
        const id = current.id || current._id;

        if (id) {
          setDonorsMap((m) => ({ ...m, [id]: current }));
        }
      }

      uniqueIds.forEach((id) => loadDonor(id));
    },
    [loadDonor]
  );

  const fetchPending = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = getToken();
      const current = getUser();

      if ((current?.role || "").toLowerCase() === "donor") {
        const data = await getMyPendingDonations().catch(e => ({ data: [], message: e?.message }));
        const list = data?.data || data || [];
        setItems(Array.isArray(list) ? list : [list]);
        prefetchDonors(list);
      } else {
        const data = await getDonationForms().catch(e => ({ data: [], message: e?.message }));
        const list = data?.data || data || [];
        const pending = Array.isArray(list) ? list.filter((f) => (f.Status || f.status || "").toLowerCase() === "pending") : [];
        setItems(pending);
        prefetchDonors(pending);
      }
    } catch (err) {
      setError(err.message || "Network error");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [prefetchDonors]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const refresh = async () => {
    setItems([]);
    await fetchPending();
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-[#004b49] via-[#007864] to-[#36a98a] p-6 text-white shadow-xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-100">
              NourishNet
            </p>

            <h2 className="mt-2 text-3xl font-extrabold">
              Pending Donations
            </h2>

            <p className="mt-2 text-sm text-emerald-50">
              Review all pending donor submissions waiting for approval.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={refresh}
              className="rounded-2xl bg-white/15 px-5 py-3 text-sm font-bold backdrop-blur transition hover:bg-white/25"
            >
              Refresh
            </button>

            <Link
              to="/donor-manager/pending/new"
              className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-emerald-700 transition hover:scale-[1.02]"
            >
              + New Donation
            </Link>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
          <p className="font-medium text-slate-600">
            Loading pending donations...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
          <p className="font-semibold text-red-600">{error}</p>

          <button
            onClick={refresh}
            className="mt-4 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-bold text-white hover:bg-emerald-700"
          >
            Try Again
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl">
            📦
          </div>

            <div className="flex gap-3">
              <button
                onClick={refresh}
                className="rounded-2xl bg-white/15 px-4 py-2 text-sm font-bold backdrop-blur flex items-center gap-2 transition hover:bg-white/25"
                title="Refresh pending donations"
              >
                <svg className="h-4 w-4 text-emerald-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-3-6.7" />
                  <polyline points="21 3 21 9 15 9" />
                </svg>
                <span>Refresh</span>
              </button>

              <Link
                to="/donor-manager/pending/new"
                className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-emerald-700 flex items-center gap-2 transition hover:scale-[1.02]"
                title="Create a new donation form"
              >
                <svg className="h-4 w-4 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span>New Donation</span>
              </Link>
            </div>
          <h3 className="text-xl font-bold text-slate-700">
            No Pending Donations
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            All donations are processed right now.
          </p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
              <p className="text-sm text-slate-500">Pending Forms</p>
              <h3 className="mt-2 text-3xl font-extrabold text-[#004b49]">
                {items.length}
              </h3>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
              <p className="text-sm text-slate-500">Waiting Review</p>
              <h3 className="mt-2 text-3xl font-extrabold text-amber-600">
                {items.length}
              </h3>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
              <p className="text-sm text-slate-500">Today Queue</p>
              <h3 className="mt-2 text-3xl font-extrabold text-emerald-600">
                Active
              </h3>
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {items
              .filter((it) => {
                const donorId = getDonorIdFromForm(it);
                const resolved = donorId ? donorsMap[donorId] : donorsMap[it.donorId || it.donor];
                // keep if unresolved (still loading) or resolved as donor. filter out known non-donor submitters
                return !resolved || !resolved._notDonor;
              })
              .map((it) => {
              const id = it.donationFormId || it._id || it.id;

              // determine donor id robustly (handles donorId, donor object/string, createdBy)
              const donorId = getDonorIdFromForm(it);
              const donor = donorId && donorsMap[donorId]
                ? donorsMap[donorId]
                : (donorsMap[it.donorId || it.donor] || {});
              const submitted = it.createdAt
                ? new Date(it.createdAt).toLocaleString()
                : "N/A";

              const itemsList = Array.isArray(it.items)
                ? it.items
                : [];

              return (
                <div
                  key={id}
                  className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Top */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 text-sm font-extrabold text-emerald-700">
                        {(
                          (donor.name ||
                            donor.username ||
                            "D")
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                        ).toUpperCase()}
                      </div>

                              <div>
                                <h3 className="font-bold text-slate-800">
                                  <span
                                    style={{ cursor: donor && donor._networkError ? 'pointer' : 'default' }}
                                    title={donor && donor._networkError ? 'Click to retry loading donor info' : ''}
                                    onClick={() => {
                                      const did = getDonorIdFromForm(it);
                                      if (did) loadDonor(did);
                                    }}
                                  >
                                    {donor.name || donor.username || extractNameFromForm(it) || "Anonymous"}
                                  </span>
                                </h3>

                                <p className="text-xs text-slate-500">
                                  {donor.email || donor.phone || "No contact"}
                                </p>
                              </div>
                    </div>

                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                      PENDING
                    </span>
                  </div>

                  {/* Time */}
                  <div className="mt-4 rounded-2xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">
                      Submitted
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {submitted}
                    </p>
                  </div>

                  {/* Items */}
                  {itemsList.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {itemsList.map((itm, idx) => (
                        <span
                          key={idx}
                          className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                        >
                          {itm.productName ||
                            itm.name ||
                            itm.type ||
                            "Item"}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Bottom */}
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="font-mono text-xs text-slate-500">
                      {id}
                    </span>

                    <Link
                      to={`/donor-manager/pending/${id}`}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}