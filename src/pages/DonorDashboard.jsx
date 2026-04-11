import React from "react";
import { Link } from "react-router-dom";
import { getUser } from "../api";
import donorBg from "../assets/donor-bg.png";

const subscriptions = [
  {
    title: "Clinical Trials",
    subtitle: "Medical Support",
    amount: "$200",
    icon: "medication",
  },
  {
    title: "Education Fund",
    subtitle: "Academic Support",
    amount: "$150",
    icon: "school",
  },
  {
    title: "Health Equity",
    subtitle: "Global Equity",
    amount: "$100",
    icon: "eco",
  },
];

export default function DonorDashboard() {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const user = getUser() || {};
  const userId = user?._id || user?.userId || user?.id;
  const userRole = user?.role || localStorage.getItem("role") || "";

  const withUser = (path) => {
    const params = new URLSearchParams();
    if (userId) params.set("id", userId);
    if (userRole) params.set("role", userRole);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return `${path}${qs}`;
  };

  return (
    <div className="flex min-h-screen bg-transparent text-[#002a29] font-sans">
      
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r border-[#96ded1]/10 bg-linear-to-b from-[#002a29] to-[#004b49] transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4">
          <div className="flex items-center gap-3">
            {/* sidebar hamburger - visible only on large screens */}
            <button
              onClick={() => setSidebarOpen((s) => !s)}
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              title={sidebarOpen ? "Close menu" : "Open menu"}
              className="hidden lg:inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/6 text-white hover:bg-white/10"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="text-white font-bold mb-3">MediSphere</div>
          </div>

            <div className="flex flex-col gap-2 mt-3">
            <Link to={withUser("/donor-history")} className="rounded-lg bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10">History</Link>
            <Link to={withUser("/donor-profile")} className="rounded-lg bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10">Profile</Link>
          </div>
        </div>
      </aside>

      {/* fixed reopen hamburger for large screens when sidebar is hidden */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
          title="Open menu"
          className="hidden lg:inline-flex fixed left-6 top-6 z-60 h-8 w-8 items-center justify-center rounded-md bg-[#317873] text-white hover:bg-[#275b54]"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Main */}
      <main className={`flex min-h-screen grow flex-col ${sidebarOpen ? "ml-72" : "ml-0"}`}>
        
        {/* HERO (HEADER INSIDE) */}
        <section className="relative flex h-80 items-center overflow-hidden">

          {/* Background Image */}
          <div className="absolute inset-0 z-0">
           < img
              src={donorBg}
              alt="Hero background"
              className="h-full w-full object-cover object-[center_65%]"
           />
            <div className="absolute inset-0 bg-linear-to-r from-[#002a29]/90 via-[#002a29]/60 to-transparent"></div>
          </div>

          {/* ✅ HEADER (FIXED HERE) */}
          <header className="absolute top-0 left-0 z-40 flex h-16 w-full items-center justify-between px-8 bg-transparent">
            
            {/* header hamburger removed; sidebar control is on the left */}

            <Link
              to={withUser("/DonationApplication")}
              aria-label="Donate Now"
              className="fixed right-4 top-4 z-50 rounded-2xl bg-[#317873] px-5 py-2 text-sm font-bold text-white shadow hover:bg-[#004b49] inline-flex items-center justify-center"
            >
              Donate Now
            </Link>

          </header>

          {/* HERO TEXT */}
          <div className="relative z-10 w-full px-8">
            <h1 className="text-white text-xl font-extrabold">
              Good morning,<br />{user.name || 'Alex Sterling'}
            </h1>

            <p className="text-[#96ded1]/80 text-sm mt-2 max-w-md">
              Continue your journey of making a difference. Your support matters.
            </p>
          </div>
        </section>

        {/* CONTENT */}
        <div className="relative z-20 -mt-10 px-8 py-8">
          <div className="bg-white p-8 rounded-3xl shadow-lg">
            <h2 className="text-lg font-bold mb-6">Active Subscriptions</h2>

            <div className="grid md:grid-cols-3 gap-4">
              {subscriptions.map((item, i) => (
                <div key={i} className="p-4 rounded-2xl bg-gray-50">
                  <h4 className="font-bold">{item.title}</h4>
                  <p className="text-sm text-gray-400">{item.subtitle}</p>

                  <div className="mt-4 font-bold">
                    {item.amount} <span className="text-sm text-gray-400">/mo</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}