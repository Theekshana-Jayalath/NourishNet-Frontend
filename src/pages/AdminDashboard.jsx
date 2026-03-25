import React, { useState, useEffect } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import DashboardHome from './admin/DashboardHome'

const AdminDashboard = () => {
  const [collapsed, setCollapsed] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className='min-h-screen bg-gray-50 text-[#002a29]'>
      <div className='flex'>

        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-20 w-64 
        bg-gradient-to-b from-[#96ded1] via-[#66ada4] to-[#317873]
        p-6 shadow-xl transition-transform duration-200
        ${collapsed ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>

          <div className='flex items-center gap-3 mb-10'>
            <div className='w-10 h-10 rounded-full bg-white/20 flex items-center justify-center'>
              ❤️
            </div>
            <div>
              <h3 className='text-white font-bold text-lg'>NourishNet</h3>
              <p className='text-white/80 text-sm'>Admin Panel</p>
            </div>
          </div>

          <nav className='space-y-2'>
            <NavLink to='/admin-dashboard' end
              className={({isActive}) =>
              `block px-4 py-2 rounded-lg transition
              ${isActive ? 'bg-white/20 text-white font-semibold'
              : 'text-white/90 hover:bg-white/10'}`
            }>
              Dashboard
            </NavLink>

            <NavLink to='/admin-dashboard/managers'
              className={({isActive}) =>
              `block px-4 py-2 rounded-lg transition
              ${isActive ? 'bg-white/20 text-white font-semibold'
              : 'text-white/90 hover:bg-white/10'}`
            }>
              Managers
            </NavLink>

            <NavLink to='/admin-dashboard/users'
              className={({isActive}) =>
              `block px-4 py-2 rounded-lg transition
              ${isActive ? 'bg-white/20 text-white font-semibold'
              : 'text-white/90 hover:bg-white/10'}`
            }>
              Users
            </NavLink>

            <NavLink to='/admin-dashboard/inventory'
              className={({isActive}) =>
              `block px-4 py-2 rounded-lg transition
              ${isActive ? 'bg-white/20 text-white font-semibold'
              : 'text-white/90 hover:bg-white/10'}`
            }>
              Inventory
            </NavLink>

            <NavLink to='/admin-dashboard/applications'
              className={({isActive}) =>
              `block px-4 py-2 rounded-lg transition
              ${isActive ? 'bg-white/20 text-white font-semibold'
              : 'text-white/90 hover:bg-white/10'}`
            }>
              Applications
            </NavLink>
          </nav>
        </aside>

        {/* Content */}
        <div className='flex-1 md:ml-64'>

          {/* Topbar */}
          <header className='flex items-center justify-between
          px-6 py-4 bg-white shadow-sm'>

            <div className='flex items-center gap-4'>
              <button
                className='md:hidden p-2 rounded-md bg-[#96ded1]'
                onClick={() => setCollapsed(!collapsed)}
              >
                ☰
              </button>

              <h2 className='text-xl font-semibold text-[#004b49]'>
                Admin Dashboard
              </h2>
            </div>

            <div className='flex items-center gap-4'>

              {/* Notification */}
              <button className='relative p-2 rounded-full hover:bg-gray-100'>
                🔔
                <span className='absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full'></span>
              </button>

              <div className='text-sm text-gray-600'>Admin</div>

              <div className='w-8 h-8 rounded-full bg-[#317873]
              flex items-center justify-center text-white'>
                A
              </div>

              <button
                onClick={() => { localStorage.removeItem('token'); navigate('/'); }}
                className='px-3 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600'
              >
                Logout
              </button>
            </div>
          </header>

          <main className='p-6'>
            {location.pathname === '/admin-dashboard'
              ? <DashboardHome />
              : <Outlet />
            }
          </main>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard