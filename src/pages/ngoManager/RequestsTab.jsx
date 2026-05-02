import React, { useCallback, useEffect, useMemo, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
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
  const [showCalendar, setShowCalendar] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }

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
      showToast('Failed to fetch requests', 'error')
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

  // Prepare calendar events from requests with neededBefore dates
  const calendarEvents = useMemo(() => {
    const events = []
    requests.forEach((req) => {
      if (req.neededBefore) {
        const neededDate = new Date(req.neededBefore)
        if (!isNaN(neededDate.getTime())) {
          let color = ''
          let textColor = ''
          
          // Color coding based on urgency and status
          if (req.status === 'APPROVED') {
            color = '#10b981' // Emerald green for approved
            textColor = '#ffffff'
          } else if (req.status === 'DECLINED') {
            color = '#ef4444' // Red for declined
            textColor = '#ffffff'
          } else {
            // Pending - color based on urgency
            switch (req.urgencyLevel?.toUpperCase()) {
              case 'HIGH':
                color = '#ef4444' // Red for high urgency
                textColor = '#ffffff'
                break
              case 'MEDIUM':
                color = '#f59e0b' // Orange for medium urgency
                textColor = '#ffffff'
                break
              case 'LOW':
                color = '#10b981' // Green for low urgency
                textColor = '#ffffff'
                break
              default:
                color = '#6b7280' // Gray for unknown
                textColor = '#ffffff'
            }
          }
          
          events.push({
            id: req._id,
            title: `${req.organizationName || 'Unknown'} - ${req.urgencyLevel || 'LOW'} urgency`,
            start: neededDate,
            end: neededDate,
            allDay: true,
            backgroundColor: color,
            borderColor: color,
            textColor: textColor,
            extendedProps: {
              requestId: req.requestId,
              status: req.status,
              urgencyLevel: req.urgencyLevel,
              peopleCount: req.peopleCount,
              contactPhone: req.contactPhone,
              notes: req.notes,
              requestedItems: req.requestedItems
            }
          })
        }
      }
    })
    return events
  }, [requests])

  const handleDateClick = (info) => {
    // Find requests with neededBefore date matching the clicked date
    const clickedDate = info.dateStr
    const requestsOnDate = requests.filter((req) => {
      if (!req.neededBefore) return false
      const neededDate = new Date(req.neededBefore).toISOString().split('T')[0]
      return neededDate === clickedDate
    })
    
    if (requestsOnDate.length > 0) {
      const message = requestsOnDate.map(r => 
        `${r.organizationName} - ${r.urgencyLevel} urgency (${r.status})`
      ).join('\n')
      showToast(`${requestsOnDate.length} request(s) due on this date:\n${message}`, 'info')
    }
  }

  const handleEventClick = (info) => {
    const eventData = info.event.extendedProps
    const request = requests.find(r => r._id === info.event.id)
    if (request) {
      setSelectedReq(request)
    }
  }

  const handleApprove = async (id) => {
    setActionLoading(id)

    try {
      const res = await fetch(`${API()}/requests/${id}/approve`, {
        method: 'PATCH',
        headers: authHeaders(),
      })
      const data = await parseJsonSafe(res)

      if (!res.ok) {
        showToast(data.message || 'Failed to approve request', 'error')
        return
      }

      showToast(data.message || 'Request approved successfully', 'success')
      fetchRequests()
      setSelectedReq(null)
    } catch (err) {
      console.error(err)
      showToast('Network error', 'error')
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
        showToast(data.message || 'Failed to decline request', 'error')
        return
      }

      showToast(data.message || 'Request declined', 'success')
      fetchRequests()
      setSelectedReq(null)
      setShowDeclineModal(null)
      setDeclineReason('')
    } catch (err) {
      console.error(err)
      showToast('Network error', 'error')
    } finally {
      setActionLoading('')
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-5 right-5 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className={`rounded-2xl px-6 py-4 shadow-lg whitespace-pre-line ${
            toast.type === 'success' 
              ? 'bg-teal-800 text-white' 
              : toast.type === 'error'
              ? 'bg-rose-600 text-white'
              : 'bg-blue-600 text-white'
          }`}>
            <div className="flex items-center gap-3">
              {toast.type === 'success' ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : toast.type === 'error' ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span className="font-semibold">{toast.message}</span>
            </div>
          </div>
        </div>
      )}

      <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900">Resource Requests</h2>
          <p className="mt-3 max-w-3xl text-lg text-slate-700">
            Manage and fulfill logistics requests from partner NGOs.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="rounded-full bg-teal-800 px-5 py-3 font-semibold text-white"
          >
            {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
          </button>
        </div>
      </section>

      {showCalendar && (
        <section className="rounded-[34px] bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-2xl font-black text-slate-900">Request Timeline Calendar</h3>
          <p className="mb-6 text-sm text-slate-600">
            <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span> High Urgency
            <span className="inline-block w-3 h-3 rounded-full bg-amber-500 ml-4 mr-2"></span> Medium Urgency
            <span className="inline-block w-3 h-3 rounded-full bg-emerald-500 ml-4 mr-2"></span> Low Urgency
            <span className="inline-block w-3 h-3 rounded-full bg-emerald-600 ml-4 mr-2"></span> Approved
            <span className="inline-block w-3 h-3 rounded-full bg-red-600 ml-4 mr-2"></span> Declined
          </p>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={calendarEvents}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            height="auto"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,dayGridWeek'
            }}
            buttonText={{
              today: 'Today',
              month: 'Month',
              week: 'Week'
            }}
            eventDisplay="block"
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              meridiem: false
            }}
          />
        </section>
      )}

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_340px]">
        <div className="rounded-[34px] bg-[#e8eef1] p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <button
              onClick={() => setFilter('')}
              className={`rounded-full px-5 py-3 text-sm font-semibold ${
                filter === '' ? 'bg-teal-800 text-white' : 'bg-white text-slate-700'
              }`}
            >
              All Requests ({requests.length})
            </button>
            <button
              onClick={() => setFilter('PENDING')}
              className={`rounded-full px-5 py-3 text-sm font-semibold ${
                filter === 'PENDING' ? 'bg-teal-800 text-white' : 'bg-white text-slate-700'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('APPROVED')}
              className={`rounded-full px-5 py-3 text-sm font-semibold ${
                filter === 'APPROVED' ? 'bg-teal-800 text-white' : 'bg-white text-slate-700'
              }`}
            >
              Approved ({approvedCount})
            </button>
            <button
              onClick={() => setFilter('DECLINED')}
              className={`rounded-full px-5 py-3 text-sm font-semibold ${
                filter === 'DECLINED' ? 'bg-teal-800 text-white' : 'bg-white text-slate-700'
              }`}
            >
              Declined ({declinedCount})
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
                  <span className="font-semibold text-slate-900">
                    {req.neededBefore ? new Date(req.neededBefore).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }) : '—'}
                  </span>
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
                className="mt-6 w-full rounded-full bg-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-300 transition-colors"
              >
                View Full Details
              </button>

              {req.status === 'PENDING' && (
                <div className="mt-4 flex gap-3">
                  <button
                    disabled={actionLoading === req._id}
                    onClick={() => handleApprove(req._id)}
                    className="flex-1 rounded-full bg-emerald-300 px-4 py-3 font-semibold text-teal-900 disabled:opacity-60 hover:bg-emerald-400 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    disabled={actionLoading === req._id}
                    onClick={() => {
                      setShowDeclineModal(req._id)
                      setDeclineReason('')
                    }}
                    className="flex-1 rounded-full bg-rose-100 px-4 py-3 font-semibold text-rose-700 disabled:opacity-60 hover:bg-rose-200 transition-colors"
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
              <Detail label="Needed Before" value={selectedReq.neededBefore ? new Date(selectedReq.neededBefore).toLocaleDateString() : '—'} />
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