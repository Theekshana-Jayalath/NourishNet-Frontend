import { useEffect, useMemo, useState } from "react";
import { getRequests, getRequestById, filterMyRequests } from "../../api";

export default function RequestHistory({ showToast, setActiveTab }) {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [urgencyLevel, setUrgencyLevel] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await getRequests({ page: 1, limit: 100 });
      const allRequests = Array.isArray(res?.items) ? res.items : [];
      const myRequests = filterMyRequests(allRequests);
      setRequests(Array.isArray(myRequests) ? myRequests : []);
    } catch (error) {
      showToast?.(error.message || "Failed to load request history", "error");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return requests.filter((item) => {
      const query = q.trim().toLowerCase();

      const matchesQuery =
        !query ||
        (item.requestId || "").toLowerCase().includes(query) ||
        (item.organizationName || "").toLowerCase().includes(query) ||
        (item.contactPhone || "").toLowerCase().includes(query) ||
        (item.location?.address || "").toLowerCase().includes(query);

      const matchesStatus = !status || item.status === status;
      const matchesUrgency = !urgencyLevel || item.urgencyLevel === urgencyLevel;

      return matchesQuery && matchesStatus && matchesUrgency;
    });
  }, [requests, q, status, urgencyLevel]);

  const stats = useMemo(() => {
    return {
      total: requests.length,
      approved: requests.filter((r) => r.status === "APPROVED").length,
      pending: requests.filter((r) => r.status === "PENDING").length,
      fulfilled: requests.filter((r) => r.status === "FULFILLED").length,
    };
  }, [requests]);

  const handleView = async (id) => {
    try {
      const data = await getRequestById(id);
      setSelected(data);
    } catch (error) {
      showToast?.(error.message || "Failed to load request details", "error");
    }
  };

  const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString();
  };

  const getUrgencyClass = (urgency) => {
    switch (urgency) {
      case "HIGH":
        return "bg-red-100 text-red-700";
      case "MEDIUM":
        return "bg-amber-100 text-amber-700";
      case "LOW":
        return "bg-emerald-100 text-emerald-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusClass = (statusValue) => {
    switch (statusValue) {
      case "APPROVED":
        return "bg-emerald-100 text-emerald-700";
      case "PENDING":
        return "bg-amber-100 text-amber-700";
      case "PARTIALLY_APPROVED":
        return "bg-cyan-100 text-cyan-700";
      case "WAITLISTED":
        return "bg-violet-100 text-violet-700";
      case "FULFILLED":
        return "bg-teal-100 text-teal-700";
      case "REJECTED":
        return "bg-rose-100 text-rose-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-[#003331]">
            Request History
          </h2>
          <p className="mt-2 text-lg text-slate-600">
            Manage and track your active logistics pipeline
          </p>
        </div>

        <div className="rounded-[32px] bg-white p-8 shadow-sm">
          <div className="flex items-center justify-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#003331]" />
            <span className="ml-3 text-slate-600">Loading history...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight text-[#003331]">
              Request History
            </h2>
            <p className="mt-2 text-lg text-slate-600">
              Manage and track your active logistics pipeline
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={loadRequests}
              className="rounded-full bg-slate-200 px-6 py-3 font-bold text-[#003331] transition hover:bg-slate-300"
            >
              Refresh
            </button>
            <button
              onClick={() => setActiveTab?.("request")}
              className="rounded-full bg-gradient-to-r from-[#003331] to-[#004b49] px-6 py-3 font-bold text-white shadow-lg transition hover:opacity-90"
            >
              Create New
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <QuickStatCard title="Total Requests" value={stats.total} />
          <QuickStatCard title="Approved" value={stats.approved} />
          <QuickStatCard title="Pending" value={stats.pending} />
          <QuickStatCard title="Fulfilled" value={stats.fulfilled} />
        </div>

        <div className="rounded-[32px] bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by request ID, organization, phone..."
              className="rounded-full border-none bg-slate-100 px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-[#003331]/20"
            />

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-full border-none bg-slate-100 px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-[#003331]/20"
            >
              <option value="">All Status</option>
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="PARTIALLY_APPROVED">PARTIALLY_APPROVED</option>
              <option value="WAITLISTED">WAITLISTED</option>
              <option value="FULFILLED">FULFILLED</option>
              <option value="REJECTED">REJECTED</option>
            </select>

            <select
              value={urgencyLevel}
              onChange={(e) => setUrgencyLevel(e.target.value)}
              className="rounded-full border-none bg-slate-100 px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-[#003331]/20"
            >
              <option value="">All Urgency</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-[32px] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-left">
                  <th className="px-6 py-5 text-sm font-bold text-[#003331]">
                    Request ID
                  </th>
                  <th className="px-6 py-5 text-sm font-bold text-[#003331]">
                    Organization
                  </th>
                  <th className="px-6 py-5 text-sm font-bold text-[#003331]">
                    People Count
                  </th>
                  <th className="px-6 py-5 text-sm font-bold text-[#003331]">
                    Urgency
                  </th>
                  <th className="px-6 py-5 text-sm font-bold text-[#003331]">
                    Status
                  </th>
                  <th className="px-6 py-5 text-sm font-bold text-[#003331]">
                    Needed Before
                  </th>
                  <th className="px-6 py-5 text-right text-sm font-bold text-[#003331]">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.map((req) => (
                  <tr key={req._id} className="transition hover:bg-slate-50">
                    <td className="px-6 py-5 font-semibold text-[#004b49]">
                      {req.requestId || "—"}
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#003331]/10 text-[#003331] font-bold">
                          {(req.organizationName || "N")[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {req.organizationName || "—"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {req.contactPhone || "No contact"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-slate-700">
                      {req.peopleCount ?? "—"}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getUrgencyClass(
                          req.urgencyLevel
                        )}`}
                      >
                        {req.urgencyLevel || "—"}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                          req.status
                        )}`}
                      >
                        {req.status || "—"}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-slate-700">
                      {formatDate(req.neededBefore)}
                    </td>

                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => handleView(req._id)}
                        className="rounded-full bg-gradient-to-r from-[#003331] to-[#004b49] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center text-slate-500">
                      No request history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-[#003331]">{filtered.length}</span>{" "}
              of{" "}
              <span className="font-semibold text-[#003331]">{requests.length}</span>{" "}
              requests
            </p>

            <button
              onClick={loadRequests}
              className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-[32px] bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#003331]">Request Details</h2>
              <button
                onClick={() => setSelected(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                ×
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Detail label="Request ID" value={selected.requestId} />
              <Detail label="Organization" value={selected.organizationName} />
              <Detail label="Phone" value={selected.contactPhone} />
              <Detail label="People Count" value={selected.peopleCount} />
              <Detail label="Urgency" value={selected.urgencyLevel} />
              <Detail label="Status" value={selected.status} />
              <Detail label="Needed Before" value={formatDate(selected.neededBefore)} />
              <Detail label="Address" value={selected.location?.address || "—"} />
            </div>

            {selected.requestedItems?.length > 0 && (
              <div className="mt-8">
                <h3 className="mb-3 text-lg font-bold text-[#003331]">
                  Requested Items
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {selected.requestedItems.map((item, idx) => (
                    <div key={idx} className="rounded-2xl border bg-slate-50 p-4">
                      <p className="font-semibold text-slate-800">
                        {item.itemName || "Unnamed item"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.quantity || 0} {item.unit || ""}
                        {item.category ? ` • ${item.category}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selected.dietaryNeeds?.length > 0 && (
              <div className="mt-8">
                <h3 className="mb-3 text-lg font-bold text-[#003331]">
                  Dietary Needs
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selected.dietaryNeeds.map((need, index) => (
                    <span
                      key={`${need}-${index}`}
                      className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700"
                    >
                      {need}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selected.notes && (
              <div className="mt-8">
                <h3 className="mb-3 text-lg font-bold text-[#003331]">Notes</h3>
                <div className="rounded-2xl bg-slate-50 p-4 text-slate-700">
                  {selected.notes}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function QuickStatCard({ title, value }) {
  return (
    <div className="rounded-[28px] bg-white p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
        {title}
      </p>
      <h3 className="mt-3 text-4xl font-black text-[#003331]">{value}</h3>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="rounded-2xl border bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-800">{value || "—"}</p>
    </div>
  );
}