import React, { useEffect, useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts'
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

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="rounded-2xl bg-white px-4 py-3 shadow-xl border border-slate-100">
      <p className="text-sm font-bold text-slate-900">{label}</p>
      <div className="mt-2 space-y-1">
        {payload.map((entry) => (
          <p key={entry.dataKey} className="text-sm font-medium" style={{ color: entry.color }}>
            {entry.name}: <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    </div>
  )
}

const DashboardTab = ({ setActiveTab }) => {
  const [stats, setStats] = useState(null)
  const [applications, setApplications] = useState([])
  const [requests, setRequests] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [impactView, setImpactView] = useState('weekly')

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [statsRes, applicationsRes, requestsRes, usersRes] = await Promise.all([
          fetch(`${API()}/stats`, { headers: authHeaders() }),
          fetch(`${API()}/applications`, { headers: authHeaders() }),
          fetch(`${API()}/requests`, { headers: authHeaders() }),
          fetch(`${API()}/users`, { headers: authHeaders() })
        ])

        const statsData = await parseJsonSafe(statsRes)
        const applicationsData = await parseJsonSafe(applicationsRes)
        const requestsData = await parseJsonSafe(requestsRes)
        const usersData = await parseJsonSafe(usersRes)

        if (!statsRes.ok) throw new Error(statsData.message || 'Failed to fetch stats')
        if (!applicationsRes.ok) throw new Error(applicationsData.message || 'Failed to fetch applications')
        if (!requestsRes.ok) throw new Error(requestsData.message || 'Failed to fetch requests')
        if (!usersRes.ok) throw new Error(usersData.message || 'Failed to fetch users')

        setStats(statsData)
        setApplications(Array.isArray(applicationsData) ? applicationsData : [])
        setRequests(Array.isArray(requestsData) ? requestsData : [])
        setUsers(Array.isArray(usersData) ? usersData : [])
      } catch (err) {
        console.error(err)
        setStats(null)
        setApplications([])
        setRequests([])
        setUsers([])
      } finally {
        setLoading(false)
      }
    }

    loadAll()
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

  const impactChartData = useMemo(() => {
    if (impactView === 'weekly') {
      const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      const today = new Date()
      const currentDay = today.getDay()
      const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay
      const monday = new Date(today)
      monday.setHours(0, 0, 0, 0)
      monday.setDate(today.getDate() + mondayOffset)

      const weekData = dayNames.map((day, index) => {
        const start = new Date(monday)
        start.setDate(monday.getDate() + index)
        start.setHours(0, 0, 0, 0)

        const end = new Date(start)
        end.setHours(23, 59, 59, 999)

        const approvedApplications = applications.filter((app) => {
          if (app.status !== 'approved') return false
          const date = new Date(app.approvedAt || app.updatedAt || app.createdAt)
          return date >= start && date <= end
        }).length

        const approvedRequests = requests.filter((req) => {
          if (req.status !== 'APPROVED') return false
          const date = new Date(req.approvedAt || req.updatedAt || req.createdAt)
          return date >= start && date <= end
        }).length

        const activeNgoUsers = users.filter((user) => {
          if (user.status !== 'ACTIVE') return false
          const date = new Date(user.updatedAt || user.createdAt)
          return date >= start && date <= end
        }).length

        return {
          label: day,
          approvedApplications,
          approvedRequests,
          activeNgoUsers
        }
      })

      return weekData
    }

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    const year = new Date().getFullYear()

    return monthNames.map((month, index) => {
      const approvedApplications = applications.filter((app) => {
        if (app.status !== 'approved') return false
        const date = new Date(app.approvedAt || app.updatedAt || app.createdAt)
        return date.getFullYear() === year && date.getMonth() === index
      }).length

      const approvedRequests = requests.filter((req) => {
        if (req.status !== 'APPROVED') return false
        const date = new Date(req.approvedAt || req.updatedAt || req.createdAt)
        return date.getFullYear() === year && date.getMonth() === index
      }).length

      const activeNgoUsers = users.filter((user) => {
        if (user.status !== 'ACTIVE') return false
        const date = new Date(user.updatedAt || user.createdAt)
        return date.getFullYear() === year && date.getMonth() === index
      }).length

      return {
        label: month,
        approvedApplications,
        approvedRequests,
        activeNgoUsers
      }
    })
  }, [impactView, applications, requests, users])

  if (loading) return <Loader />

  const applicationTotal = stats?.applications?.total || 0
  const applicationPending = stats?.applications?.pending || 0
  const applicationApproved = stats?.applications?.approved || 0
  const requestPending = stats?.requests?.pending || 0
  const requestApproved = stats?.requests?.approved || 0
  const requestDeclined = stats?.requests?.declined || 0
  const activeUsers = stats?.users?.active || 0
  const totalUsers = stats?.users?.total || 0

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
                <button
                  onClick={() => setImpactView('weekly')}
                  className={`rounded-full px-4 py-2 text-sm font-bold ${
                    impactView === 'weekly'
                      ? 'bg-[#f3f7f8] text-teal-800'
                      : 'text-slate-600'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setImpactView('monthly')}
                  className={`rounded-full px-4 py-2 text-sm font-bold ${
                    impactView === 'monthly'
                      ? 'bg-[#f3f7f8] text-teal-800'
                      : 'text-slate-600'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>

            <div className="h-[360px] rounded-[28px] bg-transparent">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={impactChartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                  barCategoryGap={impactView === 'weekly' ? '20%' : '35%'}
                >
                  <CartesianGrid strokeDasharray="4 4" stroke="#bfd0d5" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: '#334155', fontSize: 12, fontWeight: 700 }}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    angle={impactView === 'monthly' ? -20 : 0}
                    textAnchor={impactView === 'monthly' ? 'end' : 'middle'}
                    height={impactView === 'monthly' ? 70 : 40}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip cursor={false} content={<CustomTooltip />} />
                  <Bar dataKey="approvedApplications" name="Approved Applications" radius={[10, 10, 0, 0]} fill="#317873" />
                  <Bar dataKey="approvedRequests" name="Approved Requests" radius={[10, 10, 0, 0]} fill="#d97706" />
                  <Bar dataKey="activeNgoUsers" name="Active NGO Users" radius={[10, 10, 0, 0]} fill="#66ada4" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-[#317873]" />
                <span className="text-sm font-semibold text-slate-700">Approved Applications</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-[#d97706]" />
                <span className="text-sm font-semibold text-slate-700">Approved Requests</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-[#66ada4]" />
                <span className="text-sm font-semibold text-slate-700">Active NGO Users</span>
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