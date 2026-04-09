import React from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Apply from './pages/Apply'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import Managers from './pages/admin/Managers'
import Users from './pages/admin/Users'
import Applications from './pages/admin/Applications'
import DashboardHome from './pages/admin/DashboardHome'
import Drivers from './pages/admin/Drivers'
import ManagerDashboard from './pages/ManagerDashboard'
import DonorDashboard from './pages/DonorDashboard'
import NgoDashboard from './pages/NgoDashboard'
import DriverDashboard from './pages/DriverDashboard'

const App = () => {
  return (
    <BrowserRouter>
      <Main />
    </BrowserRouter>
  )
}

function Main() {
  const location = useLocation()
  
  // routes where we don't want to show the global footer
  const hideFooterPaths = [
    '/manager-dashboard',
    '/donor-dashboard',
    '/ngo-dashboard',
    '/driver-dashboard',
    '/ngo-manager-dashboard',
    '/donor-manager-dashboard',
    '/driver-manager-dashboard'
  ]

  const shouldHideFooter = hideFooterPaths.some(p => location.pathname.startsWith(p))

  return (
    <>
      <Routes>
        <Route path='/' element={<Header />} />
        <Route path='/apply' element={<Apply />} />
        <Route path='/login' element={<Login />} />
        
        {/* Admin Dashboard */}
        <Route path='/admin-dashboard/*' element={<AdminDashboard />}>
          <Route index element={<DashboardHome />} />
          <Route path='managers' element={<Managers />} />
          <Route path='users' element={<Users />} />
          <Route path='drivers' element={<Drivers />} />
          <Route path='inventory' element={<div className='p-6'>Inventory management coming soon.</div>} />
          <Route path='applications' element={<Applications />} />
        </Route>
            {/* Uncommented: Manager Dashboard */}
            <Route path='/manager-dashboard' element={<ManagerDashboard />} />
            <Route path='/donor-dashboard' element={<DonorDashboard />} />
            <Route path='/ngo-dashboard' element={<NgoDashboard />} />
            <Route path='/driver-dashboard' element={<DriverDashboard />} />
            {/* manager-specific named routes (Login redirects here) */}
            <Route path='/ngo-manager-dashboard' element={<NgoDashboard />} />
            {/* Removed DonorManagerDashboard route */}
            <Route path='/driver-manager-dashboard' element={<ManagerDashboard />} />
      </Routes>
      
      {!shouldHideFooter && <Footer />}
    </>
  )
}

export default App