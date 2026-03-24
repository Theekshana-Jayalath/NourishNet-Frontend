import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Apply = () => {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [role, setRole] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [donorType, setDonorType] = useState('')
  const [nic, setNic] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [vehicleType, setVehicleType] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => { console.log('[Apply] mounted') }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')

    if (!name || !email || !username || !password || !confirmPassword || !role) {
      setError('Please fill Name, Email, Username, Password, Confirm Password and select a Role.')
      return
    }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }

    const r = (role || '').toString().toLowerCase()
  if (r === 'donor' && (!donorType || !contactNumber)) { setError('Donor: please select donor type and provide contact number'); return }
    if (r === 'ngo' && (!organizationName || !registrationNumber || !contactNumber)) { setError('NGO: please provide organization name, registration number and contact number'); return }
    if (r === 'driver' && (!vehicleType || !licenseNumber || !contactNumber)) { setError('Driver: please provide vehicle type, license number and contact number'); return }

  const raw = { name, email, username, password, role, notes, status: 'pending', nic, address, city }
  if (r === 'donor') { raw.donorType = donorType; raw.contact = contactNumber }
    if (r === 'ngo') { raw.organizationName = organizationName; raw.registrationNumber = registrationNumber; raw.contact = contactNumber }
    if (r === 'driver') { raw.vehicleType = vehicleType; raw.licenseNumber = licenseNumber; raw.contact = contactNumber }

    const payload = Object.entries(raw).reduce((acc, [k, v]) => { if (v !== undefined && v !== null && v !== '') acc[k] = v; return acc }, {})

    try {
      const base = import.meta.env.VITE_API_URL
      const url = base ? `${base}/api/applications` : '/api/applications'
      console.log('Submitting application payload (filtered):', payload)
      const fetchOptions = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
      console.log('Fetch options:', fetchOptions)
      const res = await fetch(url, fetchOptions)
      console.log('Application submit response status:', res.status)
      const data = await res.json().catch(() => null)
      console.log('Application submit response body:', data)
      if (res.status === 201) {
        setSuccess('Application submitted successfully')
  setName(''); setEmail(''); setUsername(''); setPassword(''); setConfirmPassword(''); setRole(''); setContactNumber(''); setDonorType(''); setOrganizationName(''); setRegistrationNumber(''); setVehicleType(''); setLicenseNumber(''); setNotes(''); setNic(''); setAddress(''); setCity('')
        return
      }
      setError((data && (data.message || data.error)) || `Submission failed (status ${res.status})`)
    } catch (err) {
      console.error('Application submit error:', err)
      setError('Network error while submitting application')
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 p-6'>
      <div className='w-full max-w-2xl bg-white rounded-xl shadow p-8'>
        <h2 className='text-2xl font-bold text-[#004b49] mb-2'>Join With Us</h2>
        <p className='text-sm text-gray-600 mb-6'>Apply to join NourishNet as a Donor, NGO or Driver. We'll review and get back to you.</p>

        {error && <div className='mb-4 text-sm text-red-700 bg-red-100 px-4 py-2 rounded'>{error}</div>}
        {success && <div className='mb-4 text-sm text-green-700 bg-green-100 px-4 py-2 rounded'>{success}</div>}

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='text-sm block mb-1'>Full name</label>
              <input value={name} onChange={e => setName(e.target.value)} className='w-full border px-3 py-2 rounded' required />
            </div>
            <div>
              <label className='text-sm block mb-1'>Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type='email' className='w-full border px-3 py-2 rounded' required />
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label className='text-sm block mb-1'>NIC</label>
              <input value={nic} onChange={e => setNic(e.target.value)} className='w-full border px-3 py-2 rounded' />
            </div>
            <div>
              <label className='text-sm block mb-1'>City</label>
              <input value={city} onChange={e => setCity(e.target.value)} className='w-full border px-3 py-2 rounded' />
            </div>
            <div>
              <label className='text-sm block mb-1'>Address</label>
              <input value={address} onChange={e => setAddress(e.target.value)} className='w-full border px-3 py-2 rounded' />
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label className='text-sm block mb-1'>Username</label>
              <input value={username} onChange={e => setUsername(e.target.value)} className='w-full border px-3 py-2 rounded' required />
            </div>
            <div>
              <label className='text-sm block mb-1'>Password</label>
              <div className='flex items-center border rounded-md px-3 py-2'>
                <input value={password} onChange={e => setPassword(e.target.value)} type={showPassword ? 'text' : 'password'} className='w-full outline-none' required />
                <button type='button' onClick={() => setShowPassword(s => !s)} className='ml-2 text-gray-500 hover:text-gray-700' aria-label='Toggle password visibility'>
                  {showPassword ? (
                    <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'/><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'/></svg>
                  ) : (
                    <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-3.5-10-8 1-3.5 5-6 10-6 1.63 0 3.17.28 4.54.78M15 12a3 3 0 11-6 0 3 3 0 016 0z'/><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 3l18 18'/></svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className='text-sm block mb-1'>Confirm Password</label>
              <div className='flex items-center border rounded-md px-3 py-2'>
                <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} type={showConfirm ? 'text' : 'password'} className='w-full outline-none' required />
                <button type='button' onClick={() => setShowConfirm(s => !s)} className='ml-2 text-gray-500 hover:text-gray-700' aria-label='Toggle confirm password visibility'>
                  {showConfirm ? (
                    <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'/><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'/></svg>
                  ) : (
                    <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-3.5-10-8 1-3.5 5-6 10-6 1.63 0 3.17.28 4.54.78M15 12a3 3 0 11-6 0 3 3 0 016 0z'/><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 3l18 18'/></svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-1 gap-4'>
            <div>
              <label className='text-sm block mb-1'>Role</label>
              <select value={role} onChange={e => setRole(e.target.value)} className='w-full border px-3 py-2 rounded' required>
                <option value='' disabled>Select role</option>
                <option value='donor'>donor</option>
                <option value='ngo'>ngo</option>
                <option value='driver'>driver</option>
              </select>
            </div>
          </div>

          {role === 'donor' && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='text-sm block mb-1'>Donor Type</label>
                <select value={donorType} onChange={e => setDonorType(e.target.value)} className='w-full border px-3 py-2 rounded' required>
                  <option value='' disabled>Select donor type</option>
                  <option value='Individual'>Individual</option>
                  <option value='Corporate'>Corporate</option>
                  <option value='Restaurant'>Restaurant</option>
                  <option value='Organization'>Organization</option>
                </select>
              </div>
              <div>
                <label className='text-sm block mb-1'>Contact Number</label>
                <input value={contactNumber} onChange={e => setContactNumber(e.target.value)} className='w-full border px-3 py-2 rounded' />
              </div>
            </div>
          )}

          {role === 'ngo' && (
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <label className='text-sm block mb-1'>Organization Name</label>
                <input value={organizationName} onChange={e => setOrganizationName(e.target.value)} className='w-full border px-3 py-2 rounded' />
              </div>
              <div>
                <label className='text-sm block mb-1'>Registration Number</label>
                <input value={registrationNumber} onChange={e => setRegistrationNumber(e.target.value)} className='w-full border px-3 py-2 rounded' />
              </div>
              <div>
                <label className='text-sm block mb-1'>Contact Number</label>
                <input value={contactNumber} onChange={e => setContactNumber(e.target.value)} className='w-full border px-3 py-2 rounded' />
              </div>
            </div>
          )}

          {role === 'driver' && (
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <label className='text-sm block mb-1'>Vehicle Type</label>
                <input value={vehicleType} onChange={e => setVehicleType(e.target.value)} className='w-full border px-3 py-2 rounded' />
              </div>
              <div>
                <label className='text-sm block mb-1'>License Number</label>
                <input value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} className='w-full border px-3 py-2 rounded' />
              </div>
              <div>
                <label className='text-sm block mb-1'>Contact Number</label>
                <input value={contactNumber} onChange={e => setContactNumber(e.target.value)} className='w-full border px-3 py-2 rounded' />
              </div>
            </div>
          )}

          <div>
            <label className='text-sm block mb-1'>Notes (optional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} className='w-full border px-3 py-2 rounded' rows={4} />
          </div>

          <div className='flex justify-end'>
            <button type='submit' className='px-6 py-2 rounded bg-[#317873] text-white font-semibold'>Submit Application</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Apply
