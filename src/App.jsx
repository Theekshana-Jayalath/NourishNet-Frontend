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
import Inventory from './pages/admin/Inventory'
import DashboardHome from './pages/admin/DashboardHome'

import DonorDashboard from './pages/DonorDashboard'
import NgoDashboard from './pages/ngoUser/NgoDashboard'
import DriverDashboard from './pages/DriverDashboard'

// ✅ FIXED NGO IMPORT (change folder if needed)
import NgoDashboard from './pages/ngoUser/NgoDashboard'

import DonationApplication from './pages/DonationApplication'
import DonorHistory from './pages/DonorHistory'
import DonorProfile from './pages/DonorProfile'

const App = () => {
  return (
    <BrowserRouter>
      <Main />
    </BrowserRouter>
  )
}

function Main() {
  const location = useLocation()

  // routes where footer should be hidden
  const hideFooterPaths = [
    '/donor-dashboard',
    '/ngo-dashboard',
    '/driver-dashboard',
    '/ngo-manager-dashboard',
    '/donor-manager-dashboard',
    '/driver-manager-dashboard'
  ]

  const shouldHideFooter = hideFooterPaths.some(path =>
    location.pathname.startsWith(path)
  )

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path='/' element={<Header />} />
        <Route path='/apply' element={<Apply />} />
        <Route path='/login' element={<Login />} />

        {/* Admin Dashboard */}
        <Route path='/admin-dashboard/*' element={<AdminDashboard />}>
          <Route index element={<DashboardHome />} />
          <Route path='managers' element={<Managers />} />
          <Route path='users' element={<Users />} />
          <Route path='inventory' element={<Inventory />} />
          <Route path='applications' element={<Applications />} />
        </Route>

        {/* Donor */}
        <Route path='/donor-dashboard' element={<DonorDashboard />} />
        <Route path='/donor-history' element={<DonorHistory />} />
        <Route path='/donor-profile' element={<DonorProfile />} />

        {/* NGO */}
        <Route path='/ngo-dashboard' element={<NgoDashboard />} />
        <Route path='/ngo-manager-dashboard' element={<NgoDashboard />} />

        {/* Driver */}
        <Route path='/driver-dashboard' element={<DriverDashboard />} />
        <Route path='/driver-manager-dashboard' element={<DriverDashboard />} />

        {/* Donation */}
        <Route path='/DonationApplication' element={<DonationApplication />} />
      </Routes>

      {/* Footer */}
      {!shouldHideFooter && <Footer />}
    </>
  )
}

export default App