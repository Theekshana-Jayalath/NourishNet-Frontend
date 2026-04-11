import React, { useEffect, useState } from 'react'

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
          const res = await fetch(`/api/users?role=${r}`, { headers })
          if (!res.ok) continue
          const json = await res.json()
          const arr = Array.isArray(json) ? json : (json.data || json.users || json.users || [])
          // store full user objects so we can use the real _id when viewing details
          result[r === 'donor' ? 'donors' : r === 'ngo' ? 'ngos' : 'drivers'] = arr.map(u => ({ ...u }))
          anyOk = true
        } catch (e) {
          // ignore per-role fetch errors
        }
      }
      if (anyOk) { setData(result); mock.set(result); setLoading(false); return }

      // final fallback to local mock storage
      setData(mock.get())
    } catch (err) {
      setError('Failed to load users')
    } finally { setLoading(false) }
  }

  const deleteUser = async (id, tabKey) => {
    if (!confirm('Delete user?')) return
    try {
  const token = localStorage.getItem('token')
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  const res = await fetch(`/api/users/${id}`, { method: 'DELETE', headers })
      if (res.ok) { await loadAll(); return }
    } catch (_) {}
    // local fallback
    const copy = { ...data }
    copy[tabKey] = copy[tabKey].filter(x=>x.id !== id)
    setData(copy); mock.set(copy)
  }

  const viewUser = async (uOrId) => {
    // fetch full user details and show in modal form
    setUserError('')
    setSelectedUser(null)
    setUserLoading(true)
    try {
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      // accept either full user object or id string
      const id = typeof uOrId === 'string' ? uOrId : (uOrId._id || uOrId.userId || uOrId.id || uOrId.username)
      const url = `/api/users/${id}`
      console.debug('[Users] fetching user', { url, headers })
      const res = await fetch(url, { headers })
      if (!res.ok) {
        // try to read body for better error message
        let bodyText = ''
        try { bodyText = await res.text() } catch (e) { bodyText = '' }
        const msg = `${res.status} ${res.statusText} ${bodyText ? '- ' + bodyText : ''}`
        console.error('[Users] failed to fetch user', { url, status: res.status, body: bodyText })
        throw new Error(msg)
      }
  const json = await res.json()
  const detail = json?.data || json?.user || (json && typeof json === 'object' ? json : null)
      if (!detail) throw new Error('No user data received')
      console.debug('[Users] user detail received', detail)
      setSelectedUser(detail)
    } catch (err) {
      console.error('[Users] viewUser error', err)
      setUserError(err.message || 'Failed to load user')
      setSelectedUser(null) // do not fallback to row data; show error instead
    } finally {
      setUserLoading(false)
    }
  }

  const renderTable = (arr, key) => (
    <div className='overflow-x-auto bg-white border rounded'>
      <table className='min-w-full divide-y'>
        <thead className='bg-gray-50'>
          <tr>
            <th className='px-4 py-2 text-left text-sm font-medium'>Name</th>
            <th className='px-4 py-2 text-left text-sm font-medium'>Email</th>
            <th className='px-4 py-2 text-left text-sm font-medium'>Status</th>
            <th className='px-4 py-2 text-right text-sm font-medium'>Actions</th>
          </tr>
        </thead>
        <tbody className='divide-y'>
          {arr.map(u => (
            <tr key={u._id || u.userId || u.id || u.username}>
              <td className='px-4 py-3 text-sm'>{u.name || u.username}</td>
              <td className='px-4 py-3 text-sm'>{u.email || ''}</td>
              <td className='px-4 py-3 text-sm'>{u.status || 'Active'}</td>
              <td className='px-4 py-3 text-sm text-right'>
                <button onClick={()=>viewUser(u)} className='mr-2 px-3 py-1 rounded bg-[#96ded1]'>View</button>
                <button onClick={()=>deleteUser(u._id || u.userId || u.id || u.username, key)} className='px-3 py-1 rounded bg-[#ff6b6b] text-white'>Delete</button>
              </td>
            </tr>
          ))}
          {arr.length===0 && !loading && (<tr><td colSpan={4} className='px-4 py-6 text-center text-sm text-gray-500'>No users found.</td></tr>)}
        </tbody>
      </table>
    </div>
  )

  return (
    <div>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-[#004b49]'>Users</h3>
      </div>

      <div className='mb-4'>
        <div className='inline-flex rounded-md shadow-sm' role='tablist'>
          <button onClick={()=>setActiveTab('donors')} className={`px-4 py-2 ${activeTab==='donors'?'bg-[#317873] text-white':'bg-white border'}`}>Donors</button>
          <button onClick={()=>setActiveTab('ngos')} className={`px-4 py-2 ${activeTab==='ngos'?'bg-[#317873] text-white':'bg-white border'}`}>NGOs</button>
          <button onClick={()=>setActiveTab('drivers')} className={`px-4 py-2 ${activeTab==='drivers'?'bg-[#317873] text-white':'bg-white border'}`}>Drivers</button>
        </div>
      </div>

      {loading && <div className='text-sm text-gray-500'>Loading...</div>}
      {error && <div className='text-sm text-red-600 mb-2'>{error}</div>}
      {userLoading && <div className='text-sm text-gray-600 mb-2'>Loading user details…</div>}
      {userError && (
        <div className='text-sm text-red-600 mb-2'>
          Failed to load user details: {userError}. <button onClick={() => {
            // retry last selected row by reusing selectedUserId stored temporarily
            // If no selected user id, just clear error
            setUserError('');
          }} className='underline'>Dismiss</button>
        </div>
      )}

      {activeTab === 'donors' && renderTable(data.donors || [], 'donors')}
      {activeTab === 'ngos' && renderTable(data.ngos || [], 'ngos')}
      {activeTab === 'drivers' && renderTable(data.drivers || [], 'drivers')}

      {/* Read-only user details modal/form */}
      {selectedUser && (
        <div className='fixed inset-0 bg-black/30 flex items-start justify-center p-6'>
          <div className='bg-white rounded-lg shadow-lg max-w-3xl w-full'>
            <div className='flex items-center justify-between p-4 border-b'>
              <h4 className='font-semibold'>User Details</h4>
              <button onClick={()=>setSelectedUser(null)} className='px-3 py-1 rounded bg-gray-100'>Close</button>
            </div>

            <div className='p-6'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-xs text-gray-600'>Name</label>
                  <div className='mt-1'>{selectedUser.name || '-'}</div>
                </div>

                <div>
                  <label className='text-xs text-gray-600'>Email</label>
                  <div className='mt-1'>{selectedUser.email || '-'}</div>
                </div>

                <div>
                  <label className='text-xs text-gray-600'>Username</label>
                  <div className='mt-1'>{selectedUser.username || '-'}</div>
                </div>

                <div>
                  <label className='text-xs text-gray-600'>Role</label>
                  <div className='mt-1'>{selectedUser.role || '-'}</div>
                </div>

                <div>
                  <label className='text-xs text-gray-600'>Contact</label>
                  <div className='mt-1'>{selectedUser.contact || '-'}</div>
                </div>

                <div>
                  <label className='text-xs text-gray-600'>NIC</label>
                  <div className='mt-1'>{selectedUser.nic || '-'}</div>
                </div>

                <div>
                  <label className='text-xs text-gray-600'>City</label>
                  <div className='mt-1'>{selectedUser.city || '-'}</div>
                </div>

                <div>
                  <label className='text-xs text-gray-600'>Address</label>
                  <div className='mt-1'>{selectedUser.address || '-'}</div>
                </div>

                <div>
                  <label className='text-xs text-gray-600'>Organization</label>
                  <div className='mt-1'>{selectedUser.organizationName || '-'}</div>
                </div>

                <div>
                  <label className='text-xs text-gray-600'>Registration No.</label>
                  <div className='mt-1'>{selectedUser.registrationNumber || '-'}</div>
                </div>

                <div>
                  <label className='text-xs text-gray-600'>Vehicle</label>
                  <div className='mt-1'>{selectedUser.vehicleType ? `${selectedUser.vehicleType} / ${selectedUser.vehicleNumber || '-'}` : '-'}</div>
                </div>

                <div>
                  <label className='text-xs text-gray-600'>License No.</label>
                  <div className='mt-1'>{selectedUser.licenseNumber || '-'}</div>
                </div>

                <div className='col-span-2'>
                  <label className='text-xs text-gray-600'>Members</label>
                  <div className='mt-1'>
                    {Array.isArray(selectedUser.members) && selectedUser.members.length > 0 ? (
                      <ul className='list-disc pl-5 text-sm'>
                        {selectedUser.members.map((m, i) => (
                          <li key={i}>{m.name} — {m.contact}</li>
                        ))}
                      </ul>
                    ) : ('-')}
                  </div>
                </div>
              </div>

              {/* Other fields: render any remaining keys from the user document (exclude password) */}
              <div className='mt-6'>
                <h5 className='text-sm font-medium mb-2'>Other fields</h5>
                <div className='space-y-2'>
                  {Object.entries(selectedUser)
                    .filter(([k]) => !['name','email','username','role','contact','nic','city','address','organizationName','registrationNumber','vehicleType','vehicleNumber','licenseNumber','members','password'].includes(k))
                    .map(([k, v]) => (
                      <div key={k} className='text-sm text-gray-700'>
                        <span className='font-semibold'>{k}:</span> {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                      </div>
                    ))}
                </div>

                <div className='mt-4'>
                  <button onClick={() => setUserShowRaw(s => !s)} className='px-3 py-1 rounded bg-gray-100'>Toggle JSON</button>
                </div>

                {userShowRaw && (
                  <pre className='mt-3 bg-gray-50 p-3 rounded text-xs overflow-auto max-h-64'>{JSON.stringify(selectedUser, null, 2)}</pre>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users
