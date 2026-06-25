import React, { useEffect, useState } from 'react'
import { BASE_URL } from '../../api'

const STORAGE_KEY = 'users_mock_v1'

const defaultMock = { donors: [], ngos: [], drivers: [] }

const useMock = () => {
  const get = () => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultMock
    try { return JSON.parse(raw) } catch { return defaultMock }
  }
  const set = (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  return { get, set }
}

const Users = () => {
  const [activeTab, setActiveTab] = useState('donors')
  const [data, setData] = useState({ donors: [], ngos: [], drivers: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [userLoading, setUserLoading] = useState(false)
  const [userError, setUserError] = useState('')
  const [userShowRaw, setUserShowRaw] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, tabKey: null, userName: '' })
  const mock = useMock()

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true); setError('')
    try {
      const roles = ['donor', 'ngo', 'driver']
      const result = { donors: [], ngos: [], drivers: [] }
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      let anyOk = false
      for (const r of roles) {
        try {
          const res = await fetch(`${BASE_URL}/users?role=${r}`, { headers })
          if (!res.ok) continue
          const json = await res.json()
          const arr = Array.isArray(json) ? json : (json.data || json.users || json.users || [])
          result[r === 'donor' ? 'donors' : r === 'ngo' ? 'ngos' : 'drivers'] = arr.map(u => ({ ...u }))
          anyOk = true
        } catch (e) {
          // ignore per-role fetch errors
        }
      }
      if (anyOk) { setData(result); mock.set(result); setLoading(false); return }

      setData(mock.get())
    } catch (err) {
      setError('Failed to load users')
    } finally { setLoading(false) }
  }

  const openDeleteConfirm = (id, tabKey, userName) => {
    setDeleteConfirm({ open: true, id, tabKey, userName })
  }

  const deleteUser = async () => {
    const { id, tabKey } = deleteConfirm
    try {
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const res = await fetch(`${BASE_URL}/users/${id}`, { method: 'DELETE', headers })
      if (res.ok) { 
        await loadAll()
        setDeleteConfirm({ open: false, id: null, tabKey: null, userName: '' })
        return 
      }
    } catch (_) {}
    // local fallback
    const copy = { ...data }
    copy[tabKey] = copy[tabKey].filter(x => (x._id || x.userId || x.id || x.username) !== id)
    setData(copy); mock.set(copy)
    setDeleteConfirm({ open: false, id: null, tabKey: null, userName: '' })
  }

  const viewUser = async (uOrId) => {
    setUserError('')
    setSelectedUser(null)
    setUserLoading(true)
    try {
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const id = typeof uOrId === 'string' ? uOrId : (uOrId._id || uOrId.userId || uOrId.id || uOrId.username)
      const url = `${BASE_URL}/users/${id}`
      const res = await fetch(url, { headers })
      if (!res.ok) {
        let bodyText = ''
        try { bodyText = await res.text() } catch (e) { bodyText = '' }
        throw new Error(`${res.status} ${res.statusText}`)
      }
      const json = await res.json()
      const detail = json?.data || json?.user || (json && typeof json === 'object' ? json : null)
      if (!detail) throw new Error('No user data received')
      setSelectedUser(detail)
    } catch (err) {
      setUserError(err.message || 'Failed to load user')
      setSelectedUser(null)
    } finally {
      setUserLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const normalized = String(status || 'Active').toLowerCase()
    if (normalized === 'active') return 'bg-green-100 text-green-700 border-green-200'
    if (normalized === 'inactive' || normalized === 'suspended') return 'bg-red-100 text-red-700 border-red-200'
    return 'bg-teal-100 text-teal-700 border-teal-200'
  }

  const renderTable = (arr, key) => (
    <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-slate-200'>
          <thead className='bg-teal-50'>
            <tr>
              <th className='px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-teal-700'>Name</th>
              <th className='px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-teal-700'>Email</th>
              <th className='px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-teal-700'>Status</th>
              <th className='px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-teal-700'>Actions</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-100 bg-white'>
            {arr.map(u => {
              const userId = u._id || u.userId || u.id || u.username
              return (
                <tr key={userId} className='transition hover:bg-teal-50/40'>
                  <td className='px-5 py-4 text-sm font-medium text-slate-800'>{u.name || u.username}</td>
                  <td className='px-5 py-4 text-sm text-slate-600'>{u.email || '-'}</td>
                  <td className='px-5 py-4 text-sm'>
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadge(u.status)}`}>
                      {u.status || 'Active'}
                    </span>
                  </td>
                  <td className='px-5 py-4 text-right text-sm'>
                    <div className='inline-flex items-center gap-2'>
                      <button
                        onClick={() => viewUser(u)}
                        className='inline-flex items-center gap-1 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-teal-700 transition hover:bg-teal-100'
                      >
                        View
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(userId, key, u.name || u.username)}
                        className='inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-rose-700 transition hover:bg-rose-100'
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {arr.length === 0 && !loading && (
              <tr>
                <td colSpan={4} className='px-5 py-12 text-center'>
                  <div className='mx-auto flex max-w-sm flex-col items-center gap-2 text-slate-500'>
                    <p className='text-sm font-medium'>No users found</p>
                    <p className='text-xs text-slate-400'>No {activeTab} registered yet.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <div className='rounded-2xl border border-teal-100 bg-linear-to-r from-teal-50 via-white to-slate-50 p-6 shadow-sm mb-6'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div>
            <h3 className='text-2xl font-bold text-teal-900'>User Management</h3>
            <p className='text-slate-600'>Manage donors, NGOs, and drivers registered in the system.</p>
          </div>
        </div>
      </div>

      <div className='mb-6'>
        <div className='inline-flex rounded-xl shadow-sm overflow-hidden border border-teal-200' role='tablist'>
          <button
            onClick={() => setActiveTab('donors')}
            className={`px-6 py-2.5 text-sm font-medium transition-all duration-150 ${
              activeTab === 'donors'
                ? 'bg-teal-700 text-white'
                : 'bg-white text-teal-700 hover:bg-teal-50'
            }`}
          >
            Donors
          </button>
          <button
            onClick={() => setActiveTab('ngos')}
            className={`px-6 py-2.5 text-sm font-medium transition-all duration-150 ${
              activeTab === 'ngos'
                ? 'bg-teal-700 text-white'
                : 'bg-white text-teal-700 hover:bg-teal-50'
            }`}
          >
            NGOs
          </button>
          <button
            onClick={() => setActiveTab('drivers')}
            className={`px-6 py-2.5 text-sm font-medium transition-all duration-150 ${
              activeTab === 'drivers'
                ? 'bg-teal-700 text-white'
                : 'bg-white text-teal-700 hover:bg-teal-50'
            }`}
          >
            Drivers
          </button>
        </div>
      </div>

      {loading && (
        <div className='flex items-center justify-center py-12'>
          <div className='inline-flex items-center gap-2 text-slate-500'>
            <div className='h-5 w-5 animate-spin rounded-full border-2 border-teal-500 border-t-transparent'></div>
            <span className='text-sm'>Loading users...</span>
          </div>
        </div>
      )}
      {error && <div className='mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-600'>{error}</div>}
      {userLoading && (
        <div className='mb-4 flex items-center gap-2 text-sm text-teal-600'>
          <div className='h-4 w-4 animate-spin rounded-full border-2 border-teal-500 border-t-transparent'></div>
          Loading user details...
        </div>
      )}
      {userError && (
        <div className='mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-600'>
          Failed to load user details: {userError}.
          <button onClick={() => setUserError('')} className='ml-2 underline'>Dismiss</button>
        </div>
      )}

      {activeTab === 'donors' && renderTable(data.donors || [], 'donors')}
      {activeTab === 'ngos' && renderTable(data.ngos || [], 'ngos')}
      {activeTab === 'drivers' && renderTable(data.drivers || [], 'drivers')}

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirm.open && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'>
          <div className='bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-fade-in-up'>
            <div className='bg-rose-600 px-6 py-4'>
              <h4 className='text-lg font-semibold text-white'>Confirm Deletion</h4>
            </div>
            <div className='p-6'>
              <div className='flex items-center justify-center mb-4'>
                <div className='h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center'>
                  <svg className='h-6 w-6 text-rose-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                  </svg>
                </div>
              </div>
              <p className='text-center text-gray-700 mb-2'>
                Are you sure you want to delete <span className='font-semibold'>{deleteConfirm.userName}</span>?
              </p>
              <p className='text-center text-sm text-gray-500 mb-6'>
                This action cannot be undone.
              </p>
              <div className='flex gap-3 justify-end'>
                <button
                  onClick={() => setDeleteConfirm({ open: false, id: null, tabKey: null, userName: '' })}
                  className='px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-150'
                >
                  Cancel
                </button>
                <button
                  onClick={deleteUser}
                  className='px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors duration-150'
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto'>
          <div className='bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden animate-fade-in-up my-8'>
            <div className='bg-teal-900 px-6 py-4 flex justify-between items-center'>
              <h4 className='text-lg font-semibold text-white'>User Details</h4>
              <button
                onClick={() => setSelectedUser(null)}
                className='text-teal-200 hover:text-white transition-colors duration-150 text-sm px-3 py-1 rounded-lg hover:bg-teal-800'
              >
                Close
              </button>
            </div>

            <div className='p-6 space-y-6 max-h-[70vh] overflow-y-auto'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='text-xs font-semibold text-teal-600 uppercase tracking-wider'>Name</label>
                  <p className='mt-1 text-sm text-gray-800'>{selectedUser.name || '-'}</p>
                </div>
                <div>
                  <label className='text-xs font-semibold text-teal-600 uppercase tracking-wider'>Email</label>
                  <p className='mt-1 text-sm text-gray-800'>{selectedUser.email || '-'}</p>
                </div>
                <div>
                  <label className='text-xs font-semibold text-teal-600 uppercase tracking-wider'>Username</label>
                  <p className='mt-1 text-sm text-gray-800'>{selectedUser.username || '-'}</p>
                </div>
                <div>
                  <label className='text-xs font-semibold text-teal-600 uppercase tracking-wider'>Role</label>
                  <p className='mt-1'>
                    <span className='inline-flex rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700'>
                      {selectedUser.role || '-'}
                    </span>
                  </p>
                </div>
                <div>
                  <label className='text-xs font-semibold text-teal-600 uppercase tracking-wider'>Contact</label>
                  <p className='mt-1 text-sm text-gray-800'>{selectedUser.contact || '-'}</p>
                </div>
                <div>
                  <label className='text-xs font-semibold text-teal-600 uppercase tracking-wider'>NIC</label>
                  <p className='mt-1 text-sm text-gray-800'>{selectedUser.nic || '-'}</p>
                </div>
                <div>
                  <label className='text-xs font-semibold text-teal-600 uppercase tracking-wider'>City</label>
                  <p className='mt-1 text-sm text-gray-800'>{selectedUser.city || '-'}</p>
                </div>
                <div>
                  <label className='text-xs font-semibold text-teal-600 uppercase tracking-wider'>Address</label>
                  <p className='mt-1 text-sm text-gray-800'>{selectedUser.address || '-'}</p>
                </div>
                {selectedUser.organizationName && (
                  <div>
                    <label className='text-xs font-semibold text-teal-600 uppercase tracking-wider'>Organization</label>
                    <p className='mt-1 text-sm text-gray-800'>{selectedUser.organizationName}</p>
                  </div>
                )}
                {selectedUser.registrationNumber && (
                  <div>
                    <label className='text-xs font-semibold text-teal-600 uppercase tracking-wider'>Registration No.</label>
                    <p className='mt-1 text-sm text-gray-800'>{selectedUser.registrationNumber}</p>
                  </div>
                )}
                {(selectedUser.vehicleType || selectedUser.vehicleNumber) && (
                  <div>
                    <label className='text-xs font-semibold text-teal-600 uppercase tracking-wider'>Vehicle</label>
                    <p className='mt-1 text-sm text-gray-800'>
                      {selectedUser.vehicleType || '-'} / {selectedUser.vehicleNumber || '-'}
                    </p>
                  </div>
                )}
                {selectedUser.licenseNumber && (
                  <div>
                    <label className='text-xs font-semibold text-teal-600 uppercase tracking-wider'>License No.</label>
                    <p className='mt-1 text-sm text-gray-800'>{selectedUser.licenseNumber}</p>
                  </div>
                )}
                {selectedUser.members && Array.isArray(selectedUser.members) && selectedUser.members.length > 0 && (
                  <div className='md:col-span-2'>
                    <label className='text-xs font-semibold text-teal-600 uppercase tracking-wider'>Members</label>
                    <div className='mt-2 bg-gray-50 rounded-lg p-4 space-y-2'>
                      {selectedUser.members.map((m, i) => (
                        <div key={i} className='text-sm text-gray-700'>
                          <span className='font-medium'>{m.name}</span> — {m.contact}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Additional fields */}
              {Object.entries(selectedUser)
                .filter(([k]) => !['name', 'email', 'username', 'role', 'contact', 'nic', 'city', 'address', 'organizationName', 'registrationNumber', 'vehicleType', 'vehicleNumber', 'licenseNumber', 'members', 'password', '_id', 'id', 'userId', '__v', 'createdAt', 'updatedAt'].includes(k))
                .length > 0 && (
                <div className='pt-4 border-t border-gray-100'>
                  <h5 className='text-sm font-semibold text-teal-800 mb-3'>Additional Information</h5>
                  <div className='space-y-2'>
                    {Object.entries(selectedUser)
                      .filter(([k]) => !['name', 'email', 'username', 'role', 'contact', 'nic', 'city', 'address', 'organizationName', 'registrationNumber', 'vehicleType', 'vehicleNumber', 'licenseNumber', 'members', 'password', '_id', 'id', 'userId', '__v', 'createdAt', 'updatedAt'].includes(k))
                      .map(([k, v]) => (
                        <div key={k} className='text-sm'>
                          <span className='font-semibold text-gray-700'>{k}:</span>{' '}
                          <span className='text-gray-600'>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              

              {userShowRaw && (
                <pre className='mt-3 bg-gray-50 p-4 rounded-xl text-xs overflow-auto max-h-64 border border-gray-200'>
                  {JSON.stringify(selectedUser, null, 2)}
                </pre>
              )}
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

export default Users