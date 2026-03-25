import React, { useState, useEffect } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import Managers from './admin/Managers'
import Applications from './admin/Applications'

const navItems = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'managers', label: 'Managers' },
  { key: 'users', label: 'Users' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'applications', label: 'Applications' },
]

const AdminDashboard = () => {
  const [collapsed, setCollapsed] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    // set active route based on path
    if (location.pathname.includes('/admin-dashboard/managers')) navigate('/admin-dashboard/managers', { replace: true })
    // eslint-disable-next-line
  }, [])
  const [counts, setCounts] = useState({
    managers: null,
    donors: null,
    ngos: null,
    drivers: null,
    inventory: null,
  })
  const [countsLoading, setCountsLoading] = useState(false)
  const [countsError, setCountsError] = useState('')

  useEffect(() => {
    const fetchCounts = async () => {
      setCountsLoading(true)
      setCountsError('')
      const token = localStorage.getItem('token')

      try {
        // Inventory count: public endpoint
        try {
          const invRes = await fetch('/api/display/items')
          if (invRes.ok) {
            const invJson = await invRes.json()
            setCounts((s) => ({ ...s, inventory: invJson.count ?? (Array.isArray(invJson.data) ? invJson.data.length : null) }))
          } else {
            // fallback to donation forms endpoint which may represent submitted forms
            const dfRes = await fetch('/donationForms')
            if (dfRes.ok) {
              const dfJson = await dfRes.json()
              setCounts((s) => ({ ...s, inventory: dfJson.count ?? null }))
            } else {
              setCounts((s) => ({ ...s, inventory: null }))
            }
          }
        } catch (e) {
          setCounts((s) => ({ ...s, inventory: null }))
        }

        // User role counts — try multiple strategies, prefer authenticated call if token present
        const roleKeys = ['managers', 'donors', 'ngos', 'drivers']
        const roleMap = { managers: 'manager', donors: 'donor', ngos: 'ngo', drivers: 'driver' }

        // Attempt 1: call /api/users (if exists) and compute counts
        let usersFetched = false
        try {
          const headers = token ? { Authorization: `Bearer ${token}` } : {}
          const usersRes = await fetch('/api/users', { headers })
          if (usersRes.ok) {
            const usersJson = await usersRes.json()
            // usersJson may be an array or { data: [...] }
            const arr = Array.isArray(usersJson) ? usersJson : usersJson.data || usersJson.users || []
            if (Array.isArray(arr)) {
              const roleCounts = { managers: 0, donors: 0, ngos: 0, drivers: 0 }
              arr.forEach((u) => {
                const r = (u.role || '').toLowerCase()
                if (r === 'manager') roleCounts.managers++
                if (r === 'donor') roleCounts.donors++
                if (r === 'ngo') roleCounts.ngos++
                if (r === 'driver') roleCounts.drivers++
              })
              setCounts((s) => ({ ...s, ...roleCounts }))
              usersFetched = true
            }
          }
        } catch (e) {
          // ignore
        }

        // Attempt 2: try role-specific endpoints (may require auth) e.g. /api/users/manager
        if (!usersFetched) {
          for (const key of roleKeys) {
            const role = roleMap[key]
            try {
              const headers = token ? { Authorization: `Bearer ${token}` } : {}
              const res = await fetch(`/api/users/${role}`, { headers })
              if (res.ok) {
                const json = await res.json()
                // if backend returns { count } or data array
                const value = json.count ?? (Array.isArray(json.data) ? json.data.length : null)
                // If endpoint just returns welcome message, set null
                setCounts((s) => ({ ...s, [key]: value }))
              } else {
                setCounts((s) => ({ ...s, [key]: null }))
              }
            } catch (e) {
              setCounts((s) => ({ ...s, [key]: null }))
            }
          }
        }

      } catch (err) {
        setCountsError('Unable to fetch counts')
      } finally {
        setCountsLoading(false)
      }
    }

    fetchCounts()
  }, [])

  return (
    <div className='min-h-screen bg-white text-[#002a29]'>
      <div className='flex'>
        {/* Sidebar */}
  <aside className={`fixed inset-y-0 left-0 z-20 w-64 transform bg-linear-to-b from-[#96ded1] via-[#66ada4] to-[#317873] p-6 transition-transform duration-200 ease-in-out md:translate-x-0 ${collapsed ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
          <div className='flex items-center gap-3 mb-8'>
            <div className='w-10 h-10 rounded-full bg-white/20 flex items-center justify-center'>
              <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 10h4l3 8 4-16 3 8h4'></path></svg>
            </div>
            <div>
              <h3 className='text-white font-bold text-lg'>NourishNet</h3>
              <p className='text-white/80 text-sm'>Admin Panel</p>
            </div>
          </div>

          <nav className='space-y-1'>
            <NavLink to='/admin-dashboard' end className={({isActive}) => `w-full block px-3 py-2 rounded-md ${isActive ? 'bg-white/20 text-white font-semibold' : 'text-white/90 hover:bg-white/10'}`}>
              Dashboard
            </NavLink>
            <NavLink to='/admin-dashboard/managers' className={({isActive}) => `w-full block px-3 py-2 rounded-md ${isActive ? 'bg-white/20 text-white font-semibold' : 'text-white/90 hover:bg-white/10'}`}>
              Managers
            </NavLink>
            <NavLink to='/admin-dashboard/users' className={({isActive}) => `w-full block px-3 py-2 rounded-md ${isActive ? 'bg-white/20 text-white font-semibold' : 'text-white/90 hover:bg-white/10'}`}>
              Users
            </NavLink>
            <NavLink to='/admin-dashboard/inventory' className={({isActive}) => `w-full block px-3 py-2 rounded-md ${isActive ? 'bg-white/20 text-white font-semibold' : 'text-white/90 hover:bg-white/10'}`}>
              Inventory
            </NavLink>
            <NavLink to='/admin-dashboard/applications' className={({isActive}) => `w-full block px-3 py-2 rounded-md ${isActive ? 'bg-white/20 text-white font-semibold' : 'text-white/90 hover:bg-white/10'}`}>
              Applications
            </NavLink>
          </nav>
        </aside>

        {/* Content area */}
        <div className='flex-1 min-h-screen md:ml-64'>
          {/* Top navbar */}
          <header className='flex items-center justify-between px-6 py-4 border-b bg-white'>
            <div className='flex items-center gap-4'>
              <button className='md:hidden p-2 rounded-md bg-[#96ded1]' onClick={() => setCollapsed(!collapsed)}>
                <svg className='w-6 h-6 text-[#002a29]' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 6h16M4 12h16M4 18h16'></path></svg>
              </button>
              <h2 className='text-xl font-semibold text-[#004b49]'>Admin Dashboard</h2>
            </div>

            <div className='flex items-center gap-4'>
              <div className='text-sm text-gray-600'>Admin</div>
              <div className='w-8 h-8 rounded-full bg-[#317873] flex items-center justify-center text-white'>A</div>
              <button onClick={() => { localStorage.removeItem('token'); navigate('/'); }} className='ml-4 px-3 py-1 rounded bg-[#ff6b6b] text-white'>Logout</button>
            </div>
          </header>

          {/* Main */}
          <main className='p-6'>
            <div className='max-w-7xl mx-auto'>
              {/* Use Outlet for nested routes */}
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
