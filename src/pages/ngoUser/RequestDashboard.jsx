import { useEffect, useMemo, useState } from "react";
import { filterMyRequests, getRequests } from "../../api";

export default function RequestDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await getRequests({ page: 1, limit: 100 });
      setRequests(filterMyRequests(res.items || []));
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => r.status === "PENDING").length;
    const approved = requests.filter(
      (r) => r.status === "APPROVED" || r.status === "PARTIALLY_APPROVED"
    ).length;
    const fulfilled = requests.filter((r) => r.status === "FULFILLED").length;
    const rejected = requests.filter((r) => r.status === "REJECTED").length;

    return { total, pending, approved, fulfilled, rejected };
  }, [requests]);

  const completionRate = useMemo(() => {
    if (!stats.total) return 0;
    return Math.round((stats.fulfilled / stats.total) * 100);
  }, [stats]);

  const urgencyMap = useMemo(() => {
    const total = requests.length || 1;
    const high = requests.filter((r) => r.urgencyLevel === "HIGH").length;
    const medium = requests.filter((r) => r.urgencyLevel === "MEDIUM").length;
    const low = requests.filter((r) => r.urgencyLevel === "LOW").length;

    const highPct = Math.round((high / total) * 100);
    const mediumPct = Math.round((medium / total) * 100);
    const lowPct = Math.round((low / total) * 100);
    const periodicPct = Math.max(0, 100 - highPct - mediumPct - lowPct);

    return [
      {
        label: "Critical Action",
        value: highPct,
        bar: "bg-red-500",
        text: "text-red-600",
      },
      {
        label: "High Priority",
        value: mediumPct,
        bar: "bg-[#004b49]",
        text: "text-[#004b49]",
      },
      {
        label: "Standard",
        value: lowPct,
        bar: "bg-[#003331]",
        text: "text-[#3f4948]",
      },
      {
        label: "Periodic",
        value: periodicPct,
        bar: "bg-[#bfc8c7]",
        text: "text-[#707978]",
      },
    ];
  }, [requests]);

  const monthlyData = useMemo(() => {
    const now = new Date();
    const months = [];

    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);

      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
        inbound: 0,
        fulfilled: 0,
      });
    }

    requests.forEach((req) => {
      const created = req.createdAt ? new Date(req.createdAt) : null;
      if (created && !Number.isNaN(created.getTime())) {
        const createdKey = `${created.getFullYear()}-${created.getMonth()}`;
        const createdMonth = months.find((m) => m.key === createdKey);
        if (createdMonth) {
          createdMonth.inbound += 1;
        }
      }

      if (
        req.status === "FULFILLED" ||
        req.status === "APPROVED" ||
        req.status === "PARTIALLY_APPROVED"
      ) {
        const completedAt = req.updatedAt
          ? new Date(req.updatedAt)
          : created;

        if (completedAt && !Number.isNaN(completedAt.getTime())) {
          const completedKey = `${completedAt.getFullYear()}-${completedAt.getMonth()}`;
          const completedMonth = months.find((m) => m.key === completedKey);
          if (completedMonth) {
            completedMonth.fulfilled += 1;
          }
        }
      }
    });

    return months;
  }, [requests]);

  const maxChartValue = useMemo(() => {
    return Math.max(
      1,
      ...monthlyData.flatMap((item) => [item.inbound, item.fulfilled])
    );
  }, [monthlyData]);

  const peopleServed = useMemo(() => {
    return requests
      .filter(
        (r) =>
          r.status === "APPROVED" ||
          r.status === "FULFILLED" ||
          r.status === "PARTIALLY_APPROVED"
      )
      .reduce((sum, r) => sum + Number(r.peopleCount || 0), 0);
  }, [requests]);

  const recentActivity = useMemo(() => {
    return [...requests]
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt) -
          new Date(a.updatedAt || a.createdAt)
      )
      .slice(0, 3);
  }, [requests]);

  const transparencyScore = useMemo(() => {
    if (!stats.total) return 0;
    return Math.min(
      100,
      Math.round(((stats.approved + stats.fulfilled) / stats.total) * 100)
    );
  }, [stats]);

  const approvedToday = useMemo(() => {
    const today = new Date().toDateString();
    return requests.filter((r) => {
      if (!r.updatedAt) return false;
      return (
        (r.status === "APPROVED" ||
          r.status === "FULFILLED" ||
          r.status === "PARTIALLY_APPROVED") &&
        new Date(r.updatedAt).toDateString() === today
      );
    }).length;
  }, [requests]);

  if (loading) {
    return (
      <div className="rounded-[32px] bg-white p-8 shadow-xl shadow-teal-900/5">
        <div className="flex items-center justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#b1eeea] border-t-[#004b49]" />
          <span className="ml-4 text-lg font-semibold text-[#3f4948]">
            Loading dashboard...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-10">
        <h2 className="text-4xl font-extrabold tracking-tight text-[#003331]">
          Operational Overview
        </h2>
        <p className="mt-2 text-lg text-[#3f4948]">
          Impact monitoring and real-time distribution metrics.
        </p>
      </div>

      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Requests"
          value={stats.total}
          icon="request_quote"
          badge={`${peopleServed} served`}
          badgeClass="text-[#003331] bg-[#003331]/5"
          iconWrap="bg-[#a5ede3] text-[#004b49]"
        />
        <StatCard
          title="Pending Approval"
          value={stats.pending}
          icon="pending_actions"
          badge="On Hold"
          badgeClass="text-[#1b6962] bg-[#1b6962]/5"
          iconWrap="bg-[#e4e9e9] text-[#3f4948]"
        />
        <StatCard
          title="Approved Today"
          value={approvedToday}
          icon="verified"
          badge="Processing"
          badgeClass="text-teal-600 bg-teal-50"
          iconWrap="bg-[#a8f0e3] text-[#005048]"
        />
        <StatCard
          title="Fulfilled"
          value={stats.fulfilled}
          icon="task_alt"
          badge={`${completionRate}% Rate`}
          badgeClass="text-[#003331] bg-[#003331]/5"
          iconWrap="bg-gradient-to-br from-[#003331] to-[#004b49] text-white"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="rounded-[32px] bg-[#eff5f5] p-8 lg:col-span-2">
          <div className="mb-10 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-[#003331]">
                Monthly Request Trajectory
              </h3>
              <p className="text-sm text-[#3f4948]">
                Comparative analysis of inflow vs fulfillment
              </p>
            </div>

            <div className="flex gap-2">
              <button className="rounded-full bg-[#dee3e3] px-4 py-2 text-xs font-bold text-[#171d1d]">
                Weekly
              </button>
              <button className="rounded-full bg-gradient-to-r from-[#003331] to-[#004b49] px-4 py-2 text-xs font-bold text-white shadow-md">
                Monthly
              </button>
            </div>
          </div>

          <div className="flex min-h-[320px] items-end justify-between gap-4">
            {monthlyData.map((item) => {
              const inboundHeight = Math.max(
                item.inbound > 0 ? 24 : 0,
                (item.inbound / maxChartValue) * 220
              );

              const fulfilledHeight = Math.max(
                item.fulfilled > 0 ? 24 : 0,
                (item.fulfilled / maxChartValue) * 220
              );

              return (
                <div
                  key={item.key}
                  className="flex h-[280px] w-full flex-col items-center justify-end gap-3"
                >
                  <div className="flex h-[220px] w-full items-end justify-center gap-3">
                    <div className="flex w-1/2 flex-col items-center justify-end">
                      <div
                        className="w-full rounded-t-xl bg-[#003331]/15 transition-all duration-500"
                        style={{ height: `${inboundHeight}px` }}
                        title={`Inbound: ${item.inbound}`}
                      />
                      <span className="mt-2 text-xs font-bold text-[#3f4948]">
                        {item.inbound}
                      </span>
                    </div>

                    <div className="flex w-1/2 flex-col items-center justify-end">
                      <div
                        className="w-full rounded-t-xl bg-gradient-to-t from-[#003331] to-[#004b49] transition-all duration-500"
                        style={{ height: `${fulfilledHeight}px` }}
                        title={`Fulfilled: ${item.fulfilled}`}
                      />
                      <span className="mt-2 text-xs font-bold text-[#003331]">
                        {item.fulfilled}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold tracking-[0.15em] text-[#3f4948]">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex gap-6">
            <LegendDot label="New Inbound" color="bg-[#003331]/20" />
            <LegendDot label="Fulfilled" color="bg-[#004b49]" />
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-8 shadow-xl shadow-teal-900/5">
          <h3 className="text-2xl font-bold text-[#003331]">Urgency Map</h3>
          <p className="mb-8 text-sm text-[#3f4948]">
            Priority distribution of active cases.
          </p>

          <div className="space-y-6">
            {urgencyMap.map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.18em]">
                  <span className={item.text}>{item.label}</span>
                  <span className="text-[#171d1d]">{item.value}%</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-[#dee3e3]">
                  <div
                    className={`h-full rounded-full ${item.bar}`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-[#003331]/5 bg-[#003331]/5 p-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#003331]">
                info
              </span>
              <p className="text-xs leading-relaxed text-[#084f4d]">
                Response visibility improves as your request volume and approvals
                grow over time.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#003331] to-[#004b49] p-8 text-white shadow-xl shadow-teal-900/10">
          <div className="relative z-10">
            <h3 className="text-3xl font-bold">Network Transparency</h3>
            <p className="mb-8 mt-2 max-w-sm text-[#b1eeea]">
              Current resource allocation trust score across your verified
              distribution pipeline.
            </p>

            <div className="flex items-center gap-12">
              <div className="relative flex h-28 w-28 items-center justify-center">
                <svg className="h-full w-full -rotate-90">
                  <circle
                    className="text-white/10"
                    cx="56"
                    cy="56"
                    r="50"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="8"
                  />
                  <circle
                    className="text-[#8cd4c7]"
                    cx="56"
                    cy="56"
                    r="50"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray="314"
                    strokeDashoffset={314 - (314 * transparencyScore) / 100}
                  />
                </svg>
                <span className="absolute text-2xl font-black">
                  {transparencyScore}%
                </span>
              </div>

              <div className="space-y-4">
                <IconRow icon="security" text="Verified Routing" />
                <IconRow icon="sync_saved_locally" text="Real-time Auditing" />
                <IconRow icon="hub" text={`${stats.total} Request Nodes`} />
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 opacity-10">
            <span
              className="material-symbols-outlined text-[200px]"
              style={{ fontVariationSettings: "'wght' 700" }}
            >
              architecture
            </span>
          </div>
        </div>

        <div className="rounded-[32px] bg-[#eff5f5] p-8">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-2xl font-bold text-[#003331]">Live Activity</h3>
          </div>

          <div className="relative space-y-0">
            <div className="absolute bottom-2 left-4 top-2 w-px bg-[#bfc8c7]/40" />
            {recentActivity.length === 0 ? (
              <p className="text-[#3f4948]">No recent activity yet.</p>
            ) : (
              recentActivity.map((item, index) => (
                <div
                  key={item._id || index}
                  className="group relative pb-6 pl-10 last:pb-0"
                >
                  <div className="absolute left-[13px] top-1 z-10 h-2 w-2 rounded-full bg-[#003331] ring-4 ring-[#eff5f5]" />
                  <div className="rounded-2xl border border-[#bfc8c7]/20 bg-white p-4 transition-shadow group-hover:shadow-md">
                    <div className="mb-1 flex justify-between gap-3">
                      <span className="text-sm font-bold text-[#003331]">
                        {item.organizationName || item.requestId || "Request Update"}
                      </span>
                      <span className="text-[10px] font-bold uppercase text-[#707978]">
                        {formatAgo(item.updatedAt || item.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-[#3f4948]">
                      Request {item.requestId || "record"} is currently marked as{" "}
                      <b>{item.status}</b>
                      {item.peopleCount ? ` for ${item.peopleCount} people.` : "."}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <button className="fixed bottom-8 right-8 z-20 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#003331] to-[#004b49] text-white shadow-2xl shadow-teal-900/30">
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>
    </div>
  );
}

function StatCard({ title, value, icon, badge, badgeClass, iconWrap }) {
  return (
    <div className="group relative overflow-hidden rounded-[28px] bg-white p-6 shadow-xl shadow-teal-900/5">
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#003331]/5 blur-2xl transition-colors group-hover:bg-[#003331]/10" />
      <div className="relative flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-full ${iconWrap}`}
          >
            <span className="material-symbols-outlined">{icon}</span>
          </span>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${badgeClass}`}>
            {badge}
          </span>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#3f4948]">
            {title}
          </p>
          <p className="mt-1 text-5xl font-black text-[#003331]">{value}</p>
        </div>
      </div>
    </div>
  );
}

function LegendDot({ label, color }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-3 w-3 rounded-full ${color}`} />
      <span className="text-xs font-bold text-[#3f4948]">{label}</span>
    </div>
  );
}

function IconRow({ icon, text }) {
  return (
    <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-[#8cd4c7]">{icon}</span>
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}

function formatAgo(dateValue) {
  if (!dateValue) return "now";
  const diff = Date.now() - new Date(dateValue).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}