import React, { useEffect, useState } from 'react'

const Applications = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [approvingId, setApprovingId] = useState(null)
  const [viewItem, setViewItem] = useState(null)
  const [viewOpen, setViewOpen] = useState(false)

  const fmtDate = (d) => {
    try { return d ? new Date(d).toLocaleString() : '—' } catch { return '—' }
  }

  useEffect(() => { fetchApps() }, [])

  const fetchApps = async () => {
    setLoading(true); setError('')
    try {
  const token = localStorage.getItem('token')
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  const res = await fetch('/api/applications', { headers })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.message || 'Failed to load applications')
        setItems([])
        return
      }
      const json = await res.json()
  const apps = json.applications || json.data || json || []
      setItems(apps)
    } catch (err) {
      setError('Network error')
      setItems([])
    } finally { setLoading(false) }
  }

  const updateStatus = async (id, status) => {
    if (!confirm(`Set application to ${status}?`)) return
    setError(''); setSuccess('')
    setApprovingId(id)
    try {
      const token = localStorage.getItem('token')
  const headers = token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } : { 'Content-Type': 'application/json' }
  const res = await fetch(`/api/applications/${id}/approve`, { method: 'PUT', headers, body: JSON.stringify({ id }) })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(body.message || 'Failed to approve')
        setApprovingId(null)
        return
      }
      setSuccess(body.message || 'Application approved')
      await fetchApps()
    } catch (err) {
      setError('Network error')
    } finally {
      setApprovingId(null)
    }
  }

  const approveDirect = async (id) => {
    // same as updateStatus but without confirm prompt (used from modal)
    setError(''); setSuccess('')
    setApprovingId(id)
    try {
      const token = localStorage.getItem('token')
      const headers = token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } : { 'Content-Type': 'application/json' }
      const res = await fetch(`/api/applications/${id}/approve`, { method: 'PUT', headers, body: JSON.stringify({ id }) })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(body.message || 'Failed to approve')
        setApprovingId(null)
        return
      }
      setSuccess(body.message || 'Application approved')
      setViewOpen(false); setViewItem(null)
      await fetchApps()
    } catch (err) {
      setError('Network error')
    } finally { setApprovingId(null) }
  }

  const rejectApplication = async (id) => {
    if (!confirm('Reject and delete this application?')) return
    setError(''); setSuccess('')
    try {
      const token = localStorage.getItem('token')
      const headers = token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } : { 'Content-Type': 'application/json' }
      const res = await fetch(`/api/applications/delete/${id}`, { method: 'DELETE', headers })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) { setError(body.message || 'Failed to delete'); return }
      setSuccess('Application rejected and deleted')
      setViewOpen(false); setViewItem(null)
      await fetchApps()
    } catch (err) {
      setError('Network error')
    }
  }

  return (
    <div>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-[#004b49]'>Applications</h3>
      </div>

  {loading && <div className='text-sm text-gray-500'>Loading...</div>}
  {error && <div className='text-sm text-red-600 mb-2'>{error}</div>}
  {success && <div className='text-sm text-green-600 mb-2'>{success}</div>}

      <div className='overflow-x-auto bg-white border rounded'>
        <table className='min-w-full divide-y'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-4 py-2 text-left text-sm font-medium'>Name</th>
              <th className='px-4 py-2 text-left text-sm font-medium'>Role</th>
              <th className='px-4 py-2 text-left text-sm font-medium'>Email</th>
              <th className='px-4 py-2 text-left text-sm font-medium'>Status</th>
              <th className='px-4 py-2 text-right text-sm font-medium'>Actions</th>
            </tr>
          </thead>
          <tbody className='divide-y'>
            {items.map(app => (
              <tr key={app._id || app.id}>
                <td className='px-4 py-3 text-sm'>{app.name || app.fullName || app.username || '—'}</td>
                <td className='px-4 py-3 text-sm'>{(app.role || app.requestedRole || '').toUpperCase()}</td>
                <td className='px-4 py-3 text-sm'>{app.email || '—'}</td>
                <td className='px-4 py-3 text-sm'>{app.status || app.Status || 'Pending'}</td>
                <td className='px-4 py-3 text-sm text-right'>
                  <button onClick={() => { setViewItem(app); setViewOpen(true) }} className='mr-2 px-3 py-1 rounded bg-[#96ded1]'>View</button>
                  <button
                    onClick={() => updateStatus(app._id, 'approved')}
                    className='mr-2 px-3 py-1 rounded bg-[#66ada4] text-white'
                    disabled={approvingId === app._id || (app.status || '').toString().toLowerCase() === 'approved'}
                  >
                    {approvingId === app._id ? 'Approving...' : 'Approve'}
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && !loading && (
              <tr><td colSpan={5} className='px-4 py-6 text-center text-sm text-gray-500'>No applications found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {/* View modal */}
      {viewOpen && viewItem && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <div className='bg-white w-full max-w-2xl rounded p-6'>
            <div className='flex justify-between items-center mb-4'>
              <h4 className='text-lg font-semibold'>Application Details</h4>
              <button onClick={() => { setViewOpen(false); setViewItem(null) }} className='px-2 py-1 rounded border'>Close</button>
            </div>
            <div className='space-y-3 mb-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div><strong>Application ID</strong><div>{viewItem.applicationId || viewItem.donationFormId || viewItem._id || '—'}</div></div>
                <div><strong>Record ID</strong><div>{viewItem._id || '—'}</div></div>
                <div><strong>Applied At</strong><div>{fmtDate(viewItem.appliedAt || viewItem.createdAt || viewItem.updatedAt)}</div></div>
                <div><strong>Status</strong><div>{viewItem.status || viewItem.Status || 'Pending'}</div></div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div><strong>Name</strong><div>{viewItem.name || viewItem.fullName || '—'}</div></div>
                <div><strong>Username</strong><div>{viewItem.username || '—'}</div></div>
                <div><strong>Role</strong><div>{viewItem.role || viewItem.requestedRole || '—'}</div></div>
                <div><strong>Email</strong><div>{viewItem.email || '—'}</div></div>
                <div><strong>Contact</strong><div>{viewItem.contactNumber || viewItem.contact || '—'}</div></div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div><strong>NIC</strong><div>{viewItem.nic || viewItem.nid || '—'}</div></div>
                <div><strong>Address</strong><div>{viewItem.address || viewItem.city || '—'}</div></div>
              </div>

              {/* Role specific */}
              { (viewItem.role || '').toString().toLowerCase() === 'donor' && (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div><strong>Donor Type</strong><div>{viewItem.donorType || viewItem.donationType || '—'}</div></div>
                </div>
              )}

              { (viewItem.role || '').toString().toLowerCase() === 'ngo' && (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div><strong>Organization</strong><div>{viewItem.organizationName || viewItem.organization || '—'}</div></div>
                  <div><strong>Registration No.</strong><div>{viewItem.registrationNumber || '—'}</div></div>
                </div>
              )}

              { (viewItem.role || '').toString().toLowerCase() === 'driver' && (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div><strong>Vehicle Type</strong><div>{viewItem.vehicleType || '—'}</div></div>
                  <div><strong>Vehicle No.</strong><div>{viewItem.vehicleNumber || '—'}</div></div>
                  <div><strong>License No.</strong><div>{viewItem.licenseNumber || '—'}</div></div>
                </div>
              )}

              {viewItem.members && Array.isArray(viewItem.members) && (
                <div>
                  <strong>Members</strong>
                  <div className='mt-2 space-y-1'>
                    {viewItem.members.map((m, i) => (
                      <div key={i} className='text-sm'>• {m.name} — {m.contact}</div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <strong>Notes</strong>
                <div className='mt-1'>{viewItem.notes || '—'}</div>
              </div>
            </div>
            <div className='flex justify-end gap-2'>
              <button onClick={() => rejectApplication(viewItem._id)} className='px-4 py-2 rounded bg-[#ff6b6b] text-white'>Reject</button>
              <button onClick={() => approveDirect(viewItem._id)} className='px-4 py-2 rounded bg-[#66ada4] text-white'>Approve</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Applications
