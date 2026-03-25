import { useEffect, useMemo, useState } from "react";
import { getUser, getRequests, filterMyRequests } from "../api";

export default function RequestProfile({ showToast }) {
  const user = getUser();

  const [profile, setProfile] = useState({
    username: user.username || user.name || "NGO User",
    email: user.email || "No email found",
    role: user.role || "ngo",
  });

  const [requests, setRequests] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await getRequests({ page: 1, limit: 100 });
      setRequests(filterMyRequests(res.items || []));
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === "PENDING").length,
      approved: requests.filter((r) => r.status === "APPROVED").length,
      high: requests.filter((r) => r.urgencyLevel === "HIGH").length,
    };
  }, [requests]);

  const saveProfile = () => {
    localStorage.setItem("user", JSON.stringify(profile));
    showToast("Profile saved locally");
  };

  return (
    <div className="grid xl:grid-cols-[1.1fr_0.9fr] gap-6">
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-5">NGO Profile</h2>

        <div className="space-y-4">
          <Field label="Name" value={profile.username} onChange={(e) => setProfile({ ...profile, username: e.target.value })} />
          <Field label="Email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
          <Field label="Role" value={profile.role} onChange={(e) => setProfile({ ...profile, role: e.target.value })} />

          <button onClick={saveProfile} className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold py-3">
            Save Profile
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-5">Profile Summary</h2>

        <div className="space-y-4">
          <Summary title="Total Requests" value={stats.total} color="bg-blue-100 text-blue-700" />
          <Summary title="Pending Requests" value={stats.pending} color="bg-amber-100 text-amber-700" />
          <Summary title="Approved Requests" value={stats.approved} color="bg-emerald-100 text-emerald-700" />
          <Summary title="High Urgency Requests" value={stats.high} color="bg-rose-100 text-rose-700" />
        </div>
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
      <input {...props} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400" />
    </div>
  );
}

function Summary({ title, value, color }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border p-4">
      <div>
        <p className="text-slate-500 text-sm">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
      </div>
      <div className={`px-4 py-2 rounded-full font-semibold ${color}`}>{value}</div>
    </div>
  );
}