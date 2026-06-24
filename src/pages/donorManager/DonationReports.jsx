import React, { useEffect, useState, useCallback } from "react";
import {
  FileText,
  Download,
  Loader2,
  AlertCircle,
  InboxIcon,
  Hash,
  User,
  Phone,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  Package,
  TrendingUp,
  Filter,
  RefreshCw,
} from "lucide-react";
import { BASE_URL, getToken, getUser, getDonationForms, getUserById } from "../../api";

function getDonorIdFromForm(f) {
  if (!f) return null;
  if (f.donorId) return (f.donorId._id || f.donorId.id || f.donorId).toString();
  if (f.donor) return (typeof f.donor === "string" ? f.donor : (f.donor._id || f.donor.id || f.donor)).toString();
  if (f.createdBy) return (f.createdBy._id || f.createdBy.id || f.createdBy).toString();
  return null;
}

function extractNameFromForm(f) {
  if (!f) return null;
  return (
    f.donorName || f.submitterName || (f.donor && (f.donor.name || f.donor.username)) || (f.createdBy && (f.createdBy.name || f.createdBy.username)) || null
  );
}

function StatusBadge({ status }) {
  const s = (status || "").toLowerCase();
  const configs = {
    received: { bg: "#dcfce7", color: "#15803d", border: "#bbf7d0", icon: CheckCircle2, label: "Received" },
    pending:  { bg: "#fef9c3", color: "#a16207", border: "#fde68a", icon: Clock,         label: "Pending"  },
    rejected: { bg: "#fee2e2", color: "#dc2626", border: "#fecaca", icon: XCircle,       label: "Rejected" },
  };
  const cfg = configs[s] || { bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0", icon: FileText, label: status || "—" };
  const Icon = cfg.icon;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: cfg.bg, color: cfg.color,
      border: `1.5px solid ${cfg.border}`,
      borderRadius: 20, padding: "4px 11px",
      fontSize: 12, fontWeight: 700,
    }}>
      <Icon size={11} strokeWidth={2.5} />
      {cfg.label}
    </span>
  );
}

