import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  API,
  authHeaders,
  parseJsonSafe,
  badge,
  fmt,
  Loader,
  EmptyState,
  Detail,
  Modal,
  Icons,
} from './NgoManagerDashboard'

const ApplicationsTab = () => {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [selectedApp, setSelectedApp] = useState(null)
  const [actionLoading, setActionLoading] = useState('')
  const [declineReason, setDeclineReason] = useState('')
  const [showDeclineModal, setShowDeclineModal] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(null)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }

  const fetchApplications = useCallback(async () => {
    setLoading(true)
    try {
      const url = filter ? `${API()}/applications?status=${filter}` : `${API()}/applications`
      const res = await fetch(url, { headers: authHeaders() })
      const data = await parseJsonSafe(res)
      if (!res.ok) throw new Error(data.message || 'Failed to fetch applications')
      setApplications(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      setApplications([])
      showToast('Failed to fetch applications', 'error')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  const filtered = useMemo(() => {
    return applications.filter(
      (a) =>
        (a.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (a.organizationName || '').toLowerCase().includes(search.toLowerCase()) ||
        (a.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (a.applicationId || '').toLowerCase().includes(search.toLowerCase())
    )
  }, [applications, search])

  const pendingCount = applications.filter((a) => (a.status || '').toLowerCase() === 'pending').length
  const approvedCount = applications.filter((a) => (a.status || '').toLowerCase() === 'approved').length
  const declinedCount = applications.filter((a) => (a.status || '').toLowerCase() === 'declined').length

  const handleApprove = async (id) => {
    setActionLoading(id)

    try {
      const res = await fetch(`${API()}/applications/${id}/approve`, {
        method: 'PATCH',
        headers: authHeaders(),
      })
      const data = await parseJsonSafe(res)

      if (!res.ok) {
        showToast(data.message || 'Failed to approve application', 'error')
        return
      }

      showToast(data.message || 'Application approved successfully', 'success')
      fetchApplications()
      setSelectedApp(null)
      setShowConfirmModal(null)
    } catch (err) {
      console.error(err)
      showToast('Network error. Please try again.', 'error')
    } finally {
      setActionLoading('')
    }
  }

  const handleDecline = async (id) => {
    setActionLoading(id)

    try {
      const res = await fetch(`${API()}/applications/${id}/decline`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ reason: declineReason }),
      })
      const data = await parseJsonSafe(res)

      if (!res.ok) {
        showToast(data.message || 'Failed to decline application', 'error')
        return
      }

      showToast(data.message || 'Application declined successfully', 'success')
      fetchApplications()
      setSelectedApp(null)
      setShowDeclineModal(null)
      setDeclineReason('')
    } catch (err) {
      console.error(err)
      showToast('Network error. Please try again.', 'error')
    } finally {
      setActionLoading('')
    }
  }

  // Helper function to format member display
  const formatMemberDisplay = (member) => {
    if (typeof member === 'string') {
      try {
        const parsed = JSON.parse(member)
        if (parsed.name && parsed.contact) {
          return `${parsed.name} — ${parsed.contact}`
        }
        return member
      } catch {
        return member
      }
    }
    if (member && typeof member === 'object') {
      if (member.name && member.contact) {
        return `${member.name} — ${member.contact}`
      }
      if (member.name) {
        return member.name
      }
      if (member.contact) {
        return member.contact
      }
      return JSON.stringify(member)
    }
    return String(member)
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

      {/* Confirm Approval Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Confirm Approval</h3>
            </div>
            <p className="mb-6 text-slate-600">
              Approve this application? A user account will be created for this NGO.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleApprove(showConfirmModal)}
                disabled={actionLoading === showConfirmModal}
                className="flex-1 rounded-xl bg-teal-800 px-4 py-2 font-semibold text-white disabled:opacity-60"
              >
                {actionLoading === showConfirmModal ? 'Approving...' : 'Approve'}
              </button>
              <button
                onClick={() => setShowConfirmModal(null)}
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
          <h2 className="text-4xl font-black tracking-tight text-slate-900">Applications Registry</h2>
          <p className="mt-3 max-w-3xl text-lg text-slate-700">
            Review and manage intake for local community initiatives. Every approval brings us closer to a food-secure future.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setFilter('')}
            className={`rounded-full px-5 py-3 font-semibold ${filter === '' ? 'bg-white text-teal-800 shadow-sm' : 'bg-slate-100 text-slate-600'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`rounded-full px-5 py-3 font-semibold ${filter === 'pending' ? 'bg-white text-teal-800 shadow-sm' : 'bg-slate-100 text-slate-600'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`rounded-full px-5 py-3 font-semibold ${filter === 'approved' ? 'bg-white text-teal-800 shadow-sm' : 'bg-slate-100 text-slate-600'}`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('declined')}
            className={`rounded-full px-5 py-3 font-semibold ${filter === 'declined' ? 'bg-white text-teal-800 shadow-sm' : 'bg-slate-100 text-slate-600'}`}
          >
            Declined
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[30px] bg-white p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Total Active</p>
          <h3 className="mt-4 text-5xl font-black text-slate-900">{applications.length}</h3>
        </div>
        <div className="rounded-[30px] bg-teal-800 p-6 text-white shadow-lg shadow-teal-900/10">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/70">Awaiting Review</p>
          <h3 className="mt-4 text-5xl font-black">{pendingCount}</h3>
        </div>
        <div className="rounded-[30px] bg-emerald-300 p-6 text-teal-900">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-teal-800/80">Approved</p>
          <h3 className="mt-4 text-5xl font-black">{approvedCount}</h3>
        </div>
        <div className="rounded-[30px] bg-orange-700 p-6 text-white">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/80">Requires Attention</p>
          <h3 className="mt-4 text-5xl font-black">{declinedCount}</h3>
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
              placeholder="Search by name, organization, email, ID..."
              className="w-full rounded-full bg-slate-100 py-3 pl-12 pr-4 text-sm outline-none"
            />
          </div>

          <button
            onClick={fetchApplications}
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
        <EmptyState title="No applications found" text="Try changing your search or filter." />
      ) : (
        <section className="space-y-5">
          {filtered.map((app) => (
            <div key={app._id} className="rounded-[30px] bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-teal-100 font-bold text-teal-800">
                    {(app.name || '?')[0].toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-2xl font-bold text-slate-900">{app.name || 'Unknown Applicant'}</h3>
                    <p className="text-sm text-slate-500">{app.organizationName || 'No organization'}</p>

                    <div className="mt-5 grid grid-cols-1 gap-4 text-sm md:grid-cols-3 xl:grid-cols-4">
                      <Detail label="Email" value={app.email} />
                      <Detail label="Contact" value={app.contact} />
                      <Detail label="Applied Date" value={fmt(app.appliedAt || app.createdAt)} />
                      <Detail label="Application ID" value={app.applicationId || app._id} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 xl:items-end">
                  <span className={`inline-flex w-fit items-center rounded-full border px-4 py-1.5 text-xs font-bold ${badge(app.status)}`}>
                    {(app.status || 'UNKNOWN').toUpperCase()}
                  </span>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedApp(app)}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700"
                    >
                      {Icons.eye}
                      View Details
                    </button>

                    {(app.status || '').toLowerCase() === 'pending' && (
                      <>
                        <button
                          disabled={actionLoading === app._id}
                          onClick={() => setShowConfirmModal(app._id)}
                          className="inline-flex items-center gap-2 rounded-full bg-teal-800 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
                        >
                          {Icons.check}
                          Approve
                        </button>

                        <button
                          disabled={actionLoading === app._id}
                          onClick={() => {
                            setShowDeclineModal(app._id)
                            setDeclineReason('')
                          }}
                          className="inline-flex items-center gap-2 rounded-full bg-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60"
                        >
                          {Icons.x}
                          Decline
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {selectedApp && (
        <Modal title="Application Details" onClose={() => setSelectedApp(null)}>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-2xl font-bold text-teal-800">
                {(selectedApp.name || '?')[0].toUpperCase()}
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">{selectedApp.name}</h3>
                <p className="text-sm text-slate-500">{selectedApp.applicationId || selectedApp._id}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Detail label="Username" value={selectedApp.username} />
              <Detail label="Email" value={selectedApp.email} />
              <Detail label="Contact" value={selectedApp.contact} />
              <Detail label="NIC" value={selectedApp.nic} />
              <Detail label="Address" value={selectedApp.address} />
              <Detail label="City" value={selectedApp.city} />
              <Detail label="Organization" value={selectedApp.organizationName} />
              <Detail label="Registration Number" value={selectedApp.registrationNumber} />
              <Detail label="Role" value={selectedApp.role} />
              <Detail label="Applied On" value={fmt(selectedApp.appliedAt || selectedApp.createdAt)} />
            </div>

            {selectedApp.members && selectedApp.members.length > 0 && (
              <div>
                <p className="mb-2 font-bold text-slate-800">Members</p>
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 space-y-2">
                  {selectedApp.members.map((m, i) => (
                    <div key={i} className="flex items-center gap-2 border-b border-slate-200 pb-2 last:border-0">
                      <svg className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="font-medium">{formatMemberDisplay(m)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(selectedApp.status || '').toLowerCase() === 'pending' && (
              <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row">
                <button
                  onClick={() => {
                    setShowConfirmModal(selectedApp._id)
                    setSelectedApp(null)
                  }}
                  disabled={actionLoading === selectedApp._id}
                  className="flex-1 rounded-2xl bg-teal-800 px-5 py-3 font-semibold text-white disabled:opacity-60"
                >
                  Approve Application
                </button>
                <button
                  onClick={() => {
                    setShowDeclineModal(selectedApp._id)
                    setDeclineReason('')
                  }}
                  disabled={actionLoading === selectedApp._id}
                  className="flex-1 rounded-2xl bg-slate-200 px-5 py-3 font-semibold text-slate-700 disabled:opacity-60"
                >
                  Decline Application
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {showDeclineModal && (
        <Modal title="Decline Application" onClose={() => setShowDeclineModal(null)}>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Please provide a reason for declining this application.</p>
            <textarea
              rows={4}
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Reason for declining..."
              className="w-full rounded-2xl border border-slate-200 p-4 text-sm outline-none"
            />
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => handleDecline(showDeclineModal)}
                disabled={actionLoading === showDeclineModal}
                className="flex-1 rounded-2xl bg-rose-600 px-5 py-3 font-semibold text-white disabled:opacity-60"
              >
                Confirm Decline
              </button>
              <button
                onClick={() => setShowDeclineModal(null)}
                className="flex-1 rounded-2xl bg-slate-200 px-5 py-3 font-semibold text-slate-700"
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

export default ApplicationsTab