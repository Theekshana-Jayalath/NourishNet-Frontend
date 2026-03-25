import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

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
      // role is optional — server will determine actual role

      const url = base ? `${base}/api/auth/login` : '/api/auth/login'
      const payload = { username, password }
      console.log(username, password, role)
      console.log('Login request body:', payload)
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      console.log('Login response data:', data)

      if (!res.ok) {
        console.log('Login failed response:', data)
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

      // store token locally
      localStorage.setItem('token', token)

      // prefer the role returned by backend response
      const serverRole = (data.role || '').toString().toLowerCase()
      const fallbackTokenRole = (() => {
        const tokenPayload = decodeJwt(token)
        return (tokenPayload?.role || '').toString().toLowerCase()
      })()
      const finalRole = serverRole || fallbackTokenRole || role

      // Store user data in localStorage for getUser() to work
      const userData = {
        _id: data._id || data.userId || data.id || '',
        username: data.username || username,
        name: data.name || data.username || username,
        email: data.email || '',
        role: finalRole,
        department: data.department || '',
      }
      localStorage.setItem('user', JSON.stringify(userData))

      // redirect based on server-provided role
      if (finalRole === 'admin') {
        navigate('/admin-dashboard')
      } else if (finalRole === 'manager') {
        // server may return department for manager accounts
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
    <div className='min-h-screen flex items-center justify-center bg-white px-4'>
      <div className='max-w-3xl w-full grid grid-cols-1 md:grid-cols-2 shadow-2xl rounded-2xl overflow-hidden'>
        {/* Left decorative panel */}
        <div className='hidden md:flex flex-col items-center justify-center p-8' style={{ background: 'linear-gradient(180deg, #96ded1 0%, #317873 100%)' }}>
          <div className='text-white text-center'>
            <h3 className='text-3xl font-bold mb-2'>Welcome Back</h3>
            <p className='opacity-90'>Sign in to continue to NourishNet</p>
          </div>
        </div>

        {/* Right: form */}
        <div className='bg-white p-8 md:p-12 flex items-center'>
          <div className='w-full'>
            <div className='mb-6 text-center'>
              <h2 className='text-2xl font-extrabold text-[#004b49]'>Sign In</h2>
              <p className='text-sm text-gray-600 mt-2'>Enter your credentials to access your dashboard</p>
            </div>

            {error && (
              <div className='mb-4 text-sm text-red-700 bg-red-100 px-4 py-2 rounded'>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Username</label>
                <div className='flex items-center border rounded-md px-3 py-2 focus-within:ring-2' style={{ borderColor: '#e6f3f1' }}>
                  <svg className='w-5 h-5 text-[#66ada4] mr-3' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5.121 17.804A13.937 13.937 0 0112 15c2.761 0 5.301.753 7.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z'></path></svg>
                  <input
                    className='w-full outline-none'
                    type='text'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder='username'
                    required
                  />
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Password</label>
                <div className='flex items-center border rounded-md px-3 py-2 focus-within:ring-2' style={{ borderColor: '#e6f3f1' }}>
                  <svg className='w-5 h-5 text-[#317873] mr-3' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 11c1.657 0 3 .895 3 2v1H9v-1c0-1.105 1.343-2 3-2z'></path><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 11V9a5 5 0 10-10 0v2'></path></svg>
                  <input
                    className='w-full outline-none'
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder='password'
                    required
                  />
                  <button type='button' onClick={() => setShowPassword(s => !s)} className='ml-2 text-gray-500 hover:text-gray-700' aria-label='Toggle password visibility'>
                    {showPassword ? (
                      <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'/><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'/></svg>
                    ) : (
                      <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-3.5-10-8 1-3.5 5-6 10-6 1.63 0 3.17.28 4.54.78M15 12a3 3 0 11-6 0 3 3 0 016 0z'/><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 3l18 18'/></svg>
                    )}
                  </button>
                </div>
              </div>

              <div className='flex items-center justify-between text-sm'>
                <label className='flex items-center gap-2'>
                  <input type='checkbox' className='h-4 w-4 text-[#317873] border-gray-300 rounded' />
                  <span className='text-gray-600'>Remember me</span>
                </label>
                <a className='text-sm text-[#317873] hover:underline cursor-pointer'>Forgot?</a>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Role (optional)</label>
                <select value={role} onChange={e => setRole(e.target.value)} className={`w-full border px-3 py-2 rounded ${role ? 'text-gray-600' : 'text-gray-400'}`}>
                  <option className='text-gray-400' value='' disabled>Select Role</option>
                  <option value='admin'>admin</option>
                  <option value='manager'>manager</option>
                  <option value='donor'>donor</option>
                  <option value='ngo'>ngo</option>
                  <option value='driver'>driver</option>
                </select>
              </div>

              <button type='submit' disabled={loading} className='w-full py-3 rounded-md text-white font-semibold' style={{ background: 'linear-gradient(90deg,#66ada4,#317873)' }}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className='mt-6 text-center text-sm text-gray-500'>
              <span>Don't have an account? </span>
              <a className='text-[#66ada4]'>Contact admin</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login