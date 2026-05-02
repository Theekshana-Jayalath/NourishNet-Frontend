import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  API,
  authHeaders,
  parseJsonSafe,
  badge,
  fmt,
  Loader,
  EmptyState,
  Icons,
} from './NgoManagerDashboard'

const UsersTab = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [actionLoading, setActionLoading] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const url = statusFilter ? `${API()}/users?status=${statusFilter}` : `${API()}/users`
      const res = await fetch(url, { headers: authHeaders() })
      const data = await parseJsonSafe(res)
      if (!res.ok) throw new Error(data.message || 'Failed to fetch users')
      setUsers(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      setUsers([])
      showToast('Failed to fetch users', 'error')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const filtered = useMemo(() => {
    return users.filter(
      (u) =>
        (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.username || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.organizationName || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.userId || '').toLowerCase().includes(search.toLowerCase())
    )
  }, [users, search])

  const activeCount = users.filter((u) => (u.status || '').toUpperCase() === 'ACTIVE').length
  const inactiveCount = users.filter((u) => (u.status || '').toUpperCase() === 'INACTIVE').length

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    
    setActionLoading(id)

    try {
      const res = await fetch(`${API()}/users/${id}/status`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await parseJsonSafe(res)

      if (!res.ok) {
        showToast(data.message || 'Failed to update user status', 'error')
        return
      }

      showToast(`User ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`, 'success')
      fetchUsers()
      setShowConfirmModal(null)
      setConfirmAction(null)
    } catch (err) {
      console.error(err)
      showToast('Network error', 'error')
    } finally {
      setActionLoading('')
    }
  }

  const openConfirmModal = (id, currentStatus) => {
    const action = currentStatus === 'ACTIVE' ? 'deactivate' : 'activate'
    setConfirmAction({ id, currentStatus, action })
    setShowConfirmModal(true)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-5 right-5 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className={`rounded-2xl px-6 py-4 shadow-lg ${
            toast.type === 'success' 
              ? 'bg-teal-800 text-white' 
              : 'bg-rose-600 text-white'
          }`}>
            <div className="flex items-center gap-3">
              {toast.type === 'success' ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span className="font-semibold">{toast.message}</span>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Action Modal */}
      {showConfirmModal && confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                confirmAction.action === 'deactivate' ? 'bg-rose-100' : 'bg-teal-100'
              }`}>
                {confirmAction.action === 'deactivate' ? (
                  <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                {confirmAction.action === 'deactivate' ? 'Deactivate User' : 'Activate User'}
              </h3>
            </div>
            <p className="mb-6 text-slate-600">
              {confirmAction.action === 'deactivate' 
                ? 'Are you sure you want to deactivate this user? They will lose access to the platform until reactivated.'
                : 'Are you sure you want to activate this user? They will regain full access to the platform.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => toggleStatus(confirmAction.id, confirmAction.currentStatus)}
                disabled={actionLoading === confirmAction.id}
                className={`flex-1 rounded-xl px-4 py-2 font-semibold text-white disabled:opacity-60 ${
                  confirmAction.action === 'deactivate' ? 'bg-rose-600' : 'bg-teal-800'
                }`}
              >
                {actionLoading === confirmAction.id 
                  ? 'Processing...' 
                  : confirmAction.action === 'deactivate' ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false)
                  setConfirmAction(null)
                }}
                className="flex-1 rounded-xl bg-slate-100 px-4 py-2 font-semibold text-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900">NGO Community</h2>
          <p className="mt-3 max-w-3xl text-lg text-slate-700">
            Manage organizational memberships, review impact reports, and coordinate active volunteer networks across NourishNet.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setStatusFilter('')}
            className={`rounded-full px-5 py-3 font-semibold ${statusFilter === '' ? 'bg-white text-teal-800 shadow-sm' : 'bg-slate-100 text-slate-600'}`}
          >
            All Users
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`rounded-full px-5 py-3 font-semibold ${statusFilter === 'ACTIVE' ? 'bg-white text-teal-800 shadow-sm' : 'bg-slate-100 text-slate-600'}`}
          >
            Active
          </button>
          <button
            onClick={() => setStatusFilter('INACTIVE')}
            className={`rounded-full px-5 py-3 font-semibold ${statusFilter === 'INACTIVE' ? 'bg-white text-teal-800 shadow-sm' : 'bg-slate-100 text-slate-600'}`}
          >
            Inactive
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-[30px] bg-white p-6 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Total Members</p>
          <h3 className="mt-4 text-5xl font-black text-slate-900">{users.length}</h3>
          <p className="mt-2 text-sm font-semibold text-teal-700">{activeCount} active right now</p>
        </div>

        <div className="rounded-[30px] bg-white p-6 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Active Organizations</p>
          <h3 className="mt-4 text-5xl font-black text-slate-900">
            {new Set(users.map((u) => u.organizationName).filter(Boolean)).size}
          </h3>
          <p className="mt-2 text-sm font-semibold text-emerald-700">Based on current user records</p>
        </div>

        <div className="rounded-[30px] bg-white p-6 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Inactive Users</p>
          <h3 className="mt-4 text-5xl font-black text-slate-900">{inactiveCount}</h3>
          <p className="mt-2 text-sm font-semibold text-orange-700">Accounts needing review</p>
        </div>
      </section>

      <section className="rounded-[30px] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{Icons.search}</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, username, email, organization..."
              className="w-full rounded-full bg-slate-100 py-3 pl-12 pr-4 text-sm outline-none"
            />
          </div>

          <button
            onClick={fetchUsers}
            className="inline-flex items-center gap-2 rounded-full bg-teal-800 px-5 py-3 text-sm font-semibold text-white"
          >
            {Icons.refresh}
            Refresh
          </button>
        </div>
      </section>

      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <EmptyState title="No NGO users found" text="Try changing your search or filter." />
      ) : (
        <>
          <section className="overflow-hidden rounded-[34px] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-[#e8eef1]">
                  <tr>
                    <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">User Name</th>
                    <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Organization</th>
                    <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Contact Info</th>
                    <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">City</th>
                    <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Status</th>
                    <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Joined Date</th>
                    <th className="px-6 py-5 text-right text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((user) => (
                    <tr key={user._id} className="border-t border-slate-100 hover:bg-slate-50/60">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 font-bold text-teal-800">
                              {(user.name || '?')[0].toUpperCase()}
                            </div>
                            <div
                              className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${
                                user.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-300'
                              }`}
                            />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{user.name || 'Unknown User'}</p>
                            <p className="text-sm text-slate-500">
                              {user.position || user.role || user.username || 'NGO Member'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-sm font-semibold text-slate-800">
                        {user.organizationName || '—'}
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-sm text-slate-800">{user.email || '—'}</p>
                        <p className="text-sm text-slate-500">{user.contact || user.contactNumber || '—'}</p>
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-700">{user.city || '—'}</td>

                      <td className="px-6 py-5">
                        <span className={`inline-flex rounded-full border px-4 py-1.5 text-xs font-bold ${badge(user.status)}`}>
                          {user.status || 'UNKNOWN'}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-600">{fmt(user.createdAt)}</td>

                      <td className="px-6 py-5 text-right">
                        <button
                          disabled={actionLoading === user._id}
                          onClick={() => openConfirmModal(user._id, user.status)}
                          className={`rounded-full px-5 py-2 text-sm font-semibold disabled:opacity-60 ${
                            user.status === 'ACTIVE'
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                          } transition-colors`}
                        >
                          {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                       </td>
                     </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-4 bg-[#e8eef1] px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                Showing {filtered.length} of {users.length} NGO Members
              </p>

              <div className="flex items-center gap-2">
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500">‹</button>
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-800 font-bold text-white">1</button>
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white font-bold text-slate-600">2</button>
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white font-bold text-slate-600">3</button>
                <span className="px-2 text-slate-400">…</span>
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500">›</button>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="relative overflow-hidden rounded-[34px] bg-teal-800 p-10 text-white">
              <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute bottom-6 right-8 text-8xl opacity-10">🛡️</div>

              <h3 className="relative z-10 text-3xl font-black">Compliance Integrity</h3>
              <p className="relative z-10 mt-5 max-w-xl text-lg leading-8 text-white/85">
                Regular verification of NGO credentials ensures that NourishNet maintains its high standard of impact and transparency for all community stakeholders.
              </p>
              <button className="relative z-10 mt-8 rounded-full bg-white px-7 py-4 font-bold text-teal-800">
                Run Audit Now
              </button>
            </div>

            <div className="rounded-[34px] bg-[#e8eef1] p-8">
              <h3 className="text-3xl font-black text-slate-900">Recent Activity Log</h3>

              <div className="mt-8 space-y-6">
                {filtered.slice(0, 3).map((user, index) => (
                  <div key={user._id || index} className="flex gap-4">
                    <div
                      className={`mt-2 h-2.5 w-2.5 rounded-full ring-4 ${
                        user.status === 'ACTIVE'
                          ? 'bg-emerald-500 ring-emerald-100'
                          : 'bg-orange-500 ring-orange-100'
                      }`}
                    />
                    <div>
                      <p className="text-sm leading-7 text-slate-800">
                        <span className="font-bold">{user.name || 'User'}</span>{' '}
                        {user.status === 'ACTIVE'
                          ? 'is currently active in the NGO network.'
                          : 'account is marked inactive and may need review.'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {fmt(user.createdAt)} • {user.organizationName || 'No organization'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}

export default UsersTab