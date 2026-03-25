import { useEffect, useMemo, useState } from "react";
import { getUser, getRequests, filterMyRequests } from "../api";

export default function RequestProfile({ showToast }) {
  const user = getUser();

  const [profile, setProfile] = useState({
    username: user?.username || user?.name || "NGO User",
    email: user?.email || "No email found",
    role: user?.role || "ngo",
  });

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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
    showToast("Profile saved successfully");
  };

  return (
    <div className="grid xl:grid-cols-[1.1fr_0.9fr] gap-6">
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white text-2xl font-bold">
            {profile.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">NGO Profile</h2>
            <p className="text-slate-500">Manage your account</p>
          </div>
        </div>

        <div className="space-y-4">
          <Field label="Name" value={profile.username} onChange={(e) => setProfile({ ...profile, username: e.target.value })} />
          <Field label="Email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
          <Field label="Role" value={profile.role} disabled />

          <button onClick={saveProfile} className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold py-3 hover:opacity-90 transition">
            Save Profile
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-5">Profile Summary</h2>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <Summary title="Total Requests" value={stats.total} color="bg-blue-100 text-blue-700" icon="📊" />
            <Summary title="Pending Requests" value={stats.pending} color="bg-amber-100 text-amber-700" icon="⏳" />
            <Summary title="Approved Requests" value={stats.approved} color="bg-emerald-100 text-emerald-700" icon="✅" />
            <Summary title="High Urgency" value={stats.high} color="bg-rose-100 text-rose-700" icon="🔥" />
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, disabled, ...props }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
      <input
        {...props}
        disabled={disabled}
        className={`w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400 ${disabled ? "bg-slate-100 cursor-not-allowed" : ""}`}
      />
    </div>
  );
}

function Summary({ title, value, color, icon }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border p-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-slate-500 text-sm">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        </div>
      </div>
      <div className={`px-4 py-2 rounded-full font-semibold ${color}`}>{value}</div>
    </div>
  );
}