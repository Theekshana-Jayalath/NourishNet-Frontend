import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../api";
import Request from "./Request";
import RequestDashboard from "./RequestDashboard";
import RequestHistory from "./RequestHistory";
import RequestProfile from "./RequestProfile";

export default function NgoDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [toast, setToast] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: "dashboard" },
    { key: "request", label: "New Request", icon: "add_circle" },
    { key: "history", label: "History", icon: "history" },
    { key: "profile", label: "Profile", icon: "person" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "request":
        return <Request showToast={showToast} setActiveTab={setActiveTab} />;
      case "history":
        return <RequestHistory showToast={showToast} setActiveTab={setActiveTab} />;
      case "profile":
        return <RequestProfile showToast={showToast} />;
      default:
        return <RequestDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f5fafa] text-[#171d1d]">
      {toast && (
        <div
          className={`fixed right-4 top-4 z-[100] rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-xl ${
            toast.type === "error" ? "bg-red-500" : "bg-[#004b49]"
          }`}
        >
          {toast.message}
        </div>
      )}

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-[#bfc8c7]/20 bg-[#f5fafa]/80 px-4 py-8 shadow-2xl shadow-teal-900/5 backdrop-blur-[40px] transition-transform duration-300 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="mb-10 px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#003331] to-[#004b49] text-white shadow-lg shadow-teal-900/20">
              <span className="material-symbols-outlined !text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                eco
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[#003331]">NourishNet</h1>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#3f4948]/70">
                NGO Portal
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const active = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setActiveTab(item.key);
                  setMobileMenuOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-full px-4 py-3 text-left transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-[#003331] to-[#004b49] text-white shadow-lg"
                    : "text-[#3f4948] hover:bg-[#004b49]/10"
                }`}
              >
                <span className="material-symbols-outlined !text-[22px]">{item.icon}</span>
                <span className="text-sm font-bold uppercase tracking-[0.18em]">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto space-y-2 border-t border-[#bfc8c7]/20 pt-6">
          

          

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-full px-4 py-3 text-[#3f4948] transition-colors hover:bg-[#004b49]/10"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-bold uppercase tracking-[0.18em]">Logout</span>
          </button>
        </div>
      </aside>

      <header className="fixed top-0 z-30 h-20 w-full bg-[#f5fafa]/80 shadow-[0_30px_60px_-15px_rgba(0,75,73,0.05)] backdrop-blur-xl lg:pl-72">
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex flex-1 items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-full p-2 text-[#004b49] hover:bg-[#004b49]/5 lg:hidden"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>

            <div className="relative hidden w-full max-w-md md:block">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#3f4948]/50">
                search
              </span>
              <input
                type="text"
                placeholder={
                  activeTab === "dashboard"
                    ? "Search requests..."
                    : activeTab === "request"
                    ? "Search items or addresses..."
                    : activeTab === "history"
                    ? "Search by Request ID or Org..."
                    : "Search profile details..."
                }
                className="w-full rounded-full border-none bg-[#e4e9e9] py-3 pl-12 pr-4 text-sm outline-none ring-0 focus:ring-2 focus:ring-[#003331]/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button className="rounded-full p-2 text-[#004b49] transition hover:bg-[#004b49]/5">
              <span className="material-symbols-outlined">notifications</span>
            </button>

            <button className="rounded-full p-2 text-[#004b49] transition hover:bg-[#004b49]/5">
              <span className="material-symbols-outlined">settings</span>
            </button>

            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-[#004b49]/10 bg-[#004b49] text-sm font-bold text-white">
              {(user?.username || user?.name || user?.email || "N").charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-screen px-4 pb-24 pt-24 sm:px-6 lg:pl-72 lg:pr-8">
        <div className="mx-auto max-w-[1440px]">{renderContent()}</div>
      </main>

      <nav className="fixed bottom-0 left-0 z-40 flex w-full items-center justify-between border-t border-[#bfc8c7]/20 bg-[#f5fafa]/90 px-4 py-3 backdrop-blur-xl lg:hidden">
        {navItems.map((item) => {
          const active = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`flex flex-col items-center gap-1 ${
                active ? "text-[#003331]" : "text-[#3f4948]"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-tight">
                {item.label === "New Request" ? "New" : item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}