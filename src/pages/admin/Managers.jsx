import React, { useEffect, useState } from 'react'
import { BASE_URL } from '../../api'

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
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' })

  const storage = useMockStorage()

  useEffect(() => {
    loadManagers()
  }, [])

  const loadManagers = async () => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {}
      const res = await fetch(`${BASE_URL}/users`, { headers: { ...authHeaders } })
      if (res.ok) {
        const data = await res.json().catch(() => null)
        const items = Array.isArray(data) ? data : (data?.data || [])
        const filtered = items.filter(u => (u.role && u.role.toString().toLowerCase() === 'manager') || u.managerType || u.department)
        if (filtered.length > 0) {
          const mapped = filtered.map(u => {
            const id = u._id || u.userId || u.id || (u.username + Math.random())
            const name = u.name || u.username
            const email = u.email || ''
            const username = u.username
            let managerType = null
            if (u.managerType) managerType = u.managerType
            else if (u.department) managerType = (u.department.toString().toUpperCase() + '_MANAGER')
            else managerType = 'DONOR_MANAGER'
            return { id, name, email, username, managerType }
          })
          setManagers(mapped)
          storage.set(mapped)
          setLoading(false)
          return
        }
      }
      const mock = storage.get()
      setManagers(mock)
    } catch (err) {
      setManagers(storage.get())
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (m) => { setEditing(m); setModalOpen(true) }

  const openDeleteConfirm = (id, name) => {
    setDeleteConfirm({ open: true, id, name })
  }

  const saveManager = async (payload) => {
    setLoading(true)
    setError('')
    try {
      if (editing) {
        const id = editing.id
        const token = localStorage.getItem('token')
        const headers = token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } : { 'Content-Type': 'application/json' }
        const res = await fetch(`${BASE_URL}/users/${id}`, { method: 'PUT', headers, body: JSON.stringify(payload) })
        if (res.ok) {
          await loadManagers(); setModalOpen(false); setLoading(false); return
        }
      } else {
        const body = { 
          name: payload.name, 
          email: payload.email, 
          username: payload.username, 
          password: payload.password || Math.random().toString(36).slice(-8), 
          role: 'manager', 
          managerType: payload.managerType 
        }
        const token = localStorage.getItem('token')
        const headers = token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } : { 'Content-Type': 'application/json' }
        const res = await fetch(`${BASE_URL}/users`, { method: 'POST', headers, body: JSON.stringify(body) })
        if (res.ok) { 
          await loadManagers(); setModalOpen(false); setLoading(false); return 
        }
      }
    } catch (err) {}

    // Local fallback
    const list = [...managers]
    if (editing) {
      const idx = list.findIndex(x => x.id === editing.id)
      if (idx !== -1) { 
        list[idx] = { ...list[idx], ...payload }; 
        setManagers(list); 
        storage.set(list); 
        setModalOpen(false); 
        setLoading(false); 
        return 
      }
    } else {
      const newItem = { id: 'm_' + Date.now(), ...payload }
      const newList = [newItem, ...list]
      setManagers(newList); 
      storage.set(newList); 
      setModalOpen(false); 
      setLoading(false); 
      return
    }
  }

  const deleteManager = async () => {
    const { id } = deleteConfirm
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const res = await fetch(`${BASE_URL}/users/${id}`, { method: 'DELETE', headers })
      if (res.ok) { 
        await loadManagers()
        setDeleteConfirm({ open: false, id: null, name: '' })
        setLoading(false)
        return 
      }
    } catch (_) {}
    // fallback local
    const newList = managers.filter(m => m.id !== id)
    setManagers(newList); 
    storage.set(newList)
    setDeleteConfirm({ open: false, id: null, name: '' })
    setLoading(false)
  }

  const getManagerTypeBadge = (type) => {
    const colors = {
      DONOR_MANAGER: 'bg-purple-100 text-purple-700 border-purple-200',
      NGO_MANAGER: 'bg-blue-100 text-blue-700 border-blue-200',
      DRIVER_MANAGER: 'bg-amber-100 text-amber-700 border-amber-200',
    }
    return colors[type] || 'bg-teal-100 text-teal-700 border-teal-200'
  }

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <div className='rounded-2xl border border-teal-100 bg-linear-to-r from-teal-50 via-white to-slate-50 p-6 shadow-sm mb-6'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div>
            <h3 className='text-2xl font-bold text-teal-900'>Manager Management</h3>
            <p className='text-slate-600'>Manage system managers and their assigned roles.</p>
          </div>
          <button
            onClick={openAdd}
            className='inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-teal-800'
          >
            <svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
            </svg>
            Add Manager
          </button>
        </div>
      </div>

      {loading && (
        <div className='flex items-center justify-center py-12'>
          <div className='inline-flex items-center gap-2 text-slate-500'>
            <div className='h-5 w-5 animate-spin rounded-full border-2 border-teal-500 border-t-transparent'></div>
            <span className='text-sm'>Loading managers...</span>
          </div>
        </div>
      )}
      {error && <div className='mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-600'>{error}</div>}

      <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-slate-200'>
            <thead className='bg-teal-50'>
              <tr>
                <th className='px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-teal-700'>Name</th>
                <th className='px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-teal-700'>Email</th>
                <th className='px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-teal-700'>Username</th>
                <th className='px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-teal-700'>Type</th>
                <th className='px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-teal-700'>Actions</th>
            </tr>
            </thead>
            <tbody className='divide-y divide-slate-100 bg-white'>
              {managers.map(m => (
                <tr key={m.id} className='transition hover:bg-teal-50/40'>
                  <td className='px-5 py-4 text-sm font-medium text-slate-800'>{m.name}</td>
                  <td className='px-5 py-4 text-sm text-slate-600'>{m.email}</td>
                  <td className='px-5 py-4 text-sm text-slate-600'>{m.username}</td>
                  <td className='px-5 py-4 text-sm'>
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getManagerTypeBadge(m.managerType)}`}>
                      {m.managerType?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className='px-5 py-4 text-right text-sm'>
                    <div className='inline-flex items-center gap-2'>
                      <button
                        onClick={() => openEdit(m)}
                        className='inline-flex items-center gap-1 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-teal-700 transition hover:bg-teal-100'
                      >
                        <svg className='h-3.5 w-3.5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(m.id, m.name)}
                        className='inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-rose-700 transition hover:bg-rose-100'
                      >
                        <svg className='h-3.5 w-3.5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {managers.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className='px-5 py-12 text-center'>
                    <div className='mx-auto flex max-w-sm flex-col items-center gap-2 text-slate-500'>
                      <svg className='h-12 w-12 text-slate-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' />
                      </svg>
                      <p className='text-sm font-medium'>No managers found</p>
                      <p className='text-xs text-slate-400'>Click "Add Manager" to create one.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                Are you sure you want to delete <span className='font-semibold'>{deleteConfirm.name}</span>?
              </p>
              <p className='text-center text-sm text-gray-500 mb-6'>
                This action cannot be undone.
              </p>
              <div className='flex gap-3 justify-end'>
                <button
                  onClick={() => setDeleteConfirm({ open: false, id: null, name: '' })}
                  className='px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-150'
                >
                  Cancel
                </button>
                <button
                  onClick={deleteManager}
                  className='px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors duration-150'
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manager Modal */}
      {modalOpen && (
        <ManagerModal
          onClose={() => setModalOpen(false)}
          onSave={saveManager}
          initial={editing}
        />
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

const ManagerModal = ({ onClose, onSave, initial }) => {
  const [name, setName] = useState(initial?.name || '')
  const [email, setEmail] = useState(initial?.email || '')
  const [username, setUsername] = useState(initial?.username || '')
  const [password, setPassword] = useState('')
  const [managerType, setManagerType] = useState(initial?.managerType || 'DONOR_MANAGER')
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = { name, email, username, managerType }
    if (password) payload.password = password
    payload.role = 'manager'
    payload.managerType = managerType
    await onSave(payload)
    setSaving(false)
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'>
      <div className='bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-fade-in-up'>
        <div className='bg-teal-900 px-6 py-4'>
          <h4 className='text-lg font-semibold text-white'>{initial ? 'Edit Manager' : 'Add New Manager'}</h4>
          <p className='text-teal-200 text-sm mt-0.5'>Fill in the manager's information below.</p>
        </div>

        <form onSubmit={submit} className='p-6 space-y-4'>
          <div>
            <label className='mb-1 block text-sm font-medium text-slate-700'>Full Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className='w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-teal-300 focus:ring-4 focus:ring-teal-100'
              required
              placeholder='John Doe'
            />
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium text-slate-700'>Email Address</label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              type='email'
              className='w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-teal-300 focus:ring-4 focus:ring-teal-100'
              required
              placeholder='manager@example.com'
            />
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium text-slate-700'>Username</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              className='w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-teal-300 focus:ring-4 focus:ring-teal-100'
              required
              placeholder='username'
            />
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium text-slate-700'>
              Password {initial && <span className='text-xs text-slate-400'>(Leave blank to keep current)</span>}
            </label>
            <input
              value={password}
              onChange={e => setPassword(e.target.value)}
              type='password'
              className='w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-teal-300 focus:ring-4 focus:ring-teal-100'
              placeholder={initial ? '••••••••' : 'Enter password'}
              required={!initial}
            />
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium text-slate-700'>Manager Type</label>
            <select
              value={managerType}
              onChange={e => setManagerType(e.target.value)}
              className='w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-teal-300 focus:ring-4 focus:ring-teal-100'
            >
              <option value='DONOR_MANAGER'>Donor Manager</option>
              <option value='NGO_MANAGER'>NGO Manager</option>
              <option value='DRIVER_MANAGER'>Driver Manager</option>
            </select>
          </div>

          <div className='flex items-center justify-end gap-3 pt-2'>
            <button
              type='button'
              onClick={onClose}
              disabled={saving}
              className='rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={saving}
              className='inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-65'
            >
              {saving && <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>}
              {saving ? 'Saving...' : (initial ? 'Update Manager' : 'Create Manager')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Managers