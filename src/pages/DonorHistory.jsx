import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUser, getToken, BASE_URL } from "../api";

export default function DonorHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      const user = getUser();
      const donorId = user?._id || user?.id || user?.userId;

      if (!donorId) {
        setError("No logged-in donor found.");
        setLoading(false);
        return;
      }

      try {
        const token = getToken();
        const url = `${BASE_URL}/donationForms/my-history?donorId=${donorId}`;
        const res = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setError(data.message || "Failed to load history");
        } else {
          // only show donation forms that are marked as Received
          const received = (data.data || []).filter((f) => f.Status === "Received");
          setHistory(received);
        }
      } catch (err) {
        setError(err.message || "Network error");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-100 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="relative mb-8 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-700/90 via-emerald-600/80 to-teal-500/70 blur-lg opacity-40"></div>
          <div className="relative z-10 bg-white/80 backdrop-blur-sm rounded-3xl p-6 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-emerald-900">Donation History</h1>
              <p className="mt-1 text-sm text-emerald-800/80">Your received donations — neatly tracked and verifiable.</p>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/donor-dashboard" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold shadow hover:scale-[1.02] transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0L2.586 11H15a1 1 0 100-2H2.586l3.707-3.707a1 1 0 10-1.414-1.414l-5.414 5.414a1 1 0 000 1.414l5.414 5.414a1 1 0 001.414 0z" clipRule="evenodd"/></svg>
                Back
              </Link>

              <div className="text-sm text-emerald-800/90 bg-emerald-50 px-3 py-2 rounded-lg">
                <div className="text-xs">Received</div>
                <div className="font-bold text-xl">{history.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 gap-6">
          {loading && (
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
              Loading history...
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-2 rounded mb-4">{error}</div>
          )}

          {history.length === 0 && !loading && (
            <div className="py-12 text-center text-slate-500 bg-white/60 rounded-2xl border border-dashed border-slate-200">
              <div className="text-lg font-semibold mb-2">No received donations yet</div>
              <div className="text-sm">Your donations will appear here once they are marked as received by the system.</div>
            </div>
          )}

          {history.map((h) => (
            <article key={h._id} className="relative rounded-2xl overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-l-2xl transform group-hover:scale-y-105 transition origin-top"></div>

              <div className="relative z-10 bg-white shadow-lg rounded-2xl p-6 md:p-8 hover:shadow-2xl transition transform hover:-translate-y-1">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="rounded-md bg-emerald-100 p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-700" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h3V6a1 1 0 112 0v4h6a1 1 0 110 2H3a1 1 0 01-1-1z" /></svg>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-slate-800">{h.donationFormId || h._id}</div>
                        <div className="text-xs text-slate-500">{new Date(h.createdAt).toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {h.items?.map((it) => (
                        <div key={it._id} className="p-3 bg-gradient-to-br from-white to-emerald-50 border rounded-lg">
                          <div className="text-sm font-semibold text-emerald-800">{it.productId}</div>
                          <div className="text-xs text-slate-500">{it.processingType}</div>
                          <div className="text-sm mt-1 text-slate-700">{it.quantity} {it.unit}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="w-36 flex-shrink-0 text-right">
                    <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                      {h.Status}
                    </div>
                    <div className="text-xs text-gray-500 mt-3">{h.items?.length || 0} item(s)</div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
