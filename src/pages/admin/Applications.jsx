import React, { useEffect, useState } from 'react'
import { BASE_URL } from '../../api'

const Applications = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [approvingId, setApprovingId] = useState(null)
  const [viewItem, setViewItem] = useState(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null, status: '' })

  const fmtDate = (d) => {
    try { return d ? new Date(d).toLocaleString() : '—' } catch { return '—' }
  }

  useEffect(() => { fetchApps() }, [])

  const fetchApps = async () => {
    setLoading(true); setError('')
    try {
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const res = await fetch(`${BASE_URL}/applications`, { headers })
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
    setError(''); setSuccess('')
    setApprovingId(id)
    try {
      const token = localStorage.getItem('token')
      const headers = token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } : { 'Content-Type': 'application/json' }
      const res = await fetch(`${BASE_URL}/applications/${id}/approve`, { method: 'PUT', headers, body: JSON.stringify({ id }) })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(body.message || 'Failed to approve')
        setApprovingId(null)
        return
      }
      setSuccess(body.message || 'Application approved')
      await fetchApps()
      setConfirmModal({ open: false, id: null, status: '' })
    } catch (err) {
      setError('Network error')
    } finally {
      setApprovingId(null)
    }
  }

  const approveDirect = async (id) => {
    setError(''); setSuccess('')
    setApprovingId(id)
    try {
      const token = localStorage.getItem('token')
      const headers = token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } : { 'Content-Type': 'application/json' }
      const res = await fetch(`${BASE_URL}/applications/${id}/approve`, { method: 'PUT', headers, body: JSON.stringify({ id }) })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(body.message || 'Failed to approve')
        setApprovingId(null)
        return
      }
      setSuccess(body.message || 'Application approved')
      setViewOpen(false); setViewItem(null)
      await fetchApps()
      setConfirmModal({ open: false, id: null, status: '' })
    } catch (err) {
      setError('Network error')
    } finally { setApprovingId(null) }
  }

  const rejectApplication = async (id) => {
    setError(''); setSuccess('')
    try {
      const token = localStorage.getItem('token')
      const headers = token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } : { 'Content-Type': 'application/json' }
      const res = await fetch(`${BASE_URL}/applications/delete/${id}`, { method: 'DELETE', headers })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) { setError(body.message || 'Failed to delete'); return }
      setSuccess('Application rejected and deleted')
      setViewOpen(false); setViewItem(null)
      await fetchApps()
      setConfirmModal({ open: false, id: null, status: '' })
    } catch (err) {
      setError('Network error')
    }
  }

  const openConfirmModal = (id, status) => {
    setConfirmModal({ open: true, id, status })
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className='flex items-center justify-between mb-6'>
        <h3 className='text-2xl font-bold text-teal-900'>Applications</h3>
      </div>

      {loading && <div className='text-sm text-gray-500 mb-4'>Loading...</div>}
      {error && <div className='text-sm text-red-600 mb-4 p-3 bg-red-50 rounded-lg'>{error}</div>}
      {success && <div className='text-sm text-green-600 mb-4 p-3 bg-green-50 rounded-lg'>{success}</div>}

      <div className='overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-teal-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-semibold text-teal-700 uppercase tracking-wider'>Name</th>
              <th className='px-6 py-3 text-left text-xs font-semibold text-teal-700 uppercase tracking-wider'>Role</th>
              <th className='px-6 py-3 text-left text-xs font-semibold text-teal-700 uppercase tracking-wider'>Email</th>
              <th className='px-6 py-3 text-left text-xs font-semibold text-teal-700 uppercase tracking-wider'>Status</th>
              <th className='px-6 py-3 text-right text-xs font-semibold text-teal-700 uppercase tracking-wider'>Actions</th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-100'>
            {items.map(app => (
              <tr key={app._id || app.id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className='px-6 py-4 text-sm text-gray-800 font-medium'>{app.name || app.fullName || app.username || '—'}</td>
                <td className='px-6 py-4 text-sm text-gray-600'>
                  <span className="px-2 py-1 rounded-full bg-teal-100 text-teal-700 text-xs font-medium">
                    {(app.role || app.requestedRole || '').toUpperCase()}
                  </span>
                </td>
                <td className='px-6 py-4 text-sm text-gray-600'>{app.email || '—'}</td>
                <td className='px-6 py-4 text-sm'>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    (app.status || app.Status || 'Pending').toLowerCase() === 'approved' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {app.status || app.Status || 'Pending'}
                  </span>
                </td>
                <td className='px-6 py-4 text-sm text-right'>
                  <button 
                    onClick={() => { setViewItem(app); setViewOpen(true) }} 
                    className='mr-2 px-3 py-1.5 rounded-lg bg-teal-100 text-teal-700 hover:bg-teal-200 transition-colors duration-150 text-sm font-medium'
                  >
                    View
                  </button>
                  <button
                    onClick={() => openConfirmModal(app._id, 'approved')}
                    className='px-3 py-1.5 rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition-colors duration-150 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed'
                    disabled={approvingId === app._id || (app.status || '').toString().toLowerCase() === 'approved'}
                  >
                    {approvingId === app._id ? 'Approving...' : 'Approve'}
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className='px-6 py-12 text-center text-sm text-gray-400'>No applications found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Custom Confirmation Modal */}
      {confirmModal.open && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'>
          <div className='bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-fade-in-up'>
            <div className='bg-teal-900 px-6 py-4'>
              <h4 className='text-lg font-semibold text-white'>Confirm Approval</h4>
            </div>
            <div className='p-6'>
              <div className='flex items-center justify-center mb-4'>
                <div className='h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center'>
                  <svg className='h-6 w-6 text-teal-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                </div>
              </div>
              <p className='text-center text-gray-700 mb-6'>
                Are you sure you want to approve this application? This action cannot be undone.
              </p>
              <div className='flex gap-3 justify-end'>
                <button
                  onClick={() => setConfirmModal({ open: false, id: null, status: '' })}
                  className='px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-150'
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateStatus(confirmModal.id, confirmModal.status)}
                  className='px-4 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition-colors duration-150'
                >
                  Yes, Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View modal */}
      {viewOpen && viewItem && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'>
          <div className='bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden animate-fade-in-up'>
            <div className='bg-teal-900 px-6 py-4 flex justify-between items-center'>
              <h4 className='text-lg font-semibold text-white'>Application Details</h4>
              <button 
                onClick={() => { setViewOpen(false); setViewItem(null) }} 
                className='text-teal-200 hover:text-white transition-colors duration-150 text-sm px-3 py-1 rounded-lg hover:bg-teal-800'
              >
                Close
              </button>
            </div>
            
            <div className='p-6 space-y-6'>
              {/* ID Section */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-gray-100'>
                <div>
                  <label className='text-xs font-semibold text-teal-600 uppercase tracking-wider'>Application ID</label>
                  <p className='text-sm text-gray-800 mt-1 font-mono'>{viewItem.applicationId || viewItem.donationFormId || viewItem._id || '—'}</p>
                </div>
                <div>
                  <label className='text-xs font-semibold text-teal-600 uppercase tracking-wider'>Record ID</label>
                  <p className='text-sm text-gray-800 mt-1 font-mono'>{viewItem._id || '—'}</p>
                </div>
                <div>
                  <label className='text-xs font-semibold text-teal-600 uppercase tracking-wider'>Applied At</label>
                  <p className='text-sm text-gray-800 mt-1'>{fmtDate(viewItem.appliedAt || viewItem.createdAt || viewItem.updatedAt)}</p>
                </div>
              </div>

              {/* Personal Info */}
              <div>
                <h5 className='text-md font-semibold text-teal-800 mb-3 flex items-center'>
                  <span className="w-1 h-5 bg-teal-500 rounded-full mr-2"></span>
                  Personal Information
                </h5>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pl-3'>
                  <div><label className='text-xs text-teal-600'>Full Name</label><p className='text-sm text-gray-800'>{viewItem.name || viewItem.fullName || '—'}</p></div>
                  <div><label className='text-xs text-teal-600'>Username</label><p className='text-sm text-gray-800'>{viewItem.username || '—'}</p></div>
                  <div><label className='text-xs text-teal-600'>Email Address</label><p className='text-sm text-gray-800'>{viewItem.email || '—'}</p></div>
                  <div><label className='text-xs text-teal-600'>Contact Number</label><p className='text-sm text-gray-800'>{viewItem.contactNumber || viewItem.contact || '—'}</p></div>
                  <div><label className='text-xs text-teal-600'>NIC / NID</label><p className='text-sm text-gray-800'>{viewItem.nic || viewItem.nid || '—'}</p></div>
                  <div><label className='text-xs text-teal-600'>Address</label><p className='text-sm text-gray-800'>{viewItem.address || viewItem.city || '—'}</p></div>
                  <div><label className='text-xs text-teal-600'>Requested Role</label><p className='text-sm text-gray-800'><span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 text-xs">{viewItem.role || viewItem.requestedRole || '—'}</span></p></div>
                </div>
              </div>

              {/* Role specific sections */}
              {(viewItem.role || '').toString().toLowerCase() === 'donor' && (
                <div>
                  <h5 className='text-md font-semibold text-teal-800 mb-3 flex items-center'>
                    <span className="w-1 h-5 bg-teal-500 rounded-full mr-2"></span>
                    Donor Details
                  </h5>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pl-3'>
                    <div><label className='text-xs text-teal-600'>Donor Type</label><p className='text-sm text-gray-800'>{viewItem.donorType || viewItem.donationType || '—'}</p></div>
                  </div>
                </div>
              )}

              {(viewItem.role || '').toString().toLowerCase() === 'ngo' && (
                <div>
                  <h5 className='text-md font-semibold text-teal-800 mb-3 flex items-center'>
                    <span className="w-1 h-5 bg-teal-500 rounded-full mr-2"></span>
                    Organization Details
                  </h5>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pl-3'>
                    <div><label className='text-xs text-teal-600'>Organization Name</label><p className='text-sm text-gray-800'>{viewItem.organizationName || viewItem.organization || '—'}</p></div>
                    <div><label className='text-xs text-teal-600'>Registration Number</label><p className='text-sm text-gray-800'>{viewItem.registrationNumber || '—'}</p></div>
                  </div>
                </div>
              )}

              {(viewItem.role || '').toString().toLowerCase() === 'driver' && (
                <div>
                  <h5 className='text-md font-semibold text-teal-800 mb-3 flex items-center'>
                    <span className="w-1 h-5 bg-teal-500 rounded-full mr-2"></span>
                    Driver & Vehicle Details
                  </h5>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4 pl-3'>
                    <div><label className='text-xs text-teal-600'>Vehicle Type</label><p className='text-sm text-gray-800'>{viewItem.vehicleType || '—'}</p></div>
                    <div><label className='text-xs text-teal-600'>Vehicle Number</label><p className='text-sm text-gray-800'>{viewItem.vehicleNumber || '—'}</p></div>
                    <div><label className='text-xs text-teal-600'>License Number</label><p className='text-sm text-gray-800'>{viewItem.licenseNumber || '—'}</p></div>
                  </div>
                </div>
              )}

              {viewItem.members && Array.isArray(viewItem.members) && viewItem.members.length > 0 && (
                <div>
                  <h5 className='text-md font-semibold text-teal-800 mb-3 flex items-center'>
                    <span className="w-1 h-5 bg-teal-500 rounded-full mr-2"></span>
                    Team Members
                  </h5>
                  <div className='bg-gray-50 rounded-lg p-4 space-y-2'>
                    {viewItem.members.map((m, i) => (
                      <div key={i} className='text-sm text-gray-700 flex items-center'>
                        <span className="w-1.5 h-1.5 bg-teal-400 rounded-full mr-2"></span>
                        <span className="font-medium">{m.name}</span> — {m.contact}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h5 className='text-md font-semibold text-teal-800 mb-3 flex items-center'>
                  <span className="w-1 h-5 bg-teal-500 rounded-full mr-2"></span>
                  Additional Notes
                </h5>
                <div className='bg-gray-50 rounded-lg p-4 text-sm text-gray-700 italic'>
                  {viewItem.notes || 'No additional notes provided.'}
                </div>
              </div>
            </div>

            <div className='bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100'>
              <button 
                onClick={() => rejectApplication(viewItem._id)} 
                className='px-5 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors duration-150 font-medium shadow-sm'
              >
                Reject Application
              </button>
              <button 
                onClick={() => openConfirmModal(viewItem._id, 'approved')} 
                className='px-5 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors duration-150 font-medium shadow-sm'
              >
                Approve Application
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}

export default Applications