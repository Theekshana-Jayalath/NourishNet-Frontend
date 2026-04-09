import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardTab from './DashboardTab'
import ApplicationsTab from './ApplicationsTab'
import RequestsTab from './RequestsTab'
import UsersTab from './UsersTab'

/* helpers */
export const API = () => {
  const base = import.meta.env.VITE_API_URL
  return base ? `${base}/api/ngo-manager` : '/api/ngo-manager'
}

export const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
})

export const parseJsonSafe = async (response) => {
  const text = await response.text()
  try {
    return text ? JSON.parse(text) : {}
  } catch {
    return { raw: text }
  }
}

export const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—'

export const fmtDateTime = (d) =>
  d
    ? new Date(d).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : '—'

export const getInitials = (name = 'Manager') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')

export const badge = (status) => {
  const s = (status || '').toUpperCase()
  const map = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    DECLINED: 'bg-rose-50 text-rose-700 border-rose-200',
    ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    INACTIVE: 'bg-slate-100 text-slate-600 border-slate-200',
    HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
    MEDIUM: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    LOW: 'bg-slate-100 text-slate-600 border-slate-200',
  }
  return map[s] || 'bg-slate-100 text-slate-700 border-slate-200'
}

/* shared components */
export const Loader = () => (
  <div className="flex items-center justify-center py-20">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-100 border-t-teal-700" />
  </div>
)

export const EmptyState = ({ title = 'No data found', text = 'Nothing to show right now.' }) => (
  <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/70 py-20 text-center">
    <div className="mb-4 text-5xl">📭</div>
    <h3 className="text-xl font-bold text-slate-800">{title}</h3>
    <p className="mt-2 text-sm text-slate-500">{text}</p>
  </div>
)

export const Detail = ({ label, value }) => (
  <div>
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
    <p className="mt-1 break-words text-sm font-medium text-slate-800">{value || '—'}</p>
  </div>
)

export const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
    <div
      className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[28px] bg-white shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <button
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
        >
          ✕
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
)

/* icons */
export const Icons = {
  dashboard: (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M3 3h8v8H3V3Zm10 0h8v5h-8V3ZM3 13h8v8H3v-8Zm10-3h8v11h-8V10Z" />
    </svg>
  ),
  applications: (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M7 2h7l5 5v13a2 2 0 0 1-2 2H7a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3Zm7 1.5V8h4.5" />
      <path d="M8 12h8v1.5H8V12Zm0 4h8v1.5H8V16Z" />
    </svg>
  ),
  requests: (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M4 5h16v2H4V5Zm0 6h16v2H4v-2Zm0 6h10v2H4v-2Z" />
    </svg>
  ),
  users: (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M16 11a4 4 0 1 0-3.999-4A4 4 0 0 0 16 11ZM8 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm8 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4ZM8 14c-.29 0-.62.02-.97.05C4.6 14.27 0 15.43 0 18v2h6v-2c0-1.55.8-2.9 2.23-4-.08 0-.15 0-.23 0Z" />
    </svg>
  ),
  logout: (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M10 17v-2h4V9h-4V7h4a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-4Zm-1 4H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4v2H5v14h4v2Zm10.59-4.59L22 14l-2.41-2.41L18.17 13H9v2h9.17l1.42 1.41Z" />
    </svg>
  ),
  search: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  ),
  bell: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
      <path d="M9 17a3 3 0 0 0 6 0" />
    </svg>
  ),
  menu: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  refresh: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" />
    </svg>
  ),
  eye: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  check: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="m5 12 5 5L20 7" />
    </svg>
  ),
  x: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M6 18 18 6M6 6l12 12" />
    </svg>
  ),
}

/* main page */
const NgoManagerDashboard = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = (localStorage.getItem('role') || '').toLowerCase()
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const department = (user.department || '').toLowerCase()

    if (!token || role !== 'manager' || department !== 'ngo') {
      navigate('/login')
    }
  }, [navigate])

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Icons.dashboard },
    { id: 'applications', label: 'Applications', icon: Icons.applications },
    { id: 'requests', label: 'Requests', icon: Icons.requests },
    { id: 'users', label: 'Users', icon: Icons.users },
  ]

  const renderTab = () => {
    switch (activeTab) {
      case 'applications':
        return <ApplicationsTab />
      case 'requests':
        return <RequestsTab />
      case 'users':
        return <UsersTab />
      default:
        return <DashboardTab setActiveTab={setActiveTab} />
    }
  }

  return (
    <div className="min-h-screen bg-[#edf3f5] text-slate-900">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-[#e8f3f1] px-5 py-6 shadow-sm transition-transform duration-300 lg:translate-x-0 lg:rounded-r-[42px] ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-8 px-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-800 text-white">
              <span className="text-lg">🍽️</span>
            </div>
            <div>
              <h1 className="text-3xl font-black leading-none text-teal-900">NourishNet</h1>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-teal-700/70">
                Management Portal
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {tabs.map((tab) => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setSidebarOpen(false)
                }}
                className={`flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left transition ${
                  active
                    ? 'bg-[#d6f1ea] text-teal-900 shadow-sm ring-1 ring-teal-200'
                    : 'text-slate-600 hover:bg-white/60'
                }`}
              >
                <span className={active ? 'text-teal-800' : 'text-slate-500'}>{tab.icon}</span>
                <span className="text-lg font-semibold">{tab.label}</span>
                {active && <span className="ml-auto h-8 w-1 rounded-full bg-teal-700" />}
              </button>
            )
          })}
        </nav>

        <div className="mt-6 border-t border-teal-100 pt-5">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-rose-600 hover:bg-rose-50"
          >
            {Icons.logout}
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/85 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                className="rounded-xl bg-slate-100 p-2 text-slate-700 lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                {Icons.menu}
              </button>

              <div className="relative hidden w-[340px] max-w-[46vw] md:block lg:w-[420px]">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  {Icons.search}
                </span>
                <input
                  type="text"
                  placeholder={
                    activeTab === 'applications'
                      ? 'Search applications, NGOs, or IDs...'
                      : activeTab === 'requests'
                      ? 'Search requests, organizations, or items...'
                      : activeTab === 'users'
                      ? 'Search NGO members, organizations or status...'
                      : 'Search initiatives, users...'
                  }
                  className="w-full rounded-full border-none bg-slate-100 py-3 pl-12 pr-4 text-sm text-slate-700 outline-none ring-0 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-5">
              <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100">
                {Icons.bell}
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-white" />
              </button>

              <div className="hidden h-8 w-px bg-slate-200 sm:block" />

              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-bold text-slate-900">{user.name || 'NGO Manager'}</p>
                  <p className="text-xs text-slate-500">{user.department || 'NGO Department'}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-teal-200 bg-teal-800 font-bold text-white">
                  {getInitials(user.name || 'Manager')}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{renderTab()}</main>
      </div>
    </div>
  )
}

export default NgoManagerDashboard