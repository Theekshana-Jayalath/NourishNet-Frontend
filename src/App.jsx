import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Request from "./components/Request";
import RequestDashboard from "./components/RequestDashboard";
import RequestHistory from "./components/RequestHistory";
import RequestProfile from "./components/RequestProfile";
import "./App.css";

const App = () => {
  const [activeTab, setActiveTab] = useState("request");
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "success") => {
    const id = Date.now() + Math.random();

    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  const renderPage = () => {
    switch (activeTab) {
      case "dashboard":
        return <RequestDashboard showToast={showToast} />;
      case "history":
        return <RequestHistory showToast={showToast} />;
      case "profile":
        return <RequestProfile showToast={showToast} />;
      case "request":
      default:
        return <Request showToast={showToast} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="w-full overflow-hidden bg-slate-100 min-h-screen">
      <Navbar />

      <section className="max-w-7xl mx-auto px-4 md:px-6 py-10">
        <div className="rounded-3xl bg-white shadow-xl p-4 md:p-6 mb-6">
          <div className="mb-4">
            <p className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">
              NGO Request Portal
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mt-1">
              Manage Requests
            </h2>
            <p className="text-slate-500 mt-2">
              Create requests, view request history, check dashboard insights,
              and manage your NGO profile.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`tab-btn ${
                activeTab === "dashboard" ? "tab-btn-active" : "tab-btn-idle"
              }`}
            >
              Request Dashboard
            </button>

            <button
              onClick={() => setActiveTab("request")}
              className={`tab-btn ${
                activeTab === "request" ? "tab-btn-active" : "tab-btn-idle"
              }`}
            >
              New Request
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`tab-btn ${
                activeTab === "history" ? "tab-btn-active" : "tab-btn-idle"
              }`}
            >
              Request History
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`tab-btn ${
                activeTab === "profile" ? "tab-btn-active" : "tab-btn-idle"
              }`}
            >
              Request Profile
            </button>
          </div>
        </div>

        {renderPage()}
      </section>

      <div className="fixed top-5 right-5 z-50 space-y-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`min-w-[280px] max-w-sm rounded-xl px-4 py-3 text-white shadow-xl animate-slideIn ${
              toast.type === "error" ? "bg-red-500" : "bg-emerald-600"
            }`}
          >
            <div className="font-semibold">{toast.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;