import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DonorProfileView from "./DonorProfileView";
import { getToken, BASE_URL, getUser } from "../../api";

export default function DonorList() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [activeDonor, setActiveDonor] = useState(null);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [customToken, setCustomToken] = useState("");
  const [useCustomToken, setUseCustomToken] = useState(false);
  const [lastUrl, setLastUrl] = useState("");
  const [lastResponse, setLastResponse] = useState(null);

  useEffect(() => {
    const fetchDonors = async () => {
      setLoading(true);
      setError("");
      // capture current logged-in user from localStorage
      const current = getUser();
      setCustomToken((t) => t);
      
      try {
        const token = useCustomToken && customToken ? customToken : getToken();

        // prefer server-side filtering when possible
  // prefer backend URL configured in src/api.js
  let url = `${BASE_URL.replace(/\/$/, '')}/users?role=donor`;
        setLastUrl(url);
        let response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        // if not allowed (e.g., token not admin), try NGO-manager scoped endpoint
        if (response.status === 401 || response.status === 403) {
          // fallback to NGO manager scoped endpoint on backend
          url = `${BASE_URL.replace(/\/$/, '')}/ngo-manager/users`;
          setLastUrl(url);
          response = await fetch(url, {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
        }

        const text = await response.text();
        let data;
        try { data = JSON.parse(text || '{}'); } catch { data = { raw: text } }
        setLastResponse(data);

        if (!response.ok) {
          setError(data.message || `Failed to fetch donors (${response.status})`);
        } else {
          // backend may return an array directly or an object containing data/users
          const donorsList = Array.isArray(data) ? data : (data.data || data.users || data || []);
          const normalized = (arr) => Array.isArray(arr) ? arr : [arr];

          // robust donor detection: check role, department or managerType markers
          const isDonorRecord = (user) => {
            if (!user) return false;
            const role = (user.role || '').toString().toLowerCase();
            if (role === 'donor') return true;
            const dept = (user.department || '').toString().toLowerCase();
            if (dept === 'donor') return true;
            const mt = (user.managerType || '').toString().toLowerCase();
            if (mt.includes('donor')) return true;
            return false;
          };

          let list = normalized(donorsList).filter(isDonorRecord);

          // if the current logged-in user is a donor, show only their own record (safer)
          if (current && (current.role || '').toString().toLowerCase() === 'donor') {
            const userId = current.id || current._id;
            list = list.filter(u => (u._id && u._id.toString() === userId) || (u.id && u.id.toString() === userId) || (u.username && u.username === current.username));
          }

          setDonors(list);
        }
      } catch (err) {
        setError(err.message || "Network error");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDonors();
  }, []);

  // allow manual refresh
  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      const token = useCustomToken && customToken ? customToken : getToken();
      // mirror fetch logic from mount: try server-side role filter, fallback to ngo-manager
  let url = `http://localhost:3000/api/users?role=donor`;
      setLastUrl(url);
      let res = await fetch(url, { headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
      if (res.status === 401 || res.status === 403) {
  url = `${BASE_URL}/api/ngo-manager/users`;
        setLastUrl(url);
        res = await fetch(url, { headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
      }

      const text = await res.text();
      let data;
      try { data = JSON.parse(text || '{}'); } catch { data = { raw: text } }
      setLastResponse(data);
      if (!res.ok) {
        setError(data.message || `Request failed (${res.status})`);
      } else {
        const donorsList = Array.isArray(data) ? data : (data.data || data.users || data || []);
        const normalized = (arr) => Array.isArray(arr) ? arr : [arr];
        const isDonorRecord = (user) => {
          if (!user) return false;
          const role = (user.role || '').toString().toLowerCase();
          if (role === 'donor') return true;
          const dept = (user.department || '').toString().toLowerCase();
          if (dept === 'donor') return true;
          const mt = (user.managerType || '').toString().toLowerCase();
          if (mt.includes('donor')) return true;
          return false;
        };
        setDonors(normalized(donorsList).filter(isDonorRecord));
      }
    } catch (err) {
      setError(err.message || 'Network error');
    } finally { setLoading(false); }
  }

  const filteredDonors = donors.filter(donor => {
    const term = searchTerm.toLowerCase();
    return (
      (donor.name?.toLowerCase() || "").includes(term) ||
      (donor.username?.toLowerCase() || "").includes(term) ||
      (donor.email?.toLowerCase() || "").includes(term) ||
      (donor.phone?.toLowerCase() || "").includes(term)
    );
  });

  const getInitials = (name) => {
    if (!name) return "D";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getGradient = (id) => {
    const gradients = [
      "from-emerald-500 to-teal-500",
      "from-amber-500 to-orange-500",
      "from-purple-500 to-pink-500",
      "from-blue-500 to-cyan-500",
      "from-rose-500 to-red-500",
    ];
    return gradients[id % gradients.length];
  };

  const openDonorModal = (donor) => {
    setActiveDonor(donor);
    setModalOpen(true);
  };

  const closeDonorModal = () => {
    setModalOpen(false);
    setActiveDonor(null);
  };

  // close on ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeDonorModal(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span className="bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Donor Directory
            </span>
            <span className="text-sm font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {donors.length} total
            </span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage and view all registered donors in the system
          </p>
        </div>
        <Link
          to="/donor-manager/donors/new"
    className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 hover:shadow-xl"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add New Donor
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
          <p className="mt-4 text-sm text-slate-500">Loading donors...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-red-600">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
          <div className="mt-3 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                const msg = (error || '').toString().toLowerCase();
                if (msg.includes('token') || msg.includes('access denied') || msg.includes('unauthorized')) {
                  navigate('/login');
                } else {
                  window.location.reload();
                }
              }}
              className="text-sm text-emerald-600 hover:underline"
            >
              {(error || '').toString().toLowerCase().includes('token') || (error || '').toString().toLowerCase().includes('access denied') ? 'Go to Login' : 'Try again'}
            </button>
            {(error || '').toString().toLowerCase().includes('token') && (
              <button onClick={() => navigate('/login')} className="text-sm text-white bg-emerald-600 px-3 py-1 rounded-md">Login</button>
            )}
          </div>
        </div>
      )}

      {/* Donors Grid */}
      {!loading && !error && (
        <>
          {filteredDonors.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl">
                👥
              </div>
              <h3 className="text-lg font-semibold text-slate-700">
                {searchTerm ? "No matching donors" : "No donors found"}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {searchTerm
                  ? "Try adjusting your search criteria"
                  : "Donors will appear here once they register"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredDonors.map((donor, index) => (
                <div
                  key={donor._id || donor.id || index}
                  role="button"
                  tabIndex={0}
                  onClick={() => openDonorModal(donor)}
                  onKeyDown={(e) => { if (e.key === 'Enter') openDonorModal(donor); }}
                  className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-slate-100 cursor-pointer"
                >
                  {/* Decorative gradient bar */}
                  <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-emerald-500 via-amber-500 to-teal-500"></div>
                  
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br ${getGradient(index)} text-white shadow-md`}>
                      <span className="text-lg font-bold">
                        {getInitials(donor.name || donor.username)}
                      </span>
                    </div>
                    
                    {/* Donor Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-slate-800 truncate">
                        {donor.name || donor.username || "Anonymous Donor"}
                      </h3>
                      
                      {donor.email && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                          <span className="truncate">{donor.email}</span>
                        </div>
                      )}
                      
                      {donor.phone && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.574 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                          <span>{donor.phone}</span>
                        </div>
                      )}
                      
                      {/* Stats */}
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <svg className="h-3 w-3 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 12V8H4v4M12 4v4M4 12h16v8H4z" />
                          </svg>
                          <span className="text-xs text-slate-600">
                            {donor.totalDonations || 0} donations
                          </span>
                        </div>
                        <div className="h-1 w-1 rounded-full bg-slate-300"></div>
                        <div className="flex items-center gap-1">
                          <svg className="h-3 w-3 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                          </svg>
                          <span className="text-xs text-slate-600">
                            Joined {donor.createdAt ? new Date(donor.createdAt).toLocaleDateString() : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Arrow icon */}
                    <div className="opacity-0 transition-opacity group-hover:opacity-100">
                      <svg className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
      {/* Modal overlay for donor profile */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeDonorModal}
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Donor profile"
            className="relative z-10 max-h-[86vh] w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white/95 p-6 shadow-2xl transition-all duration-200 ease-out"
          >
            <div className="flex items-start justify-between gap-4">
              <div />
              <button
                onClick={closeDonorModal}
                aria-label="Close donor profile"
                className="ml-auto rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M6 18L18 6" />
                </svg>
              </button>
            </div>

            <div className="mt-2">
              <DonorProfileView donor={activeDonor} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}