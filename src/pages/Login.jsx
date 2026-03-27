import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { welcome } from '../assets/assets'

// Minimal JWT decode (no verification)
const decodeJwt = (token) => {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(window.atob(payload))
  } catch {
    return null
  }
}

const Login = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const base = import.meta.env.VITE_API_URL
      const url = base ? `${base}/api/auth/login` : '/api/auth/login'
      const payload = { username, password }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Invalid credentials')
        setLoading(false)
        return
      }

      const token = data.token
      if (!token) {
        setError('Invalid server response')
        setLoading(false)
        return
      }

      localStorage.setItem('token', token)

      const tokenPayload = decodeJwt(token)
      const finalRole =
        (data.role || '').toString().toLowerCase() ||
        (tokenPayload?.role || '').toString().toLowerCase() ||
        role

      localStorage.setItem('role', finalRole)

      // Save full user details for Profile page
      const userFromResponse = data.user || {}
      const storedUser = {
        _id:
          userFromResponse._id ||
          userFromResponse.id ||
          data._id ||
          data.id ||
          tokenPayload?._id ||
          tokenPayload?.id ||
          tokenPayload?.userId ||
          '',
        username:
          userFromResponse.username ||
          data.username ||
          username ||
          '',
        name:
          userFromResponse.name ||
          data.name ||
          userFromResponse.username ||
          username ||
          '',
        email:
          userFromResponse.email ||
          data.email ||
          '',
        role: finalRole,
        nic:
          userFromResponse.nic ||
          data.nic ||
          '',
        address:
          userFromResponse.address ||
          data.address ||
          '',
        city:
          userFromResponse.city ||
          data.city ||
          '',
        organizationName:
          userFromResponse.organizationName ||
          data.organizationName ||
          '',
        registrationNumber:
          userFromResponse.registrationNumber ||
          data.registrationNumber ||
          '',
        contactNumber:
          userFromResponse.contactNumber ||
          userFromResponse.contact ||
          data.contactNumber ||
          data.contact ||
          '',
      }

      localStorage.setItem('user', JSON.stringify(storedUser))

      if (finalRole === 'admin') {
        navigate('/admin-dashboard')
      } else if (finalRole === 'manager') {
        const dept = (data.department || '').toString().toLowerCase()
        switch (dept) {
          case 'ngo':
            navigate('/ngo-manager-dashboard')
            break
          case 'donor':
            navigate('/donor-manager-dashboard')
            break
          case 'driver':
            navigate('/driver-manager-dashboard')
            break
          default:
            navigate('/manager-dashboard')
        }
      } else if (finalRole === 'donor') {
        navigate('/donor-dashboard')
      } else if (finalRole === 'ngo') {
        navigate('/ngo-dashboard')
      } else if (finalRole === 'driver') {
        navigate('/driver-dashboard')
      } else {
        navigate('/')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Network error while logging in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-teal-200 via-white to-teal-400 px-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden bg-white">
        <div className="hidden md:flex relative">
          <img src={welcome} alt="Welcome" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-br from-teal-800/80 to-teal-600/60"></div>
          <div className="relative z-10 flex flex-col justify-center items-start text-left text-white pl-8 md:pl-16 py-16 pr-8 w-full">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4">NourishNet</h1>
            <p className="text-base md:text-lg leading-relaxed text-teal-100 max-w-sm">
              Welcome back — sign in to manage donations, coordinate pickups, and help reduce food waste in your community.
            </p>
          </div>
        </div>

        <div className="p-10 md:p-14 bg-white">
          <h2 className="text-3xl font-bold text-teal-900 mb-1">Welcome Back</h2>
          <p className="text-gray-500 mb-8">Please login to continue</p>

          {error && (
            <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e)=>setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full mt-1 px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-teal-700 transition"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600">
                <input type="checkbox" className="accent-teal-600"/>
                Remember me
              </label>

              <span className="text-teal-700 hover:text-teal-900 cursor-pointer">
                Forgot password?
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold bg-linear-to-r from-teal-500 to-teal-800 hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?
            <span
              onClick={() => navigate('/apply')}
              className="text-teal-700 ml-1 hover:underline cursor-pointer"
            >
              Join with us
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login