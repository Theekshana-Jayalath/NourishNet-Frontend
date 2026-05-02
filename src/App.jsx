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
import ManagerDashboard from './pages/ManagerDashboard'
import DonorDashboard from './pages/donor/DonorDashboard'
import DriverDashboard from './pages/DriverDashboard'
import NgoDashboard from './pages/ngoUser/NgoDashboard'
import Drivers from './pages/admin/Drivers'
import NgoManagerDashboard from './pages/ngoManager/NgoManagerDashboard'
import About from './pages/About'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsConditions from './pages/TermsConditions'
import DonorManagerDashboard from './pages/donorManager/DonorManagerDashboard'

const App = () => {
  return (
    <BrowserRouter>
      <Main />
    </BrowserRouter>
  )
}

function Main() {
  const location = useLocation()

  const hideFooterPaths = [
    '/manager-dashboard',
    '/donor-dashboard',
    '/ngo-dashboard',
    '/driver-dashboard',
    '/ngo-manager-dashboard',
    '/donor-manager-dashboard',
    '/driver-manager-dashboard',
  ]

  const shouldHideFooter = hideFooterPaths.some((p) =>
    location.pathname.startsWith(p)
  )

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path='/' element={<Header />} />
        <Route path='/apply' element={<Apply />} />
        <Route path='/login' element={<Login />} />
        <Route path='/about' element={<About />} />
        <Route path='/privacy-policy' element={<PrivacyPolicy />} />
        <Route path='/terms-conditions' element={<TermsConditions />} />

        {/* Admin Dashboard */}
        <Route path='/admin-dashboard/*' element={<AdminDashboard />}>
          <Route index element={<DashboardHome />} />
          <Route path='managers' element={<Managers />} />
          <Route path='users' element={<Users />} />
          <Route path='drivers' element={<Drivers />} />
          <Route path='inventory' element={<Inventory />} />
          <Route path='applications' element={<Applications />} />
        </Route>

        <Route path='/manager-dashboard' element={<ManagerDashboard />} />

        {/* Donor Dashboard with nested routes inside DonorDashboard.jsx */}
        <Route path='/donor-dashboard/*' element={<DonorDashboard />} />

        <Route path='/ngo-dashboard' element={<NgoDashboard />} />
        <Route path='/driver-dashboard' element={<DriverDashboard />} />
        <Route path='/ngo-manager-dashboard' element={<NgoManagerDashboard />} />
        <Route path='/driver-manager-dashboard' element={<ManagerDashboard />} />
        <Route path='/donor-manager-dashboard/*' element={<DonorManagerDashboard />} />
      </Routes>

      {!shouldHideFooter && <Footer />}
    </>
  )
}

export default App