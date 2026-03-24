import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Apply from './pages/Apply'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import Managers from './pages/admin/Managers'
import Users from './pages/admin/Users'
import Applications from './pages/admin/Applications'
import DashboardHome from './pages/admin/DashboardHome'
import ManagerDashboard from './pages/ManagerDashboard'
import DonorDashboard from './pages/DonorDashboard'
import NgoDashboard from './pages/NgoDashboard'
import DriverDashboard from './pages/DriverDashboard'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Header />} />
  <Route path='/apply' element={<Apply />} />
        <Route path='/login' element={<Login />} />
        <Route path='/admin-dashboard/*' element={<AdminDashboard />}>
          <Route index element={<DashboardHome/>} />
          <Route path='managers' element={<Managers/>} />
          <Route path='users' element={<Users/>} />
          <Route path='inventory' element={<div className='p-6'>Inventory management coming soon.</div>} />
          <Route path='applications' element={<Applications/>} />
        </Route>
        <Route path='/manager-dashboard' element={<ManagerDashboard />} />
        <Route path='/donor-dashboard' element={<DonorDashboard />} />
        <Route path='/ngo-dashboard' element={<NgoDashboard />} />
        <Route path='/driver-dashboard' element={<DriverDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
