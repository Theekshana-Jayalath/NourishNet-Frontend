import React, { useEffect, useMemo, useState } from "react";
import { Link, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { getUser, getToken, BASE_URL, getDonationForms, getMyPendingDonations, getMyDonationHistory } from "../../api";
import donorBg from "../../assets/donor-bg.png";
import DonationApplication from "./DonationApplication";
import DonorHistory from "./DonorHistory";
import DonorProfile from "./DonorProfile";

const PRODUCT_LABELS = {
  UNP001: "Rice",
  UNP002: "Dhal",
  UNP003: "Milk Powder",
  UNP004: "Flour",
  UNP005: "Sugar",
  UNP006: "Salt",
  PRO001: "Vegetable Curry",
  PRO002: "Chicken Fried Rice",
  PRO003: "Egg Sandwich",
  PRO004: "Fish Curry",
  PRO005: "Dhal Curry (Cooked)",
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
};

const getProductLabel = (productId) => {
  return PRODUCT_LABELS[productId] || productId || "Unknown Product";
};

function DonorDashboardHome({ user, sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const [pendingDonations, setPendingDonations] = useState([]);
  const [receivedDonations, setReceivedDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login");
  };

  useEffect(() => {
    const loadDonations = async () => {
      setLoading(true);
      setError("");
      try {
        const token = getToken();

        if (!token) {
          // no token: try public fallback (fetch all donation forms and client-filter by current user id)
          const userId = getUser()?._id || getUser()?.id || getUser()?.userId;
          if (!userId) {
            setError("You must be logged in to view your donations.");
            setPendingDonations([]);
            setReceivedDonations([]);
            setLoading(false);
            return;
          }

          try {
            const publicData = await getDonationForms().catch(() => ({ data: [] }));
            const list = (publicData.data || publicData || []).filter(Boolean);
            const normalized = Array.isArray(list) ? list : [list];

            const matchesDonor = (f) => {
              if (!f) return false;
              const fid = (f.donorId || f.donor || '').toString();
              if (!fid) {
                // donor object embedded
                if (typeof f.donor === 'object') return ((f.donor._id || f.donor.id || '').toString() === userId.toString());
                return false;
              }
              return fid === userId.toString();
            };

            const pending = normalized.filter(f => matchesDonor(f) && ((f.Status || f.status || '').toString().toLowerCase() === 'pending'));
            const received = normalized.filter(f => matchesDonor(f) && ((f.Status || f.status || '').toString().toLowerCase() === 'received'));
            setPendingDonations(pending);
            setReceivedDonations(received);
            setError(publicRes.ok ? '' : (publicData.message || 'Unable to fetch public donation forms'));
            setLoading(false);
            return;
          } catch (err) {
            // fall through to error below
          }
        }

        // Load pending and received donations in parallel
        const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
        const [pendingData, receivedData] = await Promise.all([
          getMyPendingDonations().catch(() => ({ data: [] })),
          getMyDonationHistory().catch(() => ({ data: [] })),
        ]);

        // pendingData / receivedData are expected as { data: [...] } or array directly from helper
        setPendingDonations(pendingData?.data || pendingData || []);
        setReceivedDonations(receivedData?.data || receivedData || []);
      } catch (err) {
        setError(err.message || "Network error");
      } finally {
        setLoading(false);
      }
    };

    loadDonations();
  }, []);

  const totalPendingForms = pendingDonations.length;
  const totalReceivedForms = receivedDonations.length;

  return (
    <div className="flex min-h-screen bg-transparent text-[#002a29] font-sans">
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r border-[#96ded1]/10 bg-linear-to-b from-[#002a29] to-[#004b49] transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((s) => !s)}
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              title={sidebarOpen ? "Close menu" : "Open menu"}
              className="hidden lg:inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/6 text-white hover:bg-white/10"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="text-white font-bold mb-3">NourishNet</div>
          </div>

          <div className="flex flex-col gap-2 mt-3">
            <Link
              to="/donor-dashboard"
              className="rounded-lg bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
            >
              Dashboard
            </Link>

            <Link
              to="/donor-dashboard/history"
              className="rounded-lg bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
            >
              History
            </Link>

            <Link
              to="/donor-dashboard/profile"
              className="rounded-lg bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
            >
              Profile
            </Link>
          </div>

          <div className="mt-auto pt-6">
            <div className="flex items-center gap-2">
              <Link
                to="/donor-dashboard/profile"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                title="Profile"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                  <path d="M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
                  <path d="M12 11c2.5 0 4.5-1.5 5-4" />
                  <path d="M12 11c-2.5 0-4.5-1.5-5-4" />
                </svg>
              </Link>
              <button
                onClick={handleLogout}
                className="flex-1 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>

      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
          title="Open menu"
          className="hidden lg:inline-flex fixed left-6 top-6 z-[60] h-8 w-8 items-center justify-center rounded-md bg-[#317873] text-white hover:bg-[#275b54]"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      <main
        className={`flex min-h-screen grow flex-col ${
          sidebarOpen ? "ml-72" : "ml-0"
        }`}
      >
        <section className="relative flex h-80 items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src={donorBg}
              alt="Hero background"
              className="h-full w-full object-cover object-[center_65%]"
            />
            <div className="absolute inset-0 bg-linear-to-r from-[#002a29]/90 via-[#002a29]/60 to-transparent"></div>
          </div>

          <header className="absolute top-0 left-0 z-40 flex h-16 w-full items-center justify-between px-8 bg-transparent">
            <Link
              to="/donor-dashboard/application"
              aria-label="Donate Now"
              className="fixed right-4 top-4 z-50 rounded-2xl bg-[#317873] px-5 py-2 text-sm font-bold text-white shadow hover:bg-[#004b49] inline-flex items-center justify-center"
            >
              Donate Now
            </Link>
          </header>

          <div className="relative z-10 w-full px-8">
            <h1 className="text-white text-xl font-extrabold">
              Good morning,
              <br />
              {user.name || user.username || "Donor"}
            </h1>

            <p className="text-[#96ded1]/80 text-sm mt-2 max-w-md">
              Track your pending donations and continue supporting those in need
              through NourishNet.
            </p>
          </div>
        </section>

        <div className="relative z-20 -mt-10 px-8 py-8 space-y-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-white p-6 shadow-lg flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 7h-4.18A3 3 0 0 0 16 5.18V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v1.18A3 3 0 0 0 8.18 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" />
                  <circle cx="12" cy="13" r="2" />
                  <path d="M8 7h8" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Pending Donation Forms</p>
                <p className="mt-2 text-3xl font-extrabold text-[#004b49]">
                  {totalPendingForms}
                </p>
                <p className="text-xs text-slate-400 mt-1">Awaiting confirmation</p>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-lg flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Received Donation Forms</p>
                <p className="mt-2 text-3xl font-extrabold text-[#004b49]">
                  {totalReceivedForms}
                </p>
                <p className="text-xs text-slate-400 mt-1">Successfully completed</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-lg">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold">Pending Donations</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Only donations with pending status are shown here.
                </p>
              </div>

              <div className="flex gap-3">
                <Link
                  to="/donor-dashboard/application"
                  className="rounded-2xl bg-[#317873] px-4 py-2 text-sm font-bold text-white hover:bg-[#004b49]"
                >
                  New Donation
                </Link>
                <Link
                  to="/donor-dashboard/history"
                  className="rounded-2xl border border-[#317873] px-4 py-2 text-sm font-bold text-[#004b49] hover:bg-[#f0fdfa]"
                >
                  View History
                </Link>
              </div>
            </div>

            {loading && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                Loading pending donations...
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                {error}
              </div>
            )}

            {!loading && !error && pendingDonations.length === 0 && (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-14 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#96ded1]/30 text-2xl">
                  📦
                </div>
                <h3 className="text-xl font-bold text-slate-700">
                  No pending donations
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  New donations you submit will appear here until they are
                  received.
                </p>
              </div>
            )}

            {!loading && !error && pendingDonations.length > 0 && (
              <div className="grid grid-cols-1 gap-6">
                {pendingDonations.map((form) => (
                  <article
                    key={form._id}
                    className="overflow-hidden rounded-3xl border border-[#96ded1]/30 bg-[#f8fffe] shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="border-b border-slate-100 bg-gradient-to-r from-[#96ded1]/20 to-white px-6 py-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#96ded1]/40 text-[#004b49]">
                              🎁
                            </div>
                            <div>
                              <h2 className="text-lg font-extrabold text-slate-800">
                                {form.donationFormId || form._id}
                              </h2>
                              <p className="text-sm text-slate-500">
                                Submitted on {formatDateTime(form.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-start gap-2 md:items-end">
                          <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                            {form.Status}
                          </span>
                          <span className="text-sm text-slate-500">
                            {form.items?.length || 0} item(s)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-6">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {(form.items || []).map((item, index) => (
                          <div
                            key={item._id || index}
                            className="rounded-2xl border border-slate-200 bg-white p-4"
                          >
                            <div className="mb-3 flex items-center justify-between">
                              <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600 border border-slate-200">
                                Item {index + 1}
                              </span>
                              <span className="text-xs font-semibold text-[#004b49]">
                                {item.processingType || "—"}
                              </span>
                            </div>

                            <h3 className="text-base font-bold text-slate-800">
                              {getProductLabel(item.productId)}
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                              Product ID: {item.productId || "—"}
                            </p>

                            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                                <p className="text-xs text-slate-500">
                                  Quantity
                                </p>
                                <p className="mt-1 font-bold text-slate-800">
                                  {item.quantity || 0}
                                </p>
                              </div>

                              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                                <p className="text-xs text-slate-500">Unit</p>
                                <p className="mt-1 font-bold text-slate-800">
                                  {item.unit || "—"}
                                </p>
                              </div>

                              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 col-span-2">
                                <p className="text-xs text-slate-500">
                                  Storage Type
                                </p>
                                <p className="mt-1 font-bold text-slate-800">
                                  {item.StorageType || "—"}
                                </p>
                              </div>

                              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 col-span-2">
                                <p className="text-xs text-slate-500">
                                  Expiration Date
                                </p>
                                <p className="mt-1 font-bold text-slate-800">
                                  {item.expirationDate
                                    ? formatDateTime(item.expirationDate)
                                    : "Not provided"}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DonorDashboard() {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const user = getUser() || {};

  return (
    <Routes>
      <Route
        index
        element={
          <DonorDashboardHome
            user={user}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        }
      />
      <Route path="application" element={<DonationApplication />} />
      <Route path="history" element={<DonorHistory />} />
      <Route path="profile" element={<DonorProfile />} />
      <Route path="*" element={<Navigate to="/donor-dashboard" replace />} />
    </Routes>
  );
}