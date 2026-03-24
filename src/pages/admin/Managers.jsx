import React, { useEffect, useState } from 'react'

const defaultMock = [
  { id: 'm1', name: 'Alice Manager', email: 'alice@example.com', username: 'alice', managerType: 'DONOR_MANAGER' },
  { id: 'm2', name: 'Bob Manager', email: 'bob@example.com', username: 'bob', managerType: 'NGO_MANAGER' },
]

const STORAGE_KEY = 'managers_mock_v1'

const useMockStorage = () => {
  const get = () => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultMock
    try { return JSON.parse(raw) } catch { return defaultMock }
  }
  const set = (items) => localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  return { get, set }
}

const Managers = () => {
  const [managers, setManagers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const storage = useMockStorage()

  useEffect(() => {
    loadManagers()
    // eslint-disable-next-line
  }, [])

  const loadManagers = async () => {
    setLoading(true)
    setError('')
    try {
  // Try backend first
  const token = localStorage.getItem('token')
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {}
  const res = await fetch('/api/users', { headers: { ...authHeaders } })
      if (res.ok) {
        const data = await res.json().catch(() => null)
        // accept array or {count,data}
        const items = Array.isArray(data) ? data : (data?.data || [])
        // try to filter managers by role or managerType
        const filtered = items.filter(u => u.role === 'manager' || u.managerType || u.role === 'manager')
        if (filtered.length > 0) {
          setManagers(filtered.map(u => ({ id: u._id || u.userId || u.id || (u.username+Math.random()), name: u.name || u.username, email: u.email || '', username: u.username, managerType: u.managerType || 'DONOR_MANAGER' })))
          storage.set(filtered)
          setLoading(false)
          return
        }
      }
      // fallback to mock storage
      const mock = storage.get()
      setManagers(mock)
    } catch (err) {
      // fallback
      setManagers(storage.get())
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (m) => { setEditing(m); setModalOpen(true) }

  const saveManager = async (payload) => {
    setLoading(true)
    setError('')
    try {
      // Try backend create/update
      if (editing) {
        const id = editing.id
  const token = localStorage.getItem('token')
  const headers = token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } : { 'Content-Type': 'application/json' }
  const res = await fetch(`/api/users/${id}`, { method: 'PUT', headers, body: JSON.stringify(payload) })
        if (res.ok) {
          await loadManagers(); setModalOpen(false); return
        }
        } else {
        // Create via admin users endpoint so manager is saved into users collection
        const body = { name: payload.name, email: payload.email, username: payload.username, password: payload.password || Math.random().toString(36).slice(-8), role: 'manager' }
  const token = localStorage.getItem('token')
  const headers = token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } : { 'Content-Type': 'application/json' }
  const res = await fetch('/api/users', { method: 'POST', headers, body: JSON.stringify(body) })
        if (res.ok) { await loadManagers(); setModalOpen(false); return }
      }
    } catch (err) {
      // ignore - fallback to local
    }

    // Local fallback update
    const list = [...managers]
    if (editing) {
      const idx = list.findIndex(x => x.id === editing.id)
      if (idx !== -1) { list[idx] = { ...list[idx], ...payload }; setManagers(list); storage.set(list); setModalOpen(false); setLoading(false); return }
    } else {
      const newItem = { id: 'm_'+Date.now(), ...payload }
      const newList = [newItem, ...list]
      setManagers(newList); storage.set(newList); setModalOpen(false); setLoading(false); return
    }
  }

  const deleteManager = async (id) => {
    if (!confirm('Delete this manager?')) return
    setLoading(true)
    try {
  const token = localStorage.getItem('token')
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  const res = await fetch(`/api/users/${id}`, { method: 'DELETE', headers })
      if (res.ok) { await loadManagers(); return }
    } catch (_) {}
    // fallback local
    const newList = managers.filter(m => m.id !== id)
    setManagers(newList); storage.set(newList); setLoading(false)
  }

  return (
    <div>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-[#004b49]'>Managers</h3>
        <div>
          <button onClick={openAdd} className='px-4 py-2 rounded bg-[#66ada4] text-white font-semibold'>Add Manager</button>
        </div>
      </div>

      {loading && <div className='text-sm text-gray-500'>Loading...</div>}
      {error && <div className='text-sm text-red-600'>{error}</div>}

      <div className='overflow-x-auto bg-white border rounded'>
        <table className='min-w-full divide-y'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-4 py-2 text-left text-sm font-medium'>Name</th>
              <th className='px-4 py-2 text-left text-sm font-medium'>Email</th>
              <th className='px-4 py-2 text-left text-sm font-medium'>Username</th>
              <th className='px-4 py-2 text-left text-sm font-medium'>Type</th>
              <th className='px-4 py-2 text-right text-sm font-medium'>Actions</th>
            </tr>
          </thead>
          <tbody className='divide-y'>
            {managers.map(m => (
              <tr key={m.id}>
                <td className='px-4 py-3 text-sm'>{m.name}</td>
                <td className='px-4 py-3 text-sm'>{m.email}</td>
                <td className='px-4 py-3 text-sm'>{m.username}</td>
                <td className='px-4 py-3 text-sm'>{m.managerType}</td>
                <td className='px-4 py-3 text-sm text-right'>
                  <button onClick={() => openEdit(m)} className='mr-2 px-3 py-1 rounded bg-[#96ded1]'>Edit</button>
                  <button onClick={() => deleteManager(m.id)} className='px-3 py-1 rounded bg-[#ff6b6b] text-white'>Delete</button>
                </td>
              </tr>
            ))}
            {managers.length === 0 && !loading && (
              <tr><td colSpan={5} className='px-4 py-6 text-center text-sm text-gray-500'>No managers found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <ManagerModal
          onClose={() => setModalOpen(false)}
          onSave={saveManager}
          initial={editing}
        />
      )}
    </div>
  )
}

const ManagerModal = ({ onClose, onSave, initial }) => {
  const [name, setName] = useState(initial?.name || '')
  const [email, setEmail] = useState(initial?.email || '')
  const [username, setUsername] = useState(initial?.username || '')
  const [password, setPassword] = useState('')
  const [managerType, setManagerType] = useState(initial?.managerType || 'DONOR_MANAGER')

  const submit = (e) => {
    e.preventDefault()
    const payload = { name, email, username, managerType }
    if (password) payload.password = password
    // map managerType to backend role 'manager' and include subtype if possible
    payload.role = 'manager'
    payload.managerType = managerType
    onSave(payload)
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
      <div className='w-full max-w-md bg-white rounded-lg p-6'>
        <h4 className='text-lg font-semibold mb-4'>{initial ? 'Edit Manager' : 'Add Manager'}</h4>
        <form onSubmit={submit} className='space-y-3'>
          <div>
            <label className='text-sm'>Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className='w-full border px-3 py-2 rounded' required />
          </div>
          <div>
            <label className='text-sm'>Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type='email' className='w-full border px-3 py-2 rounded' required />
          </div>
          <div>
            <label className='text-sm'>Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} className='w-full border px-3 py-2 rounded' required />
          </div>
          <div>
            <label className='text-sm'>Password</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type='password' className='w-full border px-3 py-2 rounded' placeholder={initial ? 'Leave blank to keep' : ''} />
          </div>
          <div>
            <label className='text-sm'>Manager Type</label>
            <select value={managerType} onChange={e => setManagerType(e.target.value)} className='w-full border px-3 py-2 rounded'>
              <option>DONOR_MANAGER</option>
              <option>NGO_MANAGER</option>
              <option>DRIVER_MANAGER</option>
            </select>
          </div>

          <div className='flex items-center justify-end gap-2'>
            <button type='button' onClick={onClose} className='px-4 py-2 rounded border'>Cancel</button>
            <button type='submit' className='px-4 py-2 rounded bg-[#317873] text-white'>Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Managers
