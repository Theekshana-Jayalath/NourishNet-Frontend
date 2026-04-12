import React, { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import DashboardHome from './admin/DashboardHome'

const AdminDashboard = () => {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#f5f7f7] flex">

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r p-5 flex flex-col justify-between">

        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#2f7d79] rounded-full flex items-center justify-center text-white">
              ✓
            </div>
            <div>
              <h3 className="font-bold text-[#004b49]">NourishNet</h3>
              <p className="text-xs text-gray-500">ADMIN PORTAL</p>
            </div>
          </div>

          {/* Menu */}
          <nav className="space-y-2">

            <NavLink to="/admin-dashboard" end
              className={({isActive}) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition
                ${isActive
                  ? "bg-[#e8f3f2] text-[#2f7d79] font-semibold"
                  : "text-gray-600 hover:bg-gray-100"}`
              }>
              Dashboard
            </NavLink>

            <NavLink to="/admin-dashboard/applications"
              className={({isActive}) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition
                ${isActive
                  ? "bg-[#e8f3f2] text-[#2f7d79] font-semibold"
                  : "text-gray-600 hover:bg-gray-100"}`
              }>
              Applications
            </NavLink>

            <NavLink to="/admin-dashboard/users"
              className={({isActive}) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition
                ${isActive
                  ? "bg-[#e8f3f2] text-[#2f7d79] font-semibold"
                  : "text-gray-600 hover:bg-gray-100"}`
              }>
              Users
            </NavLink>

            <NavLink to="/admin-dashboard/managers"
              className={({isActive}) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition
                ${isActive
                  ? "bg-[#e8f3f2] text-[#2f7d79] font-semibold"
                  : "text-gray-600 hover:bg-gray-100"}`
              }>
              Managers
            </NavLink>

            <NavLink to="/admin-dashboard/inventory"
              className={({isActive}) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition
                ${isActive
                  ? "bg-[#e8f3f2] text-[#2f7d79] font-semibold"
                  : "text-gray-600 hover:bg-gray-100"}`
              }>
              Inventory
            </NavLink>

          </nav>
        </div>

        <button
          onClick={() => { localStorage.removeItem("token"); navigate("/") }}
          className="text-left text-gray-500 hover:text-red-500"
        >
          Logout
        </button>

      </aside>


      {/* Main */}
      <div className="flex-1">

        {/* Topbar */}
        <header className="bg-white px-6 py-4 border-b flex justify-between items-center">

          <h2 className="text-lg font-semibold text-[#004b49]">
            Community Insights
          </h2>

          <div className="flex items-center gap-4">

            <input
              type="text"
              placeholder="Global search..."
              className="px-4 py-2 border rounded-full text-sm"
            />

            <button>🔔</button>

            <div className="w-8 h-8 bg-[#2f7d79] rounded-full text-white flex items-center justify-center">
              A
            </div>

          </div>

        </header>

        <main className="p-6">
          {location.pathname === "/admin-dashboard"
            ? <DashboardHome/>
            : <Outlet/>
          }
        </main>

      </div>
    </div>
  )
}

export default AdminDashboard