import React, { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import DashboardHome from './admin/DashboardHome'
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  UserCog, 
  Package, 
  LogOut, 
  Bell, 
  Search,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Settings,
  HelpCircle
} from 'lucide-react'
import logoImg from '../assets/logo.png'

const AdminDashboard = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/")
  }

  const navItems = [
    { path: "/admin-dashboard", name: "Dashboard", icon: LayoutDashboard, end: true },
    { path: "/admin-dashboard/applications", name: "Applications", icon: FileText },
    { path: "/admin-dashboard/users", name: "Users", icon: Users },
    { path: "/admin-dashboard/managers", name: "Managers", icon: UserCog },
    { path: "/admin-dashboard/inventory", name: "Inventory", icon: Package },
  ]

  const getPageTitle = () => {
    const current = navItems.find(item => 
      item.end ? location.pathname === item.path : location.pathname.startsWith(item.path)
    )
    return current ? current.name : "Dashboard"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex">
      
      {/* Sidebar for Desktop */}
      <aside 
        className={`hidden md:flex flex-col transition-all duration-300 ${
          collapsed ? 'w-24' : 'w-80'
        } bg-gradient-to-b from-teal-800 via-teal-900 to-teal-950 shadow-2xl relative h-screen sticky top-0`}
      >
        {/* Collapse Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-4 top-28 bg-white rounded-full p-2 shadow-lg border border-teal-200 z-10 hover:bg-teal-50 transition-colors"
        >
          {collapsed ? (
            <ChevronRight size={18} className="text-teal-600" />
          ) : (
            <ChevronLeft size={18} className="text-teal-600" />
          )}
        </button>

        {/* Logo Section */}
        <div className={`flex items-center gap-4 p-8 pt-10 border-b border-teal-700/50 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm shadow-lg">
            <img src={logoImg} alt="Logo" className="w-10 h-10 object-contain" />
          </div>
          {!collapsed && (
            <div className="flex-1">
              <h3 className="font-bold text-white text-2xl tracking-tight">NourishNet</h3>
              <p className="text-sm text-teal-300 mt-1">Admin Portal</p>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-8 space-y-3 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.end 
              ? location.pathname === item.path 
              : location.pathname.startsWith(item.path)
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) => `
                  flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-white/20 text-white shadow-lg' 
                    : 'text-teal-100 hover:bg-white/10 hover:text-white'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
              >
                <Icon size={22} className={collapsed ? '' : 'shrink-0'} />
                {!collapsed && (
                  <span className="text-base font-medium">{item.name}</span>
                )}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-lg">
                    {item.name}
                  </div>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Bottom Section with Logout */}
        <div className="mt-auto">
          {/* Settings & Help (optional) */}
          {!collapsed && (
            <div className="px-4 py-3 border-t border-teal-700/30">
              <button className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-teal-300 hover:bg-white/10 transition-colors">
                <Settings size={18} />
                <span className="text-sm">Settings</span>
              </button>
              <button className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-teal-300 hover:bg-white/10 transition-colors">
                <HelpCircle size={18} />
                <span className="text-sm">Help & Support</span>
              </button>
            </div>
          )}
          
          {/* Logout Button */}
          <div className="p-6 pb-8 border-t border-teal-700/50">
            <button
              onClick={handleLogout}
              className={`flex items-center gap-4 w-full px-5 py-3.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 transition-all duration-200 ${
                collapsed ? 'justify-center' : ''
              }`}
            >
              <LogOut size={22} />
              {!collapsed && <span className="text-base font-medium">Logout</span>}
              {collapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Logout
                </div>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      <aside className={`fixed inset-y-0 left-0 z-50 w-80 bg-gradient-to-b from-teal-800 via-teal-900 to-teal-950 transform transition-transform duration-300 md:hidden ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-6 pt-8 border-b border-teal-700/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <img src={logoImg} alt="Logo" className="w-9 h-9 object-contain" />
            </div>
            <div>
              <h3 className="font-bold text-white text-xl">NourishNet</h3>
              <p className="text-xs text-teal-300">Admin Portal</p>
            </div>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="text-white p-2 hover:bg-white/10 rounded-lg">
            <X size={22} />
          </button>
        </div>
        
        <nav className="px-4 py-6 space-y-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.end 
              ? location.pathname === item.path 
              : location.pathname.startsWith(item.path)
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-white/20 text-white shadow-lg' 
                    : 'text-teal-100 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{item.name}</span>
              </NavLink>
            )
          })}
        </nav>
        
        <div className="p-4 pb-6 border-t border-teal-700/50 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        
        {/* Topbar - Increased height and spacing */}
        <header className="bg-white/95 backdrop-blur-md sticky top-0 z-30 px-8 md:px-10 py-5 border-b border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            
            <div className="flex items-center gap-5">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2.5 rounded-xl text-teal-600 hover:bg-teal-50 md:hidden transition-colors"
              >
                <Menu size={24} />
              </button>
              
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-700 to-teal-900 bg-clip-text text-transparent">
                  {getPageTitle()}
                </h2>
                <p className="text-base text-gray-500 mt-1.5">
                  Welcome back, Administrator
                </p>
              </div>
            </div>

            <div className="flex items-center gap-5">
              {/* Search */}
              <div className="hidden lg:flex items-center bg-gray-50 rounded-full px-6 py-3 border border-gray-200 focus-within:border-teal-300 focus-within:ring-2 focus-within:ring-teal-100 transition-all w-96">
                <Search size={20} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="bg-transparent px-4 text-base outline-none flex-1"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-3 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
                <Bell size={22} />
                <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full ring-2 ring-white"></span>
              </button>

              {/* Admin Avatar */}
              <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-500 to-teal-700 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  A
                </div>
                <div className="hidden lg:block">
                  <p className="text-base font-semibold text-gray-700">Admin User</p>
                  <p className="text-sm text-gray-400">Super Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content - Full width with proper padding */}
        <main className="flex-1 p-8 md:p-10 lg:p-12">
          <div className="w-full">
            {location.pathname === "/admin-dashboard"
              ? <DashboardHome />
              : <Outlet />
            }
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard