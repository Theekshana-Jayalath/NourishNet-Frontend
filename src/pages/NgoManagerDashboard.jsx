import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

/* ───────────────────────── helpers ───────────────────────── */
const API = () => {
  const base = import.meta.env.VITE_API_URL
  return base ? `${base}/api/ngo-manager` : '/api/ngo-manager'
}

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`
})

const parseJsonSafe = async (response) => {
  const text = await response.text()
  try {
    return text ? JSON.parse(text) : {}
  } catch {
    return { raw: text }
  }
}

const badge = (status) => {
  const s = (status || '').toUpperCase()
  const map = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    APPROVED: 'bg-green-100 text-green-800 border-green-300',
    DECLINED: 'bg-red-100 text-red-800 border-red-300',
    ACTIVE: 'bg-green-100 text-green-800 border-green-300',
    INACTIVE: 'bg-gray-100 text-gray-800 border-gray-300',
    HIGH: 'bg-red-100 text-red-700 border-red-300',
    MEDIUM: 'bg-orange-100 text-orange-700 border-orange-300',
    LOW: 'bg-blue-100 text-blue-700 border-blue-300',
  }
  return map[s] || 'bg-gray-100 text-gray-700 border-gray-300'
}

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'

/* ─────────────────────── ICONS (inline SVG) ─────────────── */
const Icons = {
  dashboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
    </svg>
  ),
  applications: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  requests: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8" />
    </svg>
  ),
  users: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  logout: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  check: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  x: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  eye: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  refresh: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  menu: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
}

/* ═══════════════════════════════════════════════════════════ */
/*                   MAIN DASHBOARD COMPONENT                 */
/* ═══════════════════════════════════════════════════════════ */
const NgoManagerDashboard = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const role = (localStorage.getItem('role') || '').toLowerCase()
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const department = (user.department || '').toLowerCase()

    console.log('DASHBOARD AUTH CHECK =>', { role, department, hasToken: !!token, user })

    if (!token || role !== 'manager' || department !== 'ngo') {
      navigate('/login')
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Icons.dashboard },
    { id: 'applications', label: 'NGO Applications', icon: Icons.applications },
    { id: 'requests', label: 'NGO Requests', icon: Icons.requests },
    { id: 'users', label: 'NGO Users', icon: Icons.users },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-72 bg-gradient-to-b from-teal-800 to-teal-950 text-white
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        <div className="px-6 py-6 border-b border-teal-700/50">
          <h1 className="text-2xl font-extrabold tracking-tight">NourishNet</h1>
          <p className="text-teal-300 text-xs mt-1">NGO Manager Portal</p>
        </div>

        <div className="px-6 py-4 border-b border-teal-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center font-bold text-lg">
              {(user.name || 'M')[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-sm">{user.name || 'Manager'}</p>
              <p className="text-teal-300 text-xs">{user.email || ''}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); setSidebarOpen(false) }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${activeTab === t.id
                  ? 'bg-white/15 text-white shadow-lg shadow-teal-900/30'
                  : 'text-teal-200 hover:bg-white/10 hover:text-white'}
              `}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </nav>

        <div className="px-4 pb-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-teal-200 hover:bg-red-500/20 hover:text-red-300 transition-all"
          >
            {Icons.logout}
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
            {Icons.menu}
          </button>
          <h2 className="text-xl font-bold text-gray-800 capitalize">
            {tabs.find(t => t.id === activeTab)?.label || 'Dashboard'}
          </h2>
          <div className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {activeTab === 'dashboard' && <DashboardHome />}
          {activeTab === 'applications' && <ApplicationsTab />}
          {activeTab === 'requests' && <RequestsTab />}
          {activeTab === 'users' && <UsersTab />}
        </main>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════ */
/*                      DASHBOARD HOME                        */
/* ═══════════════════════════════════════════════════════════ */
const DashboardHome = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API()}/stats`, { headers: authHeaders() })
      .then(async (r) => {
        const d = await parseJsonSafe(r)
        console.log('STATS STATUS:', r.status)
        console.log('STATS DATA:', d)

        if (!r.ok) {
          throw new Error(d.message || 'Failed to fetch stats')
        }

        setStats(d)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Stats fetch error:', err)
        setStats(null)
        setLoading(false)
      })
  }, [])

  if (loading) return <Loader />

  const cards = [
    { title: 'Pending Applications', value: stats?.applications?.pending || 0, color: 'from-yellow-400 to-orange-500', icon: '📋' },
    { title: 'Approved Applications', value: stats?.applications?.approved || 0, color: 'from-green-400 to-emerald-600', icon: '✅' },
    { title: 'Pending Requests', value: stats?.requests?.pending || 0, color: 'from-blue-400 to-indigo-600', icon: '📨' },
    { title: 'Approved Requests', value: stats?.requests?.approved || 0, color: 'from-teal-400 to-cyan-600', icon: '🎉' },
    { title: 'Declined Requests', value: stats?.requests?.declined || 0, color: 'from-red-400 to-rose-600', icon: '❌' },
    { title: 'Active NGO Users', value: stats?.users?.active || 0, color: 'from-purple-400 to-violet-600', icon: '👥' },
  ]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((c, i) => (
          <div key={i} className={`bg-gradient-to-br ${c.color} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/80 text-sm font-medium">{c.title}</p>
                <p className="text-4xl font-extrabold mt-2">{c.value}</p>
              </div>
              <span className="text-3xl">{c.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SummaryCard title="Applications" data={stats?.applications} />
          <SummaryCard title="Requests" data={stats?.requests} />
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-700 mb-3">NGO Users</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="font-bold">{stats?.users?.total || 0}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Active</span><span className="font-bold text-green-600">{stats?.users?.active || 0}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const SummaryCard = ({ title, data }) => (
  <div className="bg-gray-50 rounded-xl p-4">
    <h4 className="font-semibold text-gray-700 mb-3">{title}</h4>
    <div className="space-y-2 text-sm">
      <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="font-bold">{data?.total || 0}</span></div>
      <div className="flex justify-between"><span className="text-gray-500">Pending</span><span className="font-bold text-yellow-600">{data?.pending || 0}</span></div>
      <div className="flex justify-between"><span className="text-gray-500">Approved</span><span className="font-bold text-green-600">{data?.approved || 0}</span></div>
      <div className="flex justify-between"><span className="text-gray-500">Declined</span><span className="font-bold text-red-600">{data?.declined || 0}</span></div>
    </div>
  </div>
)

/* ═══════════════════════════════════════════════════════════ */
/*                    APPLICATIONS TAB                        */
/* ═══════════════════════════════════════════════════════════ */
const ApplicationsTab = () => {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [selectedApp, setSelectedApp] = useState(null)
  const [actionLoading, setActionLoading] = useState('')
  const [declineReason, setDeclineReason] = useState('')
  const [showDeclineModal, setShowDeclineModal] = useState(null)

  const fetchApplications = useCallback(() => {
    setLoading(true)
    const url = filter ? `${API()}/applications?status=${filter}` : `${API()}/applications`

    fetch(url, { headers: authHeaders() })
      .then(async (r) => {
        const d = await parseJsonSafe(r)
        console.log('APPLICATIONS STATUS:', r.status)
        console.log('APPLICATIONS DATA:', d)

        if (!r.ok) {
          throw new Error(d.message || 'Failed to fetch applications')
        }

        setApplications(Array.isArray(d) ? d : [])
        setLoading(false)
      })
      .catch((err) => {
        console.error('Applications fetch error:', err)
        setApplications([])
        setLoading(false)
      })
  }, [filter])

  useEffect(() => { fetchApplications() }, [fetchApplications])

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this application? A user account will be created.')) return
    setActionLoading(id)
    try {
      const res = await fetch(`${API()}/applications/${id}/approve`, { method: 'PATCH', headers: authHeaders() })
      const data = await parseJsonSafe(res)
      if (res.ok) {
        alert('✅ ' + data.message)
        fetchApplications()
        setSelectedApp(null)
      } else {
        alert('❌ ' + (data.message || 'Error'))
      }
    } catch {
      alert('Network error')
    }
    setActionLoading('')
  }

  const handleDecline = async (id) => {
    setActionLoading(id)
    try {
      const res = await fetch(`${API()}/applications/${id}/decline`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ reason: declineReason })
      })
      const data = await parseJsonSafe(res)
      if (res.ok) {
        alert('Application declined')
        fetchApplications()
        setSelectedApp(null)
        setShowDeclineModal(null)
        setDeclineReason('')
      } else {
        alert('❌ ' + (data.message || 'Error'))
      }
    } catch {
      alert('Network error')
    }
    setActionLoading('')
  }

  const filtered = applications.filter(a =>
    (a.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.organizationName || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.applicationId || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap items-center gap-4">
        <input
          type="text"
          placeholder="Search by name, org, email, ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
        />
        <select value={filter} onChange={e => setFilter(e.target.value)} className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="declined">Declined</option>
        </select>
        <button onClick={fetchApplications} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-sm hover:bg-teal-700 transition">
          {Icons.refresh} Refresh
        </button>
      </div>

      {loading ? <Loader /> : filtered.length === 0 ? (
        <EmptyState message="No applications found" />
      ) : (
        <div className="grid gap-4">
          {filtered.map(app => (
            <div key={app._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-[250px]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                      {(app.name || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{app.name}</h3>
                      <p className="text-xs text-gray-500">{app.applicationId || app._id}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-3">
                    <Detail label="Organization" value={app.organizationName} />
                    <Detail label="Email" value={app.email} />
                    <Detail label="Contact" value={app.contact} />
                    <Detail label="City" value={app.city} />
                    <Detail label="NIC" value={app.nic} />
                    <Detail label="Reg. No" value={app.registrationNumber} />
                    <Detail label="Applied" value={fmt(app.appliedAt || app.createdAt)} />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badge((app.status || '').toUpperCase())}`}>
                    {(app.status || '').toUpperCase()}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedApp(app)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs hover:bg-gray-200 transition">
                      {Icons.eye} View
                    </button>
                    {(app.status || '').toLowerCase() === 'pending' && (
                      <>
                        <button
                          disabled={actionLoading === app._id}
                          onClick={() => handleApprove(app._id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs hover:bg-green-700 transition disabled:opacity-50"
                        >
                          {Icons.check} Approve
                        </button>
                        <button
                          disabled={actionLoading === app._id}
                          onClick={() => { setShowDeclineModal(app._id); setDeclineReason('') }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs hover:bg-red-700 transition disabled:opacity-50"
                        >
                          {Icons.x} Decline
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedApp && (
        <Modal title="Application Details" onClose={() => setSelectedApp(null)}>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-2xl">
                {(selectedApp.name || '?')[0].toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{selectedApp.name}</h3>
                <p className="text-sm text-gray-500">{selectedApp.applicationId}</p>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badge((selectedApp.status || '').toUpperCase())}`}>
                  {(selectedApp.status || '').toUpperCase()}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Detail label="Username" value={selectedApp.username} />
              <Detail label="Email" value={selectedApp.email} />
              <Detail label="Contact" value={selectedApp.contact} />
              <Detail label="NIC" value={selectedApp.nic} />
              <Detail label="Address" value={selectedApp.address} />
              <Detail label="City" value={selectedApp.city} />
              <Detail label="Organization" value={selectedApp.organizationName} />
              <Detail label="Reg. Number" value={selectedApp.registrationNumber} />
              <Detail label="Applied On" value={fmt(selectedApp.appliedAt || selectedApp.createdAt)} />
              <Detail label="Role" value={selectedApp.role} />
            </div>
            {selectedApp.members && selectedApp.members.length > 0 && (
              <div>
                <p className="font-semibold text-gray-700 mb-2">Members</p>
                <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                  {selectedApp.members.map((m, i) => (
                    <p key={i}>{typeof m === 'string' ? m : JSON.stringify(m)}</p>
                  ))}
                </div>
              </div>
            )}
            {(selectedApp.status || '').toLowerCase() === 'pending' && (
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => handleApprove(selectedApp._id)}
                  disabled={actionLoading === selectedApp._id}
                  className="flex-1 py-2.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition disabled:opacity-50"
                >
                  ✅ Approve Application
                </button>
                <button
                  onClick={() => { setShowDeclineModal(selectedApp._id); setDeclineReason('') }}
                  disabled={actionLoading === selectedApp._id}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-50"
                >
                  ❌ Decline Application
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {showDeclineModal && (
        <Modal title="Decline Application" onClose={() => setShowDeclineModal(null)}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Please provide a reason for declining this application:</p>
            <textarea
              value={declineReason}
              onChange={e => setDeclineReason(e.target.value)}
              rows={3}
              placeholder="Reason for declining..."
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
            />
            <div className="flex gap-3">
              <button
                onClick={() => handleDecline(showDeclineModal)}
                disabled={actionLoading === showDeclineModal}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-50"
              >
                Confirm Decline
              </button>
              <button
                onClick={() => setShowDeclineModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════ */
/*                      REQUESTS TAB                          */
/* ═══════════════════════════════════════════════════════════ */
const RequestsTab = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [selectedReq, setSelectedReq] = useState(null)
  const [actionLoading, setActionLoading] = useState('')
  const [declineReason, setDeclineReason] = useState('')
  const [showDeclineModal, setShowDeclineModal] = useState(null)

  const fetchRequests = useCallback(() => {
    setLoading(true)
    const url = filter ? `${API()}/requests?status=${filter}` : `${API()}/requests`

    fetch(url, { headers: authHeaders() })
      .then(async (r) => {
        const d = await parseJsonSafe(r)
        console.log('REQUESTS STATUS:', r.status)
        console.log('REQUESTS DATA:', d)

        if (!r.ok) {
          throw new Error(d.message || 'Failed to fetch requests')
        }

        setRequests(Array.isArray(d) ? d : [])
        setLoading(false)
      })
      .catch((err) => {
        console.error('Requests fetch error:', err)
        setRequests([])
        setLoading(false)
      })
  }, [filter])

  useEffect(() => { fetchRequests() }, [fetchRequests])

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this request?')) return
    setActionLoading(id)

    try {
      console.log('APPROVE CLICKED FOR ID:', id)

      const res = await fetch(`${API()}/requests/${id}/approve`, {
        method: 'PATCH',
        headers: authHeaders()
      })

      const data = await parseJsonSafe(res)

      console.log('APPROVE RESPONSE STATUS:', res.status)
      console.log('APPROVE RESPONSE DATA:', data)

      if (res.ok) {
        alert('✅ ' + (data.message || 'Request approved'))
        fetchRequests()
        setSelectedReq(null)
      } else {
        alert('❌ ' + (data.message || 'Error approving request'))
      }
    } catch (err) {
      console.error('Approve request error:', err)
      alert('Network error')
    }

    setActionLoading('')
  }

  const handleDecline = async (id) => {
    setActionLoading(id)

    try {
      console.log('DECLINE CLICKED FOR ID:', id)
      console.log('DECLINE REASON:', declineReason)

      const res = await fetch(`${API()}/requests/${id}/decline`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ reason: declineReason })
      })

      const data = await parseJsonSafe(res)

      console.log('DECLINE RESPONSE STATUS:', res.status)
      console.log('DECLINE RESPONSE DATA:', data)

      if (res.ok) {
        alert('✅ ' + (data.message || 'Request declined'))
        fetchRequests()
        setSelectedReq(null)
        setShowDeclineModal(null)
        setDeclineReason('')
      } else {
        alert('❌ ' + (data.message || 'Error declining request'))
      }
    } catch (err) {
      console.error('Decline request error:', err)
      alert('Network error')
    }

    setActionLoading('')
  }

  const filtered = requests.filter(r =>
    (r.organizationName || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.requestId || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.notes || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap items-center gap-4">
        <input
          type="text"
          placeholder="Search by org name, request ID, notes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
        />
        <select value={filter} onChange={e => setFilter(e.target.value)} className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm">
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="DECLINED">Declined</option>
        </select>
        <button onClick={fetchRequests} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-sm hover:bg-teal-700 transition">
          {Icons.refresh} Refresh
        </button>
      </div>

      {loading ? <Loader /> : filtered.length === 0 ? (
        <EmptyState message="No requests found" />
      ) : (
        <div className="grid gap-4">
          {filtered.map(req => (
            <div key={req._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-[250px]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                      {(req.organizationName || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{req.organizationName}</h3>
                      <p className="text-xs text-gray-500">{req.requestId || req._id}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-3">
                    <Detail label="Phone" value={req.contactPhone} />
                    <Detail label="People" value={req.peopleCount} />
                    <div>
                      <p className="text-gray-400 text-xs">Urgency</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${badge(req.urgencyLevel)}`}>
                        {req.urgencyLevel}
                      </span>
                    </div>
                    <Detail label="Needed Before" value={fmt(req.neededBefore)} />
                  </div>
                  {req.requestedItems && req.requestedItems.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-400 mb-1">Requested Items</p>
                      <div className="flex flex-wrap gap-1">
                        {req.requestedItems.map((item, i) => (
                          <span key={i} className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full text-xs border border-teal-200">
                            {typeof item === 'string' ? item : `${item.itemName || item.name || 'Item'} (${item.quantity || ''})`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {req.notes && <p className="text-xs text-gray-500 mt-2 italic">📝 {req.notes}</p>}
                </div>
                <div className="flex flex-col items-end gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badge(req.status)}`}>
                    {req.status}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedReq(req)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs hover:bg-gray-200 transition">
                      {Icons.eye} View
                    </button>
                    {req.status === 'PENDING' && (
                      <>
                        <button
                          disabled={actionLoading === req._id}
                          onClick={() => handleApprove(req._id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs hover:bg-green-700 transition disabled:opacity-50"
                        >
                          {Icons.check} Approve
                        </button>
                        <button
                          disabled={actionLoading === req._id}
                          onClick={() => { setShowDeclineModal(req._id); setDeclineReason('') }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs hover:bg-red-700 transition disabled:opacity-50"
                        >
                          {Icons.x} Decline
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedReq && (
        <Modal title="Request Details" onClose={() => setSelectedReq(null)}>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl">
                {(selectedReq.organizationName || '?')[0].toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{selectedReq.organizationName}</h3>
                <p className="text-sm text-gray-500">{selectedReq.requestId}</p>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badge(selectedReq.status)}`}>
                  {selectedReq.status}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Detail label="Contact Phone" value={selectedReq.contactPhone} />
              <Detail label="People Count" value={selectedReq.peopleCount} />
              <Detail label="Urgency Level" value={selectedReq.urgencyLevel} />
              <Detail label="Needed Before" value={fmt(selectedReq.neededBefore)} />
              <Detail label="Created At" value={fmt(selectedReq.createdAt)} />
            </div>
            {selectedReq.location && (
              <div>
                <p className="font-semibold text-gray-700 mb-1">Location</p>
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <p>{selectedReq.location.address || selectedReq.location.city || JSON.stringify(selectedReq.location)}</p>
                </div>
              </div>
            )}
            {selectedReq.requestedItems && selectedReq.requestedItems.length > 0 && (
              <div>
                <p className="font-semibold text-gray-700 mb-2">Requested Items</p>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  {selectedReq.requestedItems.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm border-b border-gray-200 pb-1 last:border-0">
                      <span>{typeof item === 'string' ? item : (item.itemName || item.name || `Item ${i + 1}`)}</span>
                      <span className="font-semibold">{typeof item === 'object' ? (item.quantity || '') : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selectedReq.dietaryNeeds && selectedReq.dietaryNeeds.length > 0 && (
              <div>
                <p className="font-semibold text-gray-700 mb-1">Dietary Needs</p>
                <div className="flex flex-wrap gap-1">
                  {selectedReq.dietaryNeeds.map((d, i) => (
                    <span key={i} className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs border border-purple-200">{d}</span>
                  ))}
                </div>
              </div>
            )}
            {selectedReq.notes && (
              <div>
                <p className="font-semibold text-gray-700 mb-1">Notes</p>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedReq.notes}</p>
              </div>
            )}
            {selectedReq.status === 'PENDING' && (
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => handleApprove(selectedReq._id)}
                  disabled={actionLoading === selectedReq._id}
                  className="flex-1 py-2.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition disabled:opacity-50"
                >
                  ✅ Approve Request
                </button>
                <button
                  onClick={() => { setShowDeclineModal(selectedReq._id); setDeclineReason('') }}
                  disabled={actionLoading === selectedReq._id}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-50"
                >
                  ❌ Decline Request
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {showDeclineModal && (
        <Modal title="Decline Request" onClose={() => setShowDeclineModal(null)}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Please provide a reason for declining this request:</p>
            <textarea
              value={declineReason}
              onChange={e => setDeclineReason(e.target.value)}
              rows={3}
              placeholder="Reason for declining..."
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
            />
            <div className="flex gap-3">
              <button
                onClick={() => handleDecline(showDeclineModal)}
                disabled={actionLoading === showDeclineModal}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-50"
              >
                Confirm Decline
              </button>
              <button
                onClick={() => setShowDeclineModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════ */
/*                       USERS TAB                            */
/* ═══════════════════════════════════════════════════════════ */
const UsersTab = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [actionLoading, setActionLoading] = useState('')

  const fetchUsers = useCallback(() => {
    setLoading(true)
    const url = statusFilter ? `${API()}/users?status=${statusFilter}` : `${API()}/users`

    fetch(url, { headers: authHeaders() })
      .then(async (r) => {
        const d = await parseJsonSafe(r)
        console.log('USERS STATUS:', r.status)
        console.log('USERS DATA:', d)

        if (!r.ok) {
          throw new Error(d.message || 'Failed to fetch users')
        }

        setUsers(Array.isArray(d) ? d : [])
        setLoading(false)
      })
      .catch((err) => {
        console.error('Users fetch error:', err)
        setUsers([])
        setLoading(false)
      })
  }, [statusFilter])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    if (!window.confirm(`${newStatus === 'ACTIVE' ? 'Activate' : 'Deactivate'} this user?`)) return
    setActionLoading(id)
    try {
      const res = await fetch(`${API()}/users/${id}/status`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status: newStatus })
      })
      const data = await parseJsonSafe(res)
      if (res.ok) fetchUsers()
      else alert(data.message || 'Error updating status')
    } catch {
      alert('Network error')
    }
    setActionLoading('')
  }

  const filtered = users.filter(u =>
    (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.username || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.organizationName || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.userId || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap items-center gap-4">
        <input
          type="text"
          placeholder="Search by name, username, email, org..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm">
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <button onClick={fetchUsers} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-sm hover:bg-teal-700 transition">
          {Icons.refresh} Refresh
        </button>
      </div>

      {loading ? <Loader /> : filtered.length === 0 ? (
        <EmptyState message="No NGO users found" />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">User</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Organization</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Contact</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">City</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Joined</th>
                  <th className="text-center px-6 py-4 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
                          {(user.name || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{user.name}</p>
                          <p className="text-xs text-gray-400">@{user.username} · {user.userId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{user.organizationName || '—'}</td>
                    <td className="px-6 py-4">
                      <p className="text-gray-700">{user.email}</p>
                      <p className="text-xs text-gray-400">{user.contact || user.contactNumber || ''}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{user.city || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badge(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{fmt(user.createdAt)}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        disabled={actionLoading === user._id}
                        onClick={() => toggleStatus(user._id, user.status)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50 ${
                          user.status === 'ACTIVE'
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════ */
/*                     SHARED COMPONENTS                      */
/* ═══════════════════════════════════════════════════════════ */
const Detail = ({ label, value }) => (
  <div>
    <p className="text-gray-400 text-xs">{label}</p>
    <p className="text-gray-800 font-medium">{value || '—'}</p>
  </div>
)

const Loader = () => (
  <div className="flex justify-center items-center py-20">
    <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
  </div>
)

const EmptyState = ({ message }) => (
  <div className="text-center py-20">
    <div className="text-5xl mb-4">📭</div>
    <p className="text-gray-500 text-lg">{message}</p>
  </div>
)

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition">
          {Icons.x}
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
)

export default NgoManagerDashboard