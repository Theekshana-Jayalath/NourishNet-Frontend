import React, { useEffect, useMemo, useState } from 'react'
import { API, authHeaders, parseJsonSafe, Loader, Icons } from './NgoManagerDashboard'

const StatCard = ({ title, value, accent = 'border-teal-600', dark = false, icon, tag }) => (
  <div
    className={`min-h-[180px] rounded-[30px] border-l-4 ${accent} ${
      dark ? 'bg-teal-800 text-white shadow-xl shadow-teal-900/10' : 'bg-white text-slate-900'
    } p-6`}
  >
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-start justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${dark ? 'bg-white/15' : 'bg-slate-100'}`}>
          {icon}
        </div>
        {tag && (
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${dark ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {tag}
          </span>
        )}
      </div>
      <div>
        <p className={`text-[11px] font-bold uppercase tracking-[0.22em] ${dark ? 'text-white/70' : 'text-slate-500'}`}>
          {title}
        </p>
        <h3 className="mt-2 text-4xl font-black">{value}</h3>
      </div>
    </div>
  </div>
)

const DashboardTab = ({ setActiveTab }) => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch(`${API()}/stats`, { headers: authHeaders() })
        const data = await parseJsonSafe(res)
        if (!res.ok) throw new Error(data.message || 'Failed to fetch stats')
        setStats(data)
      } catch (err) {
        console.error(err)
        setStats(null)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const activity = useMemo(() => {
    if (!stats) return []
    return [
      {
        title: 'Application Approved',
        text: `${stats?.applications?.approved || 0} total approved applications`,
        time: 'Live summary',
        dot: 'bg-emerald-400',
      },
      {
        title: 'Urgent Request',
        text: `${stats?.requests?.pending || 0} pending requests awaiting attention`,
        time: 'Latest sync',
        dot: 'bg-orange-300',
      },
      {
        title: 'NGO Users',
        text: `${stats?.users?.active || 0} active NGO users in the system`,
        time: 'Current',
        dot: 'bg-cyan-300',
      },
      {
        title: 'Applications Received',
        text: `${stats?.applications?.total || 0} total application records`,
        time: 'Updated',
        dot: 'bg-slate-300',
      },
    ]
  }, [stats])

  if (loading) return <Loader />

  const applicationTotal = stats?.applications?.total || 0
  const applicationPending = stats?.applications?.pending || 0
  const applicationApproved = stats?.applications?.approved || 0
  const requestPending = stats?.requests?.pending || 0
  const requestApproved = stats?.requests?.approved || 0
  const requestDeclined = stats?.requests?.declined || 0
  const activeUsers = stats?.users?.active || 0
  const totalUsers = stats?.users?.total || 0

  const appFulfillment = applicationTotal ? Math.round((applicationApproved / applicationTotal) * 100) : 0
  const requestFulfillment =
    requestPending + requestApproved + requestDeclined
      ? Math.round((requestApproved / (requestPending + requestApproved + requestDeclined)) * 100)
      : 0

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <h2 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            Welcome back, <span className="text-teal-800">{JSON.parse(localStorage.getItem('user') || '{}').name?.split(' ')[0] || 'Manager'}.</span>
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-700">
            Your dashboard is ready. Today you have{' '}
            <span className="font-bold text-teal-800">{applicationPending} new applications</span> and{' '}
            <span className="font-bold text-orange-700">{requestPending} urgent logistics requests</span> awaiting your approval.
          </p>
        </div>

        <div className="inline-flex items-center gap-3 self-start rounded-full bg-emerald-300 px-6 py-4 text-teal-900 shadow-sm">
          <span className="text-xl">🌿</span>
          <span className="font-bold">{requestApproved + applicationApproved} actions completed</span>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3 xl:grid-cols-5">
        <div className="md:col-span-2">
          <StatCard
            title="Pending Applications"
            value={applicationPending}
            accent="border-teal-700"
            dark
            icon={<span className="text-xl">📄</span>}
            tag="+ live"
          />
        </div>
        <StatCard title="Approved" value={applicationApproved} accent="border-emerald-400" icon={<span className="text-xl">✅</span>} />
        <StatCard title="Requests" value={requestPending} accent="border-orange-500" icon={<span className="text-xl">⚠️</span>} />
        <StatCard title="Active Users" value={activeUsers} accent="border-slate-300" icon={<span className="text-xl">👥</span>} />
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-8">
          <div className="rounded-[34px] bg-[#e8eef1] p-8">
            <div className="mb-8 flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900">Impact Overview</h3>
              <div className="flex rounded-full bg-white p-1">
                <button className="rounded-full bg-[#f3f7f8] px-4 py-2 text-sm font-bold text-teal-800">
                  Monthly
                </button>
                <button className="px-4 py-2 text-sm font-semibold text-slate-600">Yearly</button>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm font-semibold">
                  <span>Application Fulfillment</span>
                  <span className="text-teal-800">{appFulfillment}%</span>
                </div>
                <div className="h-4 rounded-full bg-emerald-200">
                  <div
                    className="h-4 rounded-full bg-teal-700 transition-all duration-500"
                    style={{ width: `${appFulfillment}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm font-semibold">
                  <span>Resource Allocation</span>
                  <span className="text-orange-700">{requestFulfillment}%</span>
                </div>
                <div className="h-4 rounded-full bg-orange-200">
                  <div
                    className="h-4 rounded-full bg-orange-700 transition-all duration-500"
                    style={{ width: `${requestFulfillment}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-[28px] bg-white p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Applications</p>
                <p className="mt-3 text-4xl font-black text-slate-900">{applicationTotal}</p>
                <p className="mt-2 text-sm font-semibold text-emerald-700">
                  {applicationApproved} approved / {applicationPending} pending
                </p>
              </div>

              <div className="rounded-[28px] bg-white p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Requests</p>
                <p className="mt-3 text-4xl font-black text-slate-900">
                  {requestPending + requestApproved + requestDeclined}
                </p>
                <p className="mt-2 text-sm font-semibold text-orange-700">
                  {requestApproved} approved / {requestPending} pending
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-5 text-2xl font-black text-slate-900">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <button
                onClick={() => setActiveTab('applications')}
                className="rounded-[28px] bg-white p-6 text-center shadow-sm transition hover:-translate-y-0.5"
              >
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-xl">
                  📄
                </div>
                <p className="font-semibold text-slate-800">Review Applications</p>
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className="rounded-[28px] bg-white p-6 text-center shadow-sm transition hover:-translate-y-0.5"
              >
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-xl">
                  👤
                </div>
                <p className="font-semibold text-slate-800">Manage Users</p>
              </button>

              <button
                onClick={() => setActiveTab('requests')}
                className="rounded-[28px] bg-white p-6 text-center shadow-sm transition hover:-translate-y-0.5"
              >
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-xl">
                  🚚
                </div>
                <p className="font-semibold text-slate-800">View Requests</p>
              </button>

              <button className="rounded-[28px] bg-white p-6 text-center shadow-sm transition hover:-translate-y-0.5">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-xl">
                  📊
                </div>
                <p className="font-semibold text-slate-800">Reports</p>
              </button>
            </div>
          </div>
        </div>

        <aside className="rounded-[34px] bg-white p-8">
          <div className="mb-8 flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-900">Recent Activity</h3>
            <span className="text-slate-300">{Icons.refresh}</span>
          </div>

          <div className="relative space-y-8">
            <div className="absolute left-4 top-4 bottom-4 w-px bg-slate-200" />
            {activity.map((item, idx) => (
              <div key={idx} className="relative flex gap-5">
                <div className={`relative z-10 mt-1 h-8 w-8 rounded-full ${item.dot} ring-4 ring-white`} />
                <div>
                  <p className="font-bold text-slate-900">{item.title}</p>
                  <p className="text-sm text-slate-600">{item.text}</p>
                  <p className="mt-1 text-xs text-slate-400">{item.time}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="mt-8 w-full border-t border-slate-200 pt-5 text-sm font-bold text-teal-800">
            View All Activity
          </button>

          <div className="mt-8 rounded-[28px] bg-emerald-600 p-6 text-white">
            <h4 className="text-lg font-black">Team Snapshot</h4>
            <p className="mt-2 text-sm text-emerald-50">
              {totalUsers} total users are registered and {activeUsers} are currently active in NGO operations.
            </p>
          </div>
        </aside>
      </section>
    </div>
  )
}

export default DashboardTab