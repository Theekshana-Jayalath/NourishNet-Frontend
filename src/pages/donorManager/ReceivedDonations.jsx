import React, { useEffect, useState, useCallback } from "react";
import { BASE_URL, getToken, getUser, getDonationForms, getMyDonationHistory, getUserById } from "../../api";

export default function ReceivedDonations() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [donorsMap, setDonorsMap] = useState({});

  const loadDonor = useCallback(
    async (id) => {
      if (!id || donorsMap[id]) return;

      try {
        const data = await getUserById(id);
        const user = data.data || data.user || data || {};
        const role = (user.role || "").toLowerCase();

        if (role !== "donor") {
          setDonorsMap((m) => ({
            ...m,
            [id]: { _notDonor: true, role: role, name: user.name || user.username || "Unknown" },
          }));
          return;
        }

        setDonorsMap((m) => ({ ...m, [id]: user }));
      } catch (e) {}
    },
    [donorsMap]
  );

  const getDonorIdFromForm = (f) => {
    if (!f) return null;

    if (f.donorId)
      return (f.donorId._id || f.donorId.id || f.donorId).toString();

    if (f.donor)
      return (
        typeof f.donor === "string"
          ? f.donor
          : f.donor._id || f.donor.id || f.donor
      ).toString();

    if (f.createdBy)
      return (f.createdBy._id || f.createdBy.id || f.createdBy).toString();

    return null;
  };

  const extractNameFromForm = (f) => {
    if (!f) return null;
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
        if (id) setDonorsMap((m) => ({ ...m, [id]: current }));
      }

      uniqueIds.forEach((id) => loadDonor(id));
    },
    [loadDonor]
  );

  useEffect(() => {
    const fetchReceived = async () => {
      setLoading(true);
      setError("");

      try {
        const token = getToken();
        const current = getUser();

        if ((current?.role || "").toLowerCase() === "donor") {
          const data = await getMyDonationHistory().catch(e => ({ data: [], message: e?.message }));
          const list = data?.data || data || [];
          const normalized = Array.isArray(list) ? list : [list];
          setItems(normalized);
          prefetchDonors(normalized);
        } else {
          const data = await getDonationForms().catch(e => ({ data: [], message: e?.message }));
          const list = data?.data || data || [];
          const received = Array.isArray(list) ? list.filter((f) => (f.Status || f.status || "").toLowerCase() === "received") : [];
          setItems(received);
          prefetchDonors(received);
        }
      } catch (err) {
        setError(err.message || "Network error");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReceived();
  }, [prefetchDonors]);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-[#004b49] via-[#007864] to-[#36a98a] p-6 text-white shadow-xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-100">
              NourishNet
            </p>

            <h2 className="mt-2 text-3xl font-extrabold">
              Received Donations
            </h2>

            <p className="mt-2 text-sm text-emerald-50">
              View approved and completed donation history.
            </p>
          </div>

          <div className="rounded-2xl bg-white/15 px-6 py-4 backdrop-blur">
            <p className="text-xs uppercase tracking-wide text-emerald-100">
              Total Records
            </p>
            <h3 className="mt-1 text-3xl font-extrabold">
              {items.length}
            </h3>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>

          <p className="font-medium text-slate-600">
            Loading received donations...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
          <p className="font-semibold text-red-600">{error}</p>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl">
            ✅
          </div>

          <h3 className="text-xl font-bold text-slate-700">
            No Received Donations Yet
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Completed donations will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Total Received
              </p>
              <h3 className="mt-2 text-3xl font-extrabold text-emerald-700">
                {items.length}
              </h3>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Status
              </p>
              <h3 className="mt-2 text-3xl font-extrabold text-[#004b49]">
                Completed
              </h3>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Queue Health
              </p>
              <h3 className="mt-2 text-3xl font-extrabold text-emerald-600">
                Good
              </h3>
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {items
              .filter((f) => {
                const donorId = getDonorIdFromForm(f);
                const resolved = donorId ? donorsMap[donorId] : donorsMap[f.donorId || f.donor];
                return !resolved || !resolved._notDonor;
              })
              .map((f) => {
              const id = f.donationFormId || f._id || f.id;

              const donorId = getDonorIdFromForm(f);

              const donor =
                donorId && donorsMap[donorId]
                  ? donorsMap[donorId]
                  : {};

              const completed =
                f.completedAt ||
                f.updatedAt ||
                f.createdAt ||
                "N/A";

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
                              const did = getDonorIdFromForm(f);
                              if (did) loadDonor(did);
                            }}
                          >
                            {donor.name || donor.username || extractNameFromForm(f) || "Anonymous"}
                          </span>
                        </h3>

                        <p className="text-xs text-slate-500">
                          {donor.email || donor.phone || "No contact"}
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                      RECEIVED
                    </span>
                  </div>

                  {/* Date */}
                  <div className="mt-4 rounded-2xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">
                      Completed Date
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {new Date(completed).toLocaleString()}
                    </p>
                  </div>

                  {/* Bottom */}
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="font-mono text-xs text-slate-500">
                      {id}
                    </span>

                    <a
                      href={`/donor-manager/received/${id}`}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
                    >
                      Details
                    </a>
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