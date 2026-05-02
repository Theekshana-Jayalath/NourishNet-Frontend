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
      try { localStorage.setItem('token', token) } catch (_) {}

      if (data.user) {
        try { localStorage.setItem('user', JSON.stringify(data.user)) } catch (_) {}
      }

      const serverRole = (data.role || '').toString().toLowerCase()
      const fallbackTokenRole = (() => {
        const tokenPayload = decodeJwt(token)
        return (tokenPayload?.role || '').toString().toLowerCase()
      })()
      const finalRole = serverRole || fallbackTokenRole || role

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-100 via-teal-50 to-emerald-100 px-4 py-8">
      
      <div className="w-full max-w-5xl grid md:grid-cols-2 rounded-3xl shadow-2xl overflow-hidden bg-white backdrop-blur-sm">
        
        {/* LEFT PANEL - Modern Design */}
        <div className="hidden md:flex relative bg-gradient-to-br from-teal-700 to-teal-900">
          <img 
            src={welcome} 
            alt="Welcome"
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
          />
          
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900/85 via-teal-800/80 to-teal-700/75"></div>
          
          <div className="relative z-10 flex flex-col justify-between p-10 w-full min-h-[600px]">
            <div>
              <div className="flex items-center gap-3 mb-12">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-white text-2xl font-bold">N</span>
                </div>
                <span className="text-white text-xl font-semibold tracking-wide">NourishNet</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-white leading-tight">
                Welcome Back
              </h1>
              <p className="text-teal-100 text-lg leading-relaxed">
                Sign in to manage donations, coordinate pickups, and help reduce food waste in your community.
              </p>
              
              <div className="flex items-center gap-3 pt-6">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30"></div>
                  <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30"></div>
                  <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30"></div>
                </div>
                <p className="text-teal-100 text-sm">Join 10,000+ users</p>
              </div>
            </div>
            
            <div className="text-teal-200/60 text-xs">
              © 2024 NourishNet. All rights reserved.
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Modern Login Form */}
        <div className="p-8 md:p-12 bg-white">
          
          <div className="text-center md:text-left mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-700 to-teal-900 bg-clip-text text-transparent">
              Sign In
            </h2>
            <p className="text-gray-500 mt-2">
              Enter your credentials to access your account
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Username Field */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e)=>setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-teal-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <button 
                type="button"
                className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-semibold text-base bg-gradient-to-r from-teal-600 to-teal-800 hover:from-teal-700 hover:to-teal-900 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>

          </form>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button 
                onClick={() => navigate('/apply')} 
                className="font-semibold text-teal-600 hover:text-teal-700 hover:underline transition-colors"
              >
                Join with us
              </button>
            </p>
          </div>
          
        </div>
      </div>
    </div>
  )
}

export default Login