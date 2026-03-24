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
          result[r === 'donor' ? 'donors' : r === 'ngo' ? 'ngos' : 'drivers'] = arr.map(u => ({ id: u._id || u.userId || u.id || u.username, name: u.name || u.username, email: u.email || '', status: u.status || 'Active' }))
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

  const viewUser = (u) => {
    alert(`Name: ${u.name}\nEmail: ${u.email}\nStatus: ${u.status}`)
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
            <tr key={u.id}>
              <td className='px-4 py-3 text-sm'>{u.name}</td>
              <td className='px-4 py-3 text-sm'>{u.email}</td>
              <td className='px-4 py-3 text-sm'>{u.status}</td>
              <td className='px-4 py-3 text-sm text-right'>
                <button onClick={()=>viewUser(u)} className='mr-2 px-3 py-1 rounded bg-[#96ded1]'>View</button>
                <button onClick={()=>deleteUser(u.id, key)} className='px-3 py-1 rounded bg-[#ff6b6b] text-white'>Delete</button>
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

      {activeTab === 'donors' && renderTable(data.donors || [], 'donors')}
      {activeTab === 'ngos' && renderTable(data.ngos || [], 'ngos')}
      {activeTab === 'drivers' && renderTable(data.drivers || [], 'drivers')}
    </div>
  )
}

export default Users
