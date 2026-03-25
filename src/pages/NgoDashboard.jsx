import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../api";  // Changed from "./api" to "../api"
import Request from "./Request";  // Changed from "./pages/Request" to "./Request"
import RequestDashboard from "./RequestDashboard";  // Changed from "./pages/RequestDashboard"
import RequestHistory from "./RequestHistory";  // Changed from "./pages/RequestHistory"
import RequestProfile from "./RequestProfile";  // Changed from "./pages/RequestProfile"

export default function NGODashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const user = getUser();

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 px-6 py-4 rounded-2xl shadow-lg z-50 transition-all ${
            toast.type === "error"
              ? "bg-red-500 text-white"
              : "bg-emerald-500 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold">
                🍽️
              </div>
              <h1 className="text-xl font-bold text-slate-800">NGO Dashboard</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex gap-2">
                <NavButton
                  label="Dashboard"
                  active={activeTab === "dashboard"}
                  onClick={() => setActiveTab("dashboard")}
                />
                <NavButton
                  label="New Request"
                  active={activeTab === "request"}
                  onClick={() => setActiveTab("request")}
                />
                <NavButton
                  label="History"
                  active={activeTab === "history"}
                  onClick={() => setActiveTab("history")}
                />
                <NavButton
                  label="Profile"
                  active={activeTab === "profile"}
                  onClick={() => setActiveTab("profile")}
                />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600 hidden sm:block">
                  {user?.username || user?.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-xl bg-red-100 text-red-600 font-semibold hover:bg-red-200 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden gap-2 mt-4 overflow-x-auto pb-2">
            <NavButton
              label="Dashboard"
              active={activeTab === "dashboard"}
              onClick={() => setActiveTab("dashboard")}
            />
            <NavButton
              label="Request"
              active={activeTab === "request"}
              onClick={() => setActiveTab("request")}
            />
            <NavButton
              label="History"
              active={activeTab === "history"}
              onClick={() => setActiveTab("history")}
            />
            <NavButton
              label="Profile"
              active={activeTab === "profile"}
              onClick={() => setActiveTab("profile")}
            />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === "dashboard" && <RequestDashboard />}
        {activeTab === "request" && (
          <Request showToast={showToast} setActiveTab={setActiveTab} />
        )}
        {activeTab === "history" && <RequestHistory showToast={showToast} />}
        {activeTab === "profile" && <RequestProfile showToast={showToast} />}
      </main>
    </div>
  );
}

function NavButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${
        active
          ? "bg-emerald-600 text-white shadow-lg"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
    >
      {label}
    </button>
  );
}