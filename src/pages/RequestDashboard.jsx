import { useEffect, useMemo, useState } from "react";
import { getRequests, filterMyRequests } from "../api";

export default function RequestDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await getRequests({ page: 1, limit: 100 });
      setRequests(filterMyRequests(res.items || []));
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => r.status === "PENDING").length;
    const approved = requests.filter((r) => r.status === "APPROVED").length;
    const fulfilled = requests.filter((r) => r.status === "FULFILLED").length;
    const rejected = requests.filter((r) => r.status === "REJECTED").length;
    return { total, pending, approved, fulfilled, rejected };
  }, [requests]);

  const urgencyData = useMemo(() => {
    return [
      { label: "LOW", value: requests.filter((r) => r.urgencyLevel === "LOW").length, color: "bg-green-500" },
      { label: "MEDIUM", value: requests.filter((r) => r.urgencyLevel === "MEDIUM").length, color: "bg-yellow-500" },
      { label: "HIGH", value: requests.filter((r) => r.urgencyLevel === "HIGH").length, color: "bg-red-500" },
    ];
  }, [requests]);

  const statusData = useMemo(() => {
    return [
      { label: "Pending", value: stats.pending, color: "bg-amber-500" },
      { label: "Approved", value: stats.approved, color: "bg-emerald-500" },
      { label: "Fulfilled", value: stats.fulfilled, color: "bg-teal-500" },
      { label: "Rejected", value: stats.rejected, color: "bg-rose-500" },
    ];
  }, [stats]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-lg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        <span className="ml-3 text-slate-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard title="Total Requests" value={stats.total} color="from-blue-500 to-cyan-500" icon="📊" />
        <StatCard title="Pending" value={stats.pending} color="from-amber-500 to-orange-500" icon="⏳" />
        <StatCard title="Approved" value={stats.approved} color="from-emerald-500 to-green-500" icon="✅" />
        <StatCard title="Fulfilled" value={stats.fulfilled} color="from-teal-500 to-emerald-500" icon="🎉" />
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        <ChartCard title="Urgency Distribution" data={urgencyData} />
        <ChartCard title="Request Status Overview" data={statusData} />
      </div>
    </div>
  );
}

function StatCard({ title, value, color, icon }) {
  return (
    <div className={`rounded-3xl bg-gradient-to-r ${color} text-white p-5 shadow-lg`}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/85">{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="text-3xl font-bold mt-2">{value}</h3>
    </div>
  );
}

function ChartCard({ title, data }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-slate-800 mb-5">{title}</h2>

      <div className="space-y-5">
        {data.map((item) => (
          <div key={item.label}>
            <div className="flex justify-between mb-2">
              <span className="font-medium text-slate-700">{item.label}</span>
              <span className="text-slate-500">{item.value}</span>
            </div>
            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${item.color} rounded-full transition-all duration-500`}
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}