export default function DonationReports() {
  const [items, setItems]       = useState([]);
  const [donorsMap, setDonorsMap] = useState({});
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  const loadDonor = useCallback(async (id) => {
    if (!id || donorsMap[id]) return;
    try {
      const data = await getUserById(id);
      const user = data.data || data.user || data || {};
      const role = (user.role || "").toLowerCase();
      if (role !== "donor") {
        setDonorsMap(m => ({ ...m, [id]: { _notDonor: true, role, name: user.name || user.username || "Unknown" } }));
        return;
      }

      setDonorsMap(m => ({ ...m, [id]: user }));
    } catch { setDonorsMap(m => ({ ...m, [id]: { name: "Unknown", username: "unknown" } })); }
  }, [donorsMap]);

  const prefetchDonors = useCallback((forms) => {
    if (!Array.isArray(forms)) return;
    [...new Set(forms.map(f => getDonorIdFromForm(f)).filter(Boolean))].forEach(id => loadDonor(id));
  }, [loadDonor]);

  const fetchAll = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const token = getToken();
  const data = await getDonationForms().catch(() => ({ data: [] }));
  const list = Array.isArray(data) ? data : data.data || data.items || [];
  const arr = Array.isArray(list) ? list : [list];
  setItems(arr);
  prefetchDonors(arr);
    } catch (err) { setError(err.message || "Network error"); setItems([]); }
    finally { setLoading(false); }
  }, [prefetchDonors]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── Summary stats ── */
  const total    = items.length;
  const received = items.filter(f => (f.Status || f.status || "").toLowerCase() === "received").length;
  const pending  = items.filter(f => (f.Status || f.status || "").toLowerCase() === "pending").length;
  const totalItems = items.reduce((s, f) => s + (Array.isArray(f.items) ? f.items.length : 0), 0);

  /* ── PDF export (unchanged logic, same jsPDF) ── */
  function exportPDF() {
    if (!items.length) return;
    const loadScript = src => new Promise((res, rej) => {
      if (window.jspdf) return res();
      const s = document.createElement("script"); s.src = src;
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });

    loadScript("https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js")
      .then(async () => {
        const { jsPDF } = window.jspdf || {};
        if (!jsPDF) return alert("PDF generator failed to load");

        let logoDataUrl = null;
        try {
          const r = await fetch("/assets/logo-e2nN85Uy.png");
          if (r.ok) {
            const blob = await r.blob();
            logoDataUrl = await new Promise(res => { const rd = new FileReader(); rd.onload = () => res(rd.result); rd.readAsDataURL(blob); });
          }
        } catch {}

        const doc = new jsPDF({ unit: "pt", format: "a4" });
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 40;
        let y = 40;

        doc.setFillColor(3, 105, 90);
        doc.rect(0, 0, pageWidth, 72, "F");
        if (logoDataUrl) { try { doc.addImage(logoDataUrl, "PNG", margin, 12, 48, 48); } catch {} }
        doc.setFontSize(20); doc.setTextColor(255, 255, 255);
        const titleX = margin + (logoDataUrl ? 60 : 0);
        doc.text("NourishNet", titleX, 36);
        doc.setFontSize(11);
        doc.text("Donor Management Summary Report", titleX, 52);

        y = 92;
        const left = margin;
        const colWidths = [160, 200, 140, 90, 140, 40];
        const cols = [left];
        for (let i = 1; i < colWidths.length; i++) cols.push(cols[i - 1] + colWidths[i - 1]);

        doc.setFillColor(243, 244, 246);
        doc.rect(left - 4, y - 12, pageWidth - margin * 2 + 8, 18, "F");
        doc.setFontSize(10); doc.setTextColor(30, 41, 59); doc.setFont(undefined, "bold");
        ["Form ID", "Donor", "Contact", "Status", "Submitted At", "Items"].forEach((h, i) => doc.text(h, cols[i], y));
        doc.setFont(undefined, "normal"); y += 18;
        doc.setFontSize(9); doc.setTextColor(40, 40, 40);

        for (const f of items) {
          const id = f.donationFormId || f._id || f.id || "";
          const donorId = getDonorIdFromForm(f);
          const donor = (donorId && donorsMap[donorId]) || donorsMap[f.donorId || f.donor] || {};
          const values = [
            id, donor?.name || donor?.username || "Anonymous",
            donor?.email || donor?.phone || "", f.Status || f.status || "",
            f.createdAt ? new Date(f.createdAt).toLocaleString() : "-",
            String(Array.isArray(f.items) ? f.items.length : 0),
          ];
          values.forEach((v, ci) => {
            let text = String(v || "-");
            if (text.length > 30) text = text.slice(0, 27) + "…";
            doc.text(text, cols[ci], y);
          });
          y += 16;
          if (y > pageHeight - 60) { doc.addPage(); y = 60; }
        }

        doc.save("nourishnet-donor-management-report.pdf");
      })
      .catch(() => alert("Unable to generate PDF (library load failed)"));
  }

  /* ── Stat card data ── */
  const statCards = [
    { icon: FileText,   label: "Total Reports",  value: total,      accent: "#059669", bg: "#f0fdf4", border: "#bbf7d0" },
    { icon: CheckCircle2, label: "Received",      value: received,   accent: "#16a34a", bg: "#dcfce7", border: "#86efac" },
    { icon: Clock,      label: "Pending",         value: pending,    accent: "#d97706", bg: "#fef9c3", border: "#fde68a" },
    { icon: Package,    label: "Total Items",     value: totalItems, accent: "#0d9488", bg: "#f0fdfa", border: "#99f6e4" },
  ];

  /* ── Column config ── */
  const columns = [
    { key: "id",        label: "Form ID",      icon: Hash      },
    { key: "donor",     label: "Donor",        icon: User      },
    { key: "contact",   label: "Contact",      icon: Phone     },
    { key: "status",    label: "Status",       icon: TrendingUp },
    { key: "submitted", label: "Submitted At", icon: Calendar  },
    { key: "items",     label: "Items",        icon: Package   },
  ];

  return (
    <section style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

      {/* ── Header ── */}
      <header style={{ marginBottom: 28, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: "linear-gradient(135deg,#059669,#34d399)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 14px rgba(5,150,105,0.3)",
            }}>
              <FileText size={20} color="#fff" strokeWidth={2} />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: "#064e3b", margin: 0, letterSpacing: "-0.02em" }}>
                Donation Reports
              </h1>
              <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>NourishNet · Donor Management Summary</p>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={fetchAll}
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: "#fff", border: "1.5px solid #d1fae5",
              borderRadius: 12, padding: "9px 16px",
              fontSize: 13, fontWeight: 700, color: "#059669",
              cursor: "pointer", boxShadow: "0 1px 6px rgba(5,150,105,0.08)",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#f0fdf4"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; }}
          >
            <RefreshCw size={14} />
            Refresh
          </button>

          <button
            onClick={exportPDF}
            disabled={!items.length}
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: items.length ? "linear-gradient(135deg,#059669,#047857)" : "#e5e7eb",
              border: "none",
              borderRadius: 12, padding: "9px 18px",
              fontSize: 13, fontWeight: 700, color: items.length ? "#fff" : "#9ca3af",
              cursor: items.length ? "pointer" : "not-allowed",
              boxShadow: items.length ? "0 4px 16px rgba(5,150,105,0.28)" : "none",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { if (items.length) e.currentTarget.style.boxShadow = "0 6px 24px rgba(5,150,105,0.4)"; }}
            onMouseLeave={e => { if (items.length) e.currentTarget.style.boxShadow = "0 4px 16px rgba(5,150,105,0.28)"; }}
          >
            <Download size={14} />
            Download PDF
          </button>
        </div>
      </header>

      {/* ── Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {statCards.map(({ icon: Icon, label, value, accent, bg, border }) => (
          <div key={label} style={{
            background: "#fff",
            border: `1.5px solid ${border}`,
            borderRadius: 18, padding: "20px 22px",
            boxShadow: "0 2px 12px rgba(5,150,105,0.06)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(5,150,105,0.12)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(5,150,105,0.06)"; }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 11,
              background: bg, display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 14,
            }}>
              <Icon size={19} color={accent} strokeWidth={2} />
            </div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af", margin: "0 0 6px" }}>
              {label}
            </p>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: "#111827", margin: 0, letterSpacing: "-0.03em" }}>
              {loading ? "—" : value}
            </h2>
          </div>
        ))}
      </div>

      {/* ── Table Card ── */}
      <div style={{
        background: "#fff",
        border: "1.5px solid #d1fae5",
        borderRadius: 22,
        overflow: "hidden",
        boxShadow: "0 2px 20px rgba(5,150,105,0.07)",
      }}>
        {/* Table toolbar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px",
          borderBottom: "1.5px solid #f0fdf4",
          background: "linear-gradient(90deg,#f0fdf4,#fff)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FileText size={16} color="#059669" />
            <span style={{ fontSize: 15, fontWeight: 800, color: "#064e3b" }}>All Donation Forms</span>
            {!loading && (
              <span style={{
                background: "#dcfce7", color: "#15803d",
                fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
              }}>
                {items.length} records
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "#6b7280", fontWeight: 600 }}>
            <Filter size={13} color="#059669" />
            All statuses
          </div>
        </div>

        {/* States */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px", gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              border: "3px solid #d1fae5", borderTopColor: "#059669",
              animation: "spin 0.8s linear infinite",
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ fontSize: 14, color: "#6b7280", fontWeight: 600, margin: 0 }}>Loading report data…</p>
          </div>
        ) : error ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px", gap: 12 }}>
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <AlertCircle size={24} color="#dc2626" />
            </div>
            <p style={{ fontSize: 14, color: "#dc2626", fontWeight: 600, margin: 0 }}>{error}</p>
            <button onClick={fetchAll} style={{
              background: "#f0fdf4", border: "1.5px solid #bbf7d0",
              borderRadius: 10, padding: "8px 18px",
              fontSize: 13, fontWeight: 700, color: "#059669", cursor: "pointer",
            }}>
              Try Again
            </button>
          </div>
        ) : items.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px", gap: 12 }}>
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <InboxIcon size={24} color="#059669" />
            </div>
            <p style={{ fontSize: 14, color: "#6b7280", fontWeight: 600, margin: 0 }}>No donation records found.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  {columns.map(({ key, label, icon: Icon }) => (
                    <th key={key} style={{
                      padding: "12px 20px",
                      textAlign: "left",
                      fontSize: 10, fontWeight: 700,
                      letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af",
                      whiteSpace: "nowrap",
                    }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <Icon size={11} color="#059669" strokeWidth={2.5} />
                        {label}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {items
                  .filter(f => {
                    const donorId = getDonorIdFromForm(f);
                    const resolved = donorId ? donorsMap[donorId] : donorsMap[f.donorId || f.donor];
                    return !resolved || !resolved._notDonor;
                  })
                  .map((f, idx) => {
                  const id       = f.donationFormId || f._id || f.id || "";
                  const donorId  = getDonorIdFromForm(f);
                  const donor    = (donorId && donorsMap[donorId]) || donorsMap[f.donorId || f.donor] || {};
                  const donorName = donor?.name || donor?.username || extractNameFromForm(f) || "Anonymous";
                  const contact  = donor?.email || donor?.phone || "—";
                  const status   = f.Status || f.status || "";
                  const submitted = f.createdAt
                    ? new Date(f.createdAt).toLocaleString()
                    : f.submittedAt ? new Date(f.submittedAt).toLocaleString() : "—";
                  const itemCount = Array.isArray(f.items) ? f.items.length : 0;
                  const isEven   = idx % 2 === 0;

                  return (
                    <tr
                      key={id}
                      style={{
                        borderTop: "1px solid #f0fdf4",
                        background: isEven ? "#fff" : "#fafffe",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"}
                      onMouseLeave={e => e.currentTarget.style.background = isEven ? "#fff" : "#fafffe"}
                    >
                      {/* Form ID */}
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{
                          fontFamily: "monospace", fontSize: 11,
                          background: "#f1f5f9", color: "#475569",
                          border: "1px solid #e2e8f0",
                          borderRadius: 6, padding: "3px 8px",
                        }}>
                          {String(id).slice(-8) || "—"}
                        </span>
                      </td>

                      {/* Donor */}
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: 10,
                            background: "linear-gradient(135deg,#d1fae5,#a7f3d0)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12, fontWeight: 800, color: "#065f46", flexShrink: 0,
                          }}>
                            {(donorName)[0]?.toUpperCase() || "?"}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{donorName}</span>
                        </div>
                      </td>

                      {/* Contact */}
                      <td style={{ padding: "14px 20px", fontSize: 13, color: "#6b7280" }}>{contact}</td>

                      {/* Status */}
                      <td style={{ padding: "14px 20px" }}>
                        <StatusBadge status={status} />
                      </td>

                      {/* Submitted At */}
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6b7280" }}>
                          <Calendar size={12} color="#6ee7b7" />
                          {submitted}
                        </div>
                      </td>

                      {/* Items count */}
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          background: "#f0fdf4", color: "#059669",
                          border: "1.5px solid #bbf7d0",
                          borderRadius: 20, padding: "4px 10px",
                          fontSize: 12, fontWeight: 700,
                        }}>
                          <Package size={10} />
                          {itemCount}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Footer */}
            <div style={{
              padding: "14px 24px",
              borderTop: "1.5px solid #f0fdf4",
              background: "#fafffe",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
                Showing <strong style={{ color: "#059669" }}>{items.length}</strong> donation records
              </p>
              <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
                NourishNet Management Portal · {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
