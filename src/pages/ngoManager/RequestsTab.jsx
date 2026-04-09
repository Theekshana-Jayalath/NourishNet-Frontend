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

const RequestsTab = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [selectedReq, setSelectedReq] = useState(null)
  const [actionLoading, setActionLoading] = useState('')
  const [declineReason, setDeclineReason] = useState('')
  const [showDeclineModal, setShowDeclineModal] = useState(null)

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const url = filter ? `${API()}/requests?status=${filter}` : `${API()}/requests`
      const res = await fetch(url, { headers: authHeaders() })
      const data = await parseJsonSafe(res)
      if (!res.ok) throw new Error(data.message || 'Failed to fetch requests')
      setRequests(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      setRequests([])
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const filtered = useMemo(() => {
    return requests.filter(
      (r) =>
        (r.organizationName || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.requestId || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.notes || '').toLowerCase().includes(search.toLowerCase())
    )
  }, [requests, search])

  const pendingCount = requests.filter((r) => (r.status || '').toUpperCase() === 'PENDING').length
  const approvedCount = requests.filter((r) => (r.status || '').toUpperCase() === 'APPROVED').length
  const declinedCount = requests.filter((r) => (r.status || '').toUpperCase() === 'DECLINED').length

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this request?')) return
    setActionLoading(id)

    try {
      const res = await fetch(`${API()}/requests/${id}/approve`, {
        method: 'PATCH',
        headers: authHeaders(),
      })
      const data = await parseJsonSafe(res)

      if (!res.ok) {
        alert(data.message || 'Failed to approve request')
        return
      }

      alert(data.message || 'Request approved')
      fetchRequests()
      setSelectedReq(null)
    } catch (err) {
      console.error(err)
      alert('Network error')
    } finally {
      setActionLoading('')
    }
  }

  const handleDecline = async (id) => {
    setActionLoading(id)

    try {
      const res = await fetch(`${API()}/requests/${id}/decline`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ reason: declineReason }),
      })
      const data = await parseJsonSafe(res)

      if (!res.ok) {
        alert(data.message || 'Failed to decline request')
        return
      }

      alert(data.message || 'Request declined')
      fetchRequests()
      setSelectedReq(null)
      setShowDeclineModal(null)
      setDeclineReason('')
    } catch (err) {
      console.error(err)
      alert('Network error')
    } finally {
      setActionLoading('')
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900">Resource Requests</h2>
          <p className="mt-3 max-w-3xl text-lg text-slate-700">
            Manage and fulfill logistics requests from partner NGOs.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setFilter('')}
            className={`rounded-full px-5 py-3 font-semibold ${filter === '' ? 'bg-white text-teal-800 shadow-sm' : 'bg-slate-100 text-slate-600'}`}
          >
            All Requests
          </button>
          <button
            onClick={() => setFilter('PENDING')}
            className={`rounded-full px-5 py-3 font-semibold ${filter === 'PENDING' ? 'bg-white text-teal-800 shadow-sm' : 'bg-slate-100 text-slate-600'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('APPROVED')}
            className={`rounded-full px-5 py-3 font-semibold ${filter === 'APPROVED' ? 'bg-white text-teal-800 shadow-sm' : 'bg-slate-100 text-slate-600'}`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('DECLINED')}
            className={`rounded-full px-5 py-3 font-semibold ${filter === 'DECLINED' ? 'bg-white text-teal-800 shadow-sm' : 'bg-slate-100 text-slate-600'}`}
          >
            Declined
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_340px]">
        <div className="rounded-[34px] bg-[#e8eef1] p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-700">
              Pending ({pendingCount})
            </div>
            <div className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-700">
              Approved ({approvedCount})
            </div>
            <div className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-700">
              Declined ({declinedCount})
            </div>
            <button
              onClick={fetchRequests}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-teal-800 px-5 py-3 text-sm font-semibold text-white"
            >
              {Icons.refresh}
              Refresh
            </button>
          </div>
        </div>

        <div className="rounded-[34px] bg-teal-800 p-6 text-white">
          <p className="text-sm text-white/80">Impact Goal</p>
          <h3 className="mt-2 text-5xl font-black">{approvedCount}</h3>
          <p className="mt-1 text-sm text-white/80">approved requests</p>
          <div className="mt-5 h-3 rounded-full bg-white/20">
            <div
              className="h-3 rounded-full bg-white"
              style={{
                width: `${requests.length ? Math.max(10, Math.round((approvedCount / requests.length) * 100)) : 0}%`,
              }}
            />
          </div>
          <p className="mt-3 text-sm text-white/80">
            {requests.length ? Math.round((approvedCount / requests.length) * 100) : 0}% of requests approved
          </p>
        </div>
      </section>

      <section className="rounded-[30px] bg-white p-5 shadow-sm">
        <div className="relative w-full lg:max-w-md">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{Icons.search}</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by organization, request ID, notes..."
            className="w-full rounded-full bg-slate-100 py-3 pl-12 pr-4 text-sm outline-none"
          />
        </div>
      </section>

      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <EmptyState title="No requests found" text="Try changing your search or filter." />
      ) : (
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {filtered.map((req) => (
            <div key={req._id} className="rounded-[34px] bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-lg">
                  📦
                </div>
                <span className={`inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-bold ${badge(req.urgencyLevel)}`}>
                  {(req.urgencyLevel || 'LOW').toUpperCase()} URGENCY
                </span>
              </div>

              <h3 className="text-3xl font-black leading-tight text-slate-900">
                {req.organizationName || 'Unknown Organization'}
              </h3>

              <p className="mt-2 text-sm text-slate-500">{req.requestId || req._id}</p>

              <div className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">People Count</span>
                  <span className="font-semibold text-slate-900">{req.peopleCount || '—'}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Needed Before</span>
                  <span className="font-semibold text-slate-900">{fmt(req.neededBefore)}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Status</span>
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${badge(req.status)}`}>
                    {req.status || 'UNKNOWN'}
                  </span>
                </div>
              </div>

              {req.requestedItems && req.requestedItems.length > 0 && (
                <div className="mt-6 border-t border-slate-100 pt-5">
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Requested Items</p>
                  <div className="flex flex-wrap gap-2">
                    {req.requestedItems.slice(0, 3).map((item, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
                      >
                        {typeof item === 'string'
                          ? item
                          : `${item.itemName || item.name || 'Item'}${item.quantity ? ` (${item.quantity})` : ''}`}
                      </span>
                    ))}
                    {req.requestedItems.length > 3 && (
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                        +{req.requestedItems.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={() => setSelectedReq(req)}
                className="mt-6 w-full rounded-full bg-slate-200 px-5 py-3 font-semibold text-slate-700"
              >
                View Full Details
              </button>

              {req.status === 'PENDING' && (
                <div className="mt-4 flex gap-3">
                  <button
                    disabled={actionLoading === req._id}
                    onClick={() => handleApprove(req._id)}
                    className="flex-1 rounded-full bg-emerald-300 px-4 py-3 font-semibold text-teal-900 disabled:opacity-60"
                  >
                    Approve
                  </button>
                  <button
                    disabled={actionLoading === req._id}
                    onClick={() => {
                      setShowDeclineModal(req._id)
                      setDeclineReason('')
                    }}
                    className="flex-1 rounded-full bg-rose-100 px-4 py-3 font-semibold text-rose-700 disabled:opacity-60"
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {selectedReq && (
        <Modal title="Request Details" onClose={() => setSelectedReq(null)}>
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-black text-slate-900">{selectedReq.organizationName}</h3>
              <p className="text-sm text-slate-500">{selectedReq.requestId || selectedReq._id}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Detail label="Contact Phone" value={selectedReq.contactPhone} />
              <Detail label="People Count" value={selectedReq.peopleCount} />
              <Detail label="Urgency Level" value={selectedReq.urgencyLevel} />
              <Detail label="Needed Before" value={fmt(selectedReq.neededBefore)} />
              <Detail label="Created At" value={fmt(selectedReq.createdAt)} />
              <Detail label="Status" value={selectedReq.status} />
            </div>

            {selectedReq.location && (
              <div>
                <p className="mb-2 font-bold text-slate-800">Location</p>
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                  {selectedReq.location.address ||
                    selectedReq.location.city ||
                    JSON.stringify(selectedReq.location)}
                </div>
              </div>
            )}

            {selectedReq.requestedItems && selectedReq.requestedItems.length > 0 && (
              <div>
                <p className="mb-2 font-bold text-slate-800">Requested Items</p>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="space-y-2">
                    {selectedReq.requestedItems.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                      >
                        <span>
                          {typeof item === 'string'
                            ? item
                            : item.itemName || item.name || `Item ${i + 1}`}
                        </span>
                        <span className="font-semibold">{typeof item === 'object' ? item.quantity || '—' : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedReq.dietaryNeeds && selectedReq.dietaryNeeds.length > 0 && (
              <div>
                <p className="mb-2 font-bold text-slate-800">Dietary Needs</p>
                <div className="flex flex-wrap gap-2">
                  {selectedReq.dietaryNeeds.map((d, i) => (
                    <span key={i} className="rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedReq.notes && (
              <div>
                <p className="mb-2 font-bold text-slate-800">Notes</p>
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">{selectedReq.notes}</div>
              </div>
            )}

            {selectedReq.status === 'PENDING' && (
              <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row">
                <button
                  onClick={() => handleApprove(selectedReq._id)}
                  disabled={actionLoading === selectedReq._id}
                  className="flex-1 rounded-2xl bg-teal-800 px-5 py-3 font-semibold text-white disabled:opacity-60"
                >
                  Approve Request
                </button>
                <button
                  onClick={() => {
                    setShowDeclineModal(selectedReq._id)
                    setDeclineReason('')
                  }}
                  disabled={actionLoading === selectedReq._id}
                  className="flex-1 rounded-2xl bg-slate-200 px-5 py-3 font-semibold text-slate-700 disabled:opacity-60"
                >
                  Decline Request
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {showDeclineModal && (
        <Modal title="Decline Request" onClose={() => setShowDeclineModal(null)}>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Please provide a reason for declining this request.</p>
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

export default RequestsTab