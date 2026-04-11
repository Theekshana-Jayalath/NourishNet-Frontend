import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { welcome } from '../assets/assets'

// Minimal JWT decode (no verification) to read role from token payload
const decodeJwt = (token) => {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(window.atob(payload))
    return decoded
  } catch (e) {
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
      // persist token for authenticated API calls (DashboardHome reads this)
      try { localStorage.setItem('token', token) } catch (_) {}

      // Persist full user object returned from backend so other pages can read id/name/role
      if (data.user) {
        try { localStorage.setItem('user', JSON.stringify(data.user)) } catch (_) {}
      }

      const serverRole = (data.role || '').toString().toLowerCase()
      const fallbackTokenRole = (() => {
        const tokenPayload = decodeJwt(token)
        return (tokenPayload?.role || '').toString().toLowerCase()
      })()
      const finalRole = serverRole || fallbackTokenRole || role

      // persist role for client-side routing/UX
      try { localStorage.setItem('role', finalRole) } catch (_) {}

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
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
  <div className="min-h-screen flex items-center justify-center 
  bg-linear-to-br from-teal-200 via-white to-teal-400 px-4">

      <div className="w-full max-w-6xl grid md:grid-cols-2 
      rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] 
      overflow-hidden bg-white">

        {/* LEFT PANEL */}
        <div className="hidden md:flex relative">
          <img 
            src={welcome} 
            alt="Welcome"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-linear-to-br 
          from-teal-800/80 to-teal-600/60"></div>

           <div className="relative z-10 flex flex-col justify-center items-start text-left text-white pl-8 md:pl-16 py-16 pr-8 w-full">
             <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4">NourishNet</h1>
             <p className="text-base md:text-lg leading-relaxed text-teal-100 max-w-sm">
               Welcome back — sign in to manage donations, coordinate pickups, and help reduce food waste in your community.
             </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="p-10 md:p-14 bg-white">

          <h2 className="text-3xl font-bold text-teal-900 mb-1">
            Welcome Back
          </h2>

          <p className="text-gray-500 mb-8">
            Please login to continue
          </p>

          {error && (
            <div className="bg-red-100 text-red-600 px-4 py-2 
            rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Username */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Username
              </label>

              <input
                type="text"
                value={username}
                onChange={(e)=>setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full mt-1 px-4 py-3 rounded-xl
                border border-gray-200
                focus:outline-none focus:ring-2 
                focus:ring-teal-500 focus:border-transparent
                transition"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>

              <div className="relative">

                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full mt-1 px-4 py-3 pr-12
                  rounded-xl border border-gray-200
                  focus:outline-none focus:ring-2 
                  focus:ring-teal-500 focus:border-transparent
                  transition"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 
                  -translate-y-1/2 text-gray-500 
                  hover:text-teal-700 transition"
                >
                  {showPassword ? (
                    /* FULL EYE */
                    <svg xmlns="http://www.w3.org/2000/svg"
                         className="h-5 w-5"
                         fill="none"
                         viewBox="0 0 24 24"
                         stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5
                           c4.477 0 8.268 2.943 9.542 7
                           -1.274 4.057-5.065 7-9.542 7
                           -4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    /* CUT EYE */
                    <svg xmlns="http://www.w3.org/2000/svg"
                         className="h-5 w-5"
                         fill="none"
                         viewBox="0 0 24 24"
                         stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19
                           c-5 0-9-3.5-10-8
                           1-3.5 5-6 10-6
                           1.63 0 3.17.28 4.54.78M15 12a3 3 0 11-6 0
                           3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 3l18 18" />
                    </svg>
                  )}
                </button>

              </div>
            </div>

            {/* Role
            <div>
              <label className="text-sm font-medium text-gray-700">
                Role (optional)
              </label>

              <select
                value={role}
                onChange={(e)=>setRole(e.target.value)}
                className="w-full mt-1 px-4 py-3 rounded-xl 
                border border-gray-200
                focus:outline-none focus:ring-2 
                focus:ring-teal-500"
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="donor">Donor</option>
                <option value="ngo">NGO</option>
                <option value="driver">Driver</option>
              </select>
            </div> */}

            {/* Remember */}
            <div className="flex justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600">
                <input type="checkbox" className="accent-teal-600"/>
                Remember me
              </label>

              <span className="text-teal-700 hover:text-teal-900 cursor-pointer">
                Forgot password?
              </span>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white 
                font-semibold bg-linear-to-r from-teal-500 to-teal-800
                hover:scale-[1.02] transition-all duration-200
                shadow-lg hover:shadow-xl"
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
