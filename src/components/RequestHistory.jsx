import { useEffect, useMemo, useState } from "react";
import { getRequests, getRequestById, filterMyRequests } from "../api";

export default function RequestHistory({ showToast }) {
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
      setRequests(filterMyRequests(res.items || []));
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return requests.filter((item) => {
      const matchesQuery =
        !q ||
        item.organizationName?.toLowerCase().includes(q.toLowerCase()) ||
        item.requestId?.toLowerCase().includes(q.toLowerCase());

      const matchesStatus = !status || item.status === status;
      const matchesUrgency = !urgencyLevel || item.urgencyLevel === urgencyLevel;

      return matchesQuery && matchesStatus && matchesUrgency;
    });
  }, [requests, q, status, urgencyLevel]);

  const handleView = async (id) => {
    try {
      const data = await getRequestById(id);
      setSelected(data);
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  if (loading) {
    return <div className="bg-white rounded-3xl p-6 shadow-lg">Loading history...</div>;
  }

  return (
    <>
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by request ID or organization"
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400"
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
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <option value="">All Urgency</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>
        </div>

        <div className="overflow-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="py-3">Request ID</th>
                <th className="py-3">Organization</th>
                <th className="py-3">People</th>
                <th className="py-3">Urgency</th>
                <th className="py-3">Status</th>
                <th className="py-3">Needed Before</th>
                <th className="py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => (
                <tr key={req._id} className="border-b last:border-b-0">
                  <td className="py-4 font-semibold">{req.requestId}</td>
                  <td className="py-4">{req.organizationName}</td>
                  <td className="py-4">{req.peopleCount}</td>
                  <td className="py-4">{req.urgencyLevel}</td>
                  <td className="py-4">{req.status}</td>
                  <td className="py-4">
                    {req.neededBefore ? new Date(req.neededBefore).toLocaleDateString() : "-"}
                  </td>
                  <td className="py-4">
                    <button
                      onClick={() => handleView(req._id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    No requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-40" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-slate-800">Request Details</h2>
              <button onClick={() => setSelected(null)} className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 text-xl">
                ×
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Detail label="Request ID" value={selected.requestId} />
              <Detail label="Organization" value={selected.organizationName} />
              <Detail label="Phone" value={selected.contactPhone} />
              <Detail label="People Count" value={selected.peopleCount} />
              <Detail label="Urgency" value={selected.urgencyLevel} />
              <Detail label="Status" value={selected.status} />
              <Detail label="Needed Before" value={selected.neededBefore ? new Date(selected.neededBefore).toLocaleDateString() : "-"} />
              <Detail label="Address" value={selected.location?.address || "-"} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Detail({ label, value }) {
  return (
    <div className="rounded-2xl border bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="font-semibold text-slate-800 mt-1">{value}</p>
    </div>
  );
}