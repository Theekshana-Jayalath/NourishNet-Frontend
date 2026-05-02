import React, { useState, useEffect } from "react";
import { NavLink, Routes, Route, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Clock,
  Heart,
  Users,
  Bell,
  UserCircle2,
  Search,
  ChevronLeft,
  Menu,
  LogOut,
  TrendingUp,
  BarChart3,
  Megaphone,
  Settings,
  UserPlus,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Plus,
  Eye,
  Leaf,
  Star,
  Activity,
} from "lucide-react";

import PendingDonations from "./PendingDonations";
import ReceivedDonations from "./ReceivedDonations";
import DonorList from "./DonorList";
import DonationReports from "./DonationReports";
import DonorProfileView from "./DonorProfileView";
import { BASE_URL, getToken, getDonationForms } from "../../api";

// Small error boundary to catch render-time exceptions and show a helpful UI
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
    // also log to console for developer
    console.error('DonorManagerDashboard render error:', error, info);
  }

  reset = () => this.setState({ hasError: false, error: null, info: null });

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24 }}>
          <div style={{ background: '#fff7f7', border: '1px solid #fecaca', color: '#9b1c1c', padding: 16, borderRadius: 8 }}>
            <strong>Something went wrong rendering the Donor Manager dashboard.</strong>
            <div style={{ marginTop: 8, fontSize: 13 }}>
              {this.state.error && String(this.state.error)}
            </div>
            <div style={{ marginTop: 12 }}>
              <button onClick={() => window.location.reload()} style={{ marginRight: 8 }}>Reload page</button>
              <button onClick={this.reset}>Hide</button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function DonorManagerDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navItems = [
    { path: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "pending", label: "Pending Donations", icon: Clock },
    { path: "received", label: "Received Donations", icon: Heart },
    { path: "donors", label: "Donor List", icon: Users },
  ];

  const DashboardHome = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [donors, setDonors] = useState([]);
    const [donations, setDonations] = useState([]);

    useEffect(() => {
      let mounted = true;
      async function load() {
        setLoading(true);
        setError("");
        const token = getToken();
        try {
          const usersRes = await fetch(`http://localhost:3000/api/users?role=donor`, {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
          const usersData = await usersRes.json().catch(() => []);
          if (mounted) setDonors(Array.isArray(usersData) ? usersData : usersData.data || []);

          const donationsData = await getDonationForms().catch(() => ({ data: [] }));
          if (mounted) setDonations(Array.isArray(donationsData) ? donationsData : donationsData.data || []);
        } catch (err) {
          if (mounted) setError(err.message || "Failed to load dashboard data");
        } finally {
          if (mounted) setLoading(false);
        }
      }
      load();
      return () => { mounted = false; };
    }, []);

    const totalDonors = donors.length;
    const pendingCount = donations.filter((d) => (d.Status || d.status) === "Pending").length;
    const receivedCount = donations.filter((d) => (d.Status || d.status) === "Received").length;

    const now = new Date();
  // Monthly chart removed; showing hourly (last 24 hours) only

    // Hourly (last 24 hours) series
    const hours = Array.from({ length: 24 }).map((_, i) => {
      const date = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
      return {
        label: date.toLocaleTimeString(undefined, { hour: '2-digit', hour12: false }),
        hourStart: new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), 0, 0),
      };
    });

    const seriesHourly = hours.map((h, i) =>
      donations.filter((d) => {
        const created = d.createdAt ? new Date(d.createdAt) : (d.createdAtClient ? new Date(d.createdAtClient) : null);
        if (!created) return false;
        return created >= h.hourStart && created < new Date(h.hourStart.getTime() + 60 * 60 * 1000);
      }).length
    );

    const maxHourly = Math.max(1, ...seriesHourly);
    const chartWidth = 640;
    const chartHeight = 200;
    const pointsHourly = seriesHourly.map((v, i) => {
      const x = (i / (seriesHourly.length - 1)) * chartWidth + 30;
      const y = 30 + (1 - v / maxHourly) * (chartHeight - 60);
      return [x, y];
    });
  const pathHourly = pointsHourly.reduce((acc, p, i) => acc + `${i === 0 ? 'M' : 'L'}${p[0]} ${p[1]} `, '');
  const areaHourly = pathHourly + `L${pointsHourly[pointsHourly.length - 1][0]} ${chartHeight - 20} L${pointsHourly[0][0]} ${chartHeight - 20} Z`;

    const statCards = [
      {
        icon: Users,
        label: "Total Donors",
        value: totalDonors.toLocaleString(),
        badge: "+0%",
        badgeType: "success",
        accent: "#16a34a",
        bg: "#f0fdf4",
      },
      {
        icon: Clock,
        label: "Pending Donations",
        value: pendingCount.toString(),
        badge: pendingCount > 0 ? "Action Needed" : "All Clear",
        badgeType: pendingCount > 0 ? "warning" : "success",
        accent: "#f59e0b",
        bg: "#fffbeb",
      },
      {
        icon: TrendingUp,
        label: "Received Donations",
        value: receivedCount.toLocaleString(),
        badge: "+0%",
        badgeType: "success",
        accent: "#0d9488",
        bg: "#f0fdfa",
      },
    ];

    const quickActions = [
      { label: "Add Donor", icon: UserPlus, route: null },
      { label: "Reports", icon: BarChart3, route: "reports" },
      { label: "Campaigns", icon: Megaphone, route: null },
      { label: "Settings", icon: Settings, route: null },
    ];

    return (
      <div className="space-y-7">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "#fff",
              border: "1.5px solid #d1fae5",
              borderRadius: "16px",
              padding: "0 18px",
              height: "48px",
              width: "320px",
              boxShadow: "0 1px 6px rgba(4,120,87,0.06)",
            }}
          >
            <Search size={17} color="#6b7280" />
            <input
              placeholder="Search donors..."
              style={{
                border: "none",
                outline: "none",
                fontSize: "14px",
                color: "#374151",
                background: "transparent",
                width: "100%",
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                border: "1.5px solid #d1fae5",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 1px 4px rgba(4,120,87,0.07)",
                position: "relative",
              }}
            >
              <Bell size={19} color="#059669" />
              <span
                style={{
                  position: "absolute",
                  top: 9,
                  right: 10,
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#ef4444",
                  border: "1.5px solid #fff",
                }}
              />
            </button>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                background: "linear-gradient(135deg,#004b49,#16a34a)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 14px rgba(4,120,87,0.25)",
              }}
            >
              <UserCircle2 size={24} color="#fff" />
            </div>
          </div>
        </div>

        {/* Hero Banner */}
        <section
          style={{
            borderRadius: 28,
            background: "linear-gradient(120deg,#003d3a 0%,#065f46 45%,#047857 75%,#34d399 100%)",
            padding: "36px 40px",
            color: "#fff",
            boxShadow: "0 8px 40px rgba(4,120,87,0.22)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative circles */}
          <div
            style={{
              position: "absolute",
              top: -40,
              right: 180,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.05)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -60,
              right: 60,
              width: 280,
              height: 280,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.04)",
            }}
          />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, position: "relative" }}>
            <div>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: 20,
                  padding: "5px 14px",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#a7f3d0",
                  marginBottom: 14,
                }}
              >
                <Activity size={11} />
                Live Management Overview
              </span>
              <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
                Donor Management Dashboard
              </h1>
              <p style={{ marginTop: 10, fontSize: 14, color: "#a7f3d0", lineHeight: 1.6, maxWidth: 480 }}>
                NourishNet coordinates donors and distributions — live data shown below.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 20,
                  padding: "20px 32px",
                  textAlign: "center",
                  backdropFilter: "blur(8px)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 5, justifyContent: "center", marginBottom: 6 }}>
                  <Star size={12} color="#fde68a" fill="#fde68a" />
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#a7f3d0", margin: 0 }}>
                    Impact Score
                  </p>
                </div>
                <h2 style={{ fontSize: 44, fontWeight: 900, margin: 0, letterSpacing: "-0.03em" }}>98.4%</h2>
              </div>

              <button
                onClick={() => navigate("reports")}
                style={{
                  background: "rgba(255,255,255,0.18)",
                  border: "1px solid rgba(255,255,255,0.28)",
                  borderRadius: 14,
                  padding: "12px 20px",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  backdropFilter: "blur(8px)",
                  transition: "background 0.2s",
                }}
              >
                <BarChart3 size={15} />
                Generate Report
              </button>
            </div>
          </div>
        </section>

        {/* Main Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 20 }}>
          {/* Stat Cards */}
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                style={{
                  background: "#fff",
                  border: "1.5px solid #e6f7f0",
                  borderRadius: 22,
                  padding: "26px 24px",
                  boxShadow: "0 2px 16px rgba(4,120,87,0.06)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  cursor: "default",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(4,120,87,0.13)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 16px rgba(4,120,87,0.06)"; }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: card.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={22} color={card.accent} strokeWidth={2} />
                  </div>
                  <span
                    style={{
                      background: card.badgeType === "warning" ? "#fef3c7" : "#dcfce7",
                      color: card.badgeType === "warning" ? "#92400e" : "#15803d",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: 20,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {card.badgeType === "warning"
                      ? <AlertCircle size={10} />
                      : <ArrowUpRight size={10} />
                    }
                    {card.badge}
                  </span>
                </div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9ca3af", margin: 0 }}>
                  {card.label}
                </p>
                <h2 style={{ fontSize: 38, fontWeight: 900, color: "#111827", margin: "8px 0 0", letterSpacing: "-0.03em" }}>
                  {card.value}
                </h2>
              </div>
            );
          })}

          {/* Efficiency Ring */}
          <div
            style={{
              background: "#fff",
              border: "1.5px solid #e6f7f0",
              borderRadius: 22,
              padding: "26px 28px",
              boxShadow: "0 2px 16px rgba(4,120,87,0.06)",
              textAlign: "center",
              minWidth: 180,
            }}
          >
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9ca3af", margin: "0 0 16px" }}>
              Efficiency
            </p>
            <div style={{ position: "relative", display: "inline-block" }}>
              <svg width={96} height={96} viewBox="0 0 96 96">
                <circle cx={48} cy={48} r={40} fill="none" stroke="#d1fae5" strokeWidth={10} />
                <circle
                  cx={48} cy={48} r={40}
                  fill="none"
                  stroke="url(#effGrad)"
                  strokeWidth={10}
                  strokeDasharray={`${2 * Math.PI * 40 * 0.984} ${2 * Math.PI * 40}`}
                  strokeDashoffset={0}
                  strokeLinecap="round"
                  transform="rotate(-90 48 48)"
                />
                <defs>
                  <linearGradient id="effGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 18, fontWeight: 900, color: "#111827" }}>98.4%</span>
              </div>
            </div>
            <p style={{ fontSize: 11, color: "#6b7280", marginTop: 10, lineHeight: 1.5 }}>Top 2% of NGOs</p>
          </div>
        </div>

          {/* Hourly trend chart (last 24 hours) */}
          <div style={{ gridColumn: '1 / -1', background: '#fff', border: '1.5px solid #e6f7f0', borderRadius: 18, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#064e3b' }}>Donations (last 24 hours)</h3>
                <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>Hourly distribution of donation submissions</p>
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Max: {maxHourly}</div>
            </div>

            <svg width={700} height={220} viewBox={`0 0 700 220`} style={{ width: '100%', height: 220 }}>
              <defs>
                <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#d1fae5" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#d1fae5" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              <rect x={0} y={0} width={700} height={220} fill="transparent" />
              <path d={areaHourly} fill="url(#g1)" stroke="none" />
              <path d={pathHourly} fill="none" stroke="#059669" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
              {pointsHourly.map((p, i) => (
                <circle key={i} cx={p[0]} cy={p[1]} r={3.5} fill="#059669" />
              ))}
            </svg>
          </div>

        {/* Tasks row (monthly chart removed) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
          <div
            style={{
              background: "#fff",
              border: "1.5px solid #e6f7f0",
              borderRadius: 22,
              padding: "24px",
              boxShadow: "0 2px 16px rgba(4,120,87,0.06)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#064e3b", margin: 0 }}>Today's Tasks</h3>
              <span
                style={{
                  background: "#fef2f2",
                  color: "#dc2626",
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <AlertCircle size={10} />
                {pendingCount} Pending
              </span>
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Verify recent pending donations", priority: "High Priority", done: false },
                { label: "Send Tax Receipts Batch", priority: "Recurring", done: false },
                { label: "Update donor contact info", priority: "Low Priority", done: true },
              ].map((task, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 11,
                    padding: "12px 14px",
                    borderRadius: 14,
                    background: task.done ? "#f9fafb" : "#f0fdf4",
                    border: `1.5px solid ${task.done ? "#f3f4f6" : "#bbf7d0"}`,
                  }}
                >
                  <div style={{ marginTop: 1 }}>
                    {task.done
                      ? <CheckCircle2 size={16} color="#059669" fill="#dcfce7" />
                      : <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #6ee7b7", marginTop: 1 }} />
                    }
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: task.done ? "#9ca3af" : "#111827", margin: 0, textDecoration: task.done ? "line-through" : "none" }}>
                      {task.label}
                    </p>
                    <p style={{ fontSize: 11, color: "#9ca3af", margin: "3px 0 0" }}>{task.priority}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              style={{
                marginTop: 16,
                width: "100%",
                borderRadius: 12,
                border: "1.5px dashed #6ee7b7",
                background: "transparent",
                padding: "11px 0",
                fontSize: 13,
                fontWeight: 700,
                color: "#059669",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <Plus size={14} />
              Add Task
            </button>
          </div>
        </div>

        {/* Bottom: Quick Actions + Recent Donors */}
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 20 }}>
          {/* Quick Actions */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {quickActions.map(({ label, icon: Icon, route }) => (
              <button
                key={label}
                onClick={() => route && navigate(route)}
                style={{
                  background: "#fff",
                  border: "1.5px solid #e6f7f0",
                  borderRadius: 18,
                  padding: "20px 12px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 12,
                  color: "#374151",
                  boxShadow: "0 2px 12px rgba(4,120,87,0.06)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#f0fdf4"; e.currentTarget.style.color = "#059669"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#374151"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 13,
                    background: "#f0fdf4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={20} color="#059669" />
                </div>
                {label}
              </button>
            ))}
          </div>

          {/* Recent Donors Table */}
          <div
            style={{
              background: "#fff",
              border: "1.5px solid #e6f7f0",
              borderRadius: 22,
              overflow: "hidden",
              boxShadow: "0 2px 16px rgba(4,120,87,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 24px",
                borderBottom: "1px solid #f0fdf4",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Users size={17} color="#059669" />
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#064e3b", margin: 0 }}>Recent Donors</h3>
              </div>
              <button
                onClick={() => navigate("donors")}
                style={{
                  background: "#f0fdf4",
                  color: "#059669",
                  border: "none",
                  borderRadius: 10,
                  padding: "7px 14px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                View All <ArrowUpRight size={12} />
              </button>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  {["Donor Name", "Date", "Donations", "Type", "Actions"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 20px",
                        textAlign: "left",
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "#9ca3af",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {donors.slice(0, 6).map((donor) => {
                  const id = donor._id || donor.id;
                  const created = donor.createdAt || donor.createdAtClient || donor.registeredAt;
                  const donationCount = donations.filter((dd) => {
                    const ddId = dd.donorId && (dd.donorId._id || dd.donorId);
                    return ddId && id && ddId.toString() === id.toString();
                  }).length;

                  return (
                    <tr
                      key={id || Math.random()}
                      onClick={() => navigate(`profile/${id}`)}
                      style={{ borderTop: "1px solid #f0fdf4", cursor: "pointer", transition: "background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f9fffe"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ padding: "13px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 10,
                              background: "linear-gradient(135deg,#d1fae5,#a7f3d0)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 12,
                              fontWeight: 800,
                              color: "#065f46",
                            }}
                          >
                            {(donor.name || donor.fullName || "?")[0]?.toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>
                            {donor.name || donor.fullName || "—"}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "13px 20px", fontSize: 13, color: "#6b7280" }}>
                        {created ? new Date(created).toLocaleDateString() : "—"}
                      </td>
                      <td style={{ padding: "13px 20px" }}>
                        <span
                          style={{
                            background: "#dcfce7",
                            color: "#15803d",
                            fontWeight: 700,
                            fontSize: 12,
                            padding: "3px 10px",
                            borderRadius: 20,
                          }}
                        >
                          {donationCount}
                        </span>
                      </td>
                      <td style={{ padding: "13px 20px", fontSize: 13, color: "#6b7280" }}>
                        {donor.type || donor.category || "—"}
                      </td>
                      <td style={{ padding: "13px 20px" }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`donors?highlight=${id}`); }}
                          style={{
                            background: "#f0fdf4",
                            border: "none",
                            borderRadius: 8,
                            padding: "6px 13px",
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#059669",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <Eye size={12} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {loading && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#fff",
              border: "1.5px solid #e6f7f0",
              borderRadius: 12,
              padding: "12px 18px",
              fontSize: 13,
              color: "#6b7280",
              boxShadow: "0 1px 6px rgba(4,120,87,0.05)",
            }}
          >
            <Activity size={14} color="#059669" />
            Loading dashboard data…
          </div>
        )}

        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#fef2f2",
              border: "1.5px solid #fecaca",
              borderRadius: 12,
              padding: "12px 18px",
              fontSize: 13,
              color: "#dc2626",
              fontWeight: 600,
            }}
          >
            <AlertCircle size={14} />
            {error}
          </div>
        )}
      </div>
    );
  };

  return (
    <ErrorBoundary>
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "linear-gradient(135deg,#f9fafb 0%,#f0fdf4 50%,#ecfdf5 100%)",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: 50,
          height: "100vh",
          width: sidebarOpen ? 264 : 76,
          background: "linear-gradient(180deg,#022c22 0%,#064e3b 40%,#065f46 100%)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "4px 0 32px rgba(2,44,34,0.25)",
          transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
          overflow: "hidden",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: sidebarOpen ? "24px 20px 18px" : "24px 14px 18px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 13,
              background: "rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            <Leaf size={22} color="#6ee7b7" />
          </div>

          {sidebarOpen && (
            <div style={{ overflow: "hidden" }}>
              <h2 style={{ fontSize: 17, fontWeight: 900, color: "#fff", margin: 0, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
                NourishNet
              </h2>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6ee7b7", margin: 0 }}>
                Management Portal
              </p>
            </div>
          )}
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? "Collapse sidebar" : "Open sidebar"}
          title={sidebarOpen ? "Collapse sidebar" : "Open sidebar"}
          style={{
            margin: "12px 12px 4px",
            borderRadius: 10,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            padding: "6px",
            width: 36,
            height: 36,
            color: "#a7f3d0",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.15s, transform 0.12s",
          }}
        >
          {sidebarOpen ? (
            <ChevronLeft size={14} color="#a7f3d0" />
          ) : (
            <Menu size={14} color="#a7f3d0" />
          )}
        </button>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "8px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: sidebarOpen ? "12px 16px" : "12px",
                borderRadius: 14,
                background: isActive ? "#fff" : "transparent",
                color: isActive ? "#064e3b" : "#a7f3d0",
                fontWeight: 700,
                fontSize: 13,
                textDecoration: "none",
                transition: "all 0.2s",
                justifyContent: sidebarOpen ? "flex-start" : "center",
                boxShadow: isActive ? "0 2px 12px rgba(2,44,34,0.15)" : "none",
              })}
            >
              <Icon size={18} strokeWidth={2} />
              {sidebarOpen && <span style={{ whiteSpace: "nowrap" }}>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button
            onClick={logout}
            style={{
              width: "100%",
              borderRadius: 13,
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.3)",
              padding: "11px 16px",
              fontSize: 13,
              fontWeight: 700,
              color: "#fca5a5",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: sidebarOpen ? "flex-start" : "center",
              gap: 8,
              transition: "background 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.25)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.15)"}
          >
            <LogOut size={16} />
            {sidebarOpen && "Logout"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          minHeight: "100vh",
          padding: "32px",
          marginLeft: sidebarOpen ? 264 : 76,
          transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <Routes>
          <Route index element={<DashboardHome />} />
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="pending" element={<PendingDonations />} />
          <Route path="received" element={<ReceivedDonations />} />
          <Route path="donors" element={<DonorList />} />
          <Route path="reports" element={<DonationReports />} />
          <Route path="profile/:id" element={<DonorProfileView />} />
        </Routes>
      </main>
    </div>
    </ErrorBoundary>
  );
}
