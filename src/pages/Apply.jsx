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
  const [members, setMembers] = useState([{ name: '', contact: '' }])
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [vehicleType, setVehicleType] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [serverErrors, setServerErrors] = useState([])

  useEffect(() => { console.log('[Apply] mounted') }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
  setServerErrors([])

    if (!name || !email || !username || !password || !confirmPassword || !role) {
      setError('Please fill Name, Email, Username, Password, Confirm Password and select a Role.')
      return
    }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }

    const r = (role || '').toString().toLowerCase()
  if (r === 'donor' && (!donorType || !contactNumber)) { setError('Donor: please select donor type and provide contact number'); return }
    if (r === 'ngo' && (!organizationName || !registrationNumber || !contactNumber)) { setError('NGO: please provide organization name, registration number and contact number'); return }
  if (r === 'driver' && (!vehicleType || !licenseNumber || !contactNumber || !vehicleNumber)) { setError('Driver: please provide vehicle type, vehicle number, license number and contact number'); return }

  const raw = { name, email, username, password, role, notes, status: 'pending', nic, address, city }
  if (r === 'donor') { raw.donorType = donorType; raw.contact = contactNumber }
    if (r === 'ngo') { raw.organizationName = organizationName; raw.registrationNumber = registrationNumber; raw.contact = contactNumber }
    // include members if any provided
    if (r === 'ngo' && Array.isArray(members) && members.length > 0) {
      // filter out empty entries
      const cleaned = members.map(m => ({ name: (m.name || '').trim(), contact: (m.contact || '').trim() })).filter(m => m.name || m.contact)
      if (cleaned.length > 0) raw.members = cleaned
    }
  if (r === 'driver') { raw.vehicleType = vehicleType; raw.vehicleNumber = vehicleNumber; raw.licenseNumber = licenseNumber; raw.contact = contactNumber }

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
      setName(''); setEmail(''); setUsername(''); setPassword(''); setConfirmPassword(''); setRole(''); setContactNumber(''); setDonorType(''); setOrganizationName(''); setRegistrationNumber(''); setVehicleType(''); setLicenseNumber(''); setNotes(''); setNic(''); setAddress(''); setCity(''); setMembers([{ name: '', contact: '' }])
        return
      }
      // if backend returned structured validation errors, show them as a list for the user
      if (data && Array.isArray(data.errors) && data.errors.length > 0) {
        setServerErrors(data.errors)
        setError(data.message || `Submission failed (status ${res.status})`)
      } else {
        setError((data && (data.message || data.error)) || `Submission failed (status ${res.status})`)
      }
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
        {serverErrors && serverErrors.length > 0 && (
          <div className='mb-4 text-sm text-red-700 bg-red-50 px-4 py-2 rounded'>
            <strong className='block mb-1'>Validation details:</strong>
            <ul className='list-disc list-inside space-y-1'>
              {serverErrors.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        )}

        {success ? (
          <div className='py-12 flex flex-col items-center justify-center'>
            <div className='w-full max-w-xl text-center bg-green-50 border border-green-100 rounded-lg p-8'>
              <svg xmlns='http://www.w3.org/2000/svg' className='mx-auto mb-4 h-12 w-12 text-green-600' viewBox='0 0 20 20' fill='currentColor'>
                <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
              </svg>
              <h3 className='text-xl font-semibold text-green-800 mb-2'>{success}</h3>
              <p className='text-sm text-gray-700 mb-6'>Thanks for applying. We'll review your application and contact you at the email provided.</p>
              <div className='flex items-center justify-center gap-4'>
                <button onClick={() => navigate('/')} className='inline-flex items-center gap-2 px-4 py-2 rounded bg-white border text-gray-700 hover:bg-gray-50'>
                  <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4' viewBox='0 0 20 20' fill='currentColor'>
                    <path fillRule='evenodd' d='M7.707 14.707a1 1 0 01-1.414 0L2.586 11l3.707-3.707a1 1 0 011.414 1.414L5.414 11l2.293 2.293a1 1 0 010 1.414z' clipRule='evenodd' />
                  </svg>
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='text-sm block mb-1'>Full name</label>
              <input placeholder='e.g. Jane Doe' value={name} onChange={e => setName(e.target.value)} className='w-full border px-3 py-2 rounded' required />
            </div>
            <div>
              <label className='text-sm block mb-1'>Email</label>
              <input placeholder='e.g. jane@example.org' value={email} onChange={e => setEmail(e.target.value)} type='email' className='w-full border px-3 py-2 rounded' required />
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label className='text-sm block mb-1'>NIC</label>
              <input placeholder='e.g. 891234567V' value={nic} onChange={e => setNic(e.target.value)} className='w-full border px-3 py-2 rounded' />
            </div>
            <div>
              <label className='text-sm block mb-1'>City</label>
              <input placeholder='e.g. Colombo' value={city} onChange={e => setCity(e.target.value)} className='w-full border px-3 py-2 rounded' />
            </div>
            <div>
              <label className='text-sm block mb-1'>Address</label>
              <input placeholder='e.g. 123 Galle Rd' value={address} onChange={e => setAddress(e.target.value)} className='w-full border px-3 py-2 rounded' />
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label className='text-sm block mb-1'>Username</label>
              <input placeholder='desired username' value={username} onChange={e => setUsername(e.target.value)} className='w-full border px-3 py-2 rounded' required />
            </div>
            <div>
              <label className='text-sm block mb-1'>Password</label>
              <div className='flex items-center border rounded-md px-3 py-2'>
                <input placeholder='Choose a strong password' value={password} onChange={e => setPassword(e.target.value)} type={showPassword ? 'text' : 'password'} className='w-full outline-none' required />
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
                <input placeholder='Re-type your password' value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} type={showConfirm ? 'text' : 'password'} className='w-full outline-none' required />
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
                <input placeholder='e.g. +94 77 123 4567' value={contactNumber} onChange={e => setContactNumber(e.target.value)} className='w-full border px-3 py-2 rounded' required={role === 'donor'} />
              </div>
            </div>
          )}

          {role === 'ngo' && (
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <label className='text-sm block mb-1'>Organization Name</label>
                <input placeholder='e.g. Helping Hands' value={organizationName} onChange={e => setOrganizationName(e.target.value)} className='w-full border px-3 py-2 rounded' required={role === 'ngo'} />
              </div>
              <div>
                <label className='text-sm block mb-1'>Registration Number</label>
                <input placeholder='e.g. REG-2023-001' value={registrationNumber} onChange={e => setRegistrationNumber(e.target.value)} className='w-full border px-3 py-2 rounded' required={role === 'ngo'} />
              </div>
              <div>
                <label className='text-sm block mb-1'>Contact Number</label>
                <input placeholder='e.g. +94 71 234 5678' value={contactNumber} onChange={e => setContactNumber(e.target.value)} className='w-full border px-3 py-2 rounded' required={role === 'ngo'} />
              </div>
            </div>
          )}

          {role === 'ngo' && (
            <div className='mt-4'>
              <label className='text-sm block mb-2 font-medium'>Organization Members (optional)</label>
              <div className='space-y-3'>
                {members.map((m, idx) => (
                  <div key={idx} className='grid grid-cols-3 gap-3 items-end'>
                    <div>
                      <label className='text-xs block mb-1'>Member name</label>
                      <input value={m.name} onChange={e => {
                        const copy = [...members]; copy[idx] = { ...copy[idx], name: e.target.value }; setMembers(copy)
                      }} className='w-full border px-3 py-2 rounded' placeholder='Full name' />
                    </div>
                    <div>
                      <label className='text-xs block mb-1'>Contact</label>
                      <input value={m.contact} onChange={e => {
                        const copy = [...members]; copy[idx] = { ...copy[idx], contact: e.target.value }; setMembers(copy)
                      }} className='w-full border px-3 py-2 rounded' placeholder='Phone or email' />
                    </div>
                    <div className='flex gap-2'>
                      <button type='button' onClick={() => {
                        const copy = [...members]; copy.splice(idx, 1); setMembers(copy.length ? copy : [{ name: '', contact: '' }])
                      }} className='px-3 py-2 bg-red-100 text-red-700 rounded'>Remove</button>
                      {idx === members.length - 1 && (
                        <button type='button' onClick={() => setMembers([...members, { name: '', contact: '' }])} className='px-3 py-2 bg-green-100 text-green-700 rounded'>Add</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {role === 'driver' && (
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <label className='text-sm block mb-1'>Vehicle Type</label>
                <input placeholder='e.g. Van, Motorcycle' value={vehicleType} onChange={e => setVehicleType(e.target.value)} className='w-full border px-3 py-2 rounded' required={role === 'driver'} />
              </div>
              <div>
                <label className='text-sm block mb-1'>Vehicle Number</label>
                <input placeholder='e.g. ABC-1234' value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value)} className='w-full border px-3 py-2 rounded' required={role === 'driver'} />
              </div>
              <div>
                <label className='text-sm block mb-1'>License Number</label>
                <input placeholder='e.g. L-123456' value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} className='w-full border px-3 py-2 rounded' required={role === 'driver'} />
              </div>
              <div>
                <label className='text-sm block mb-1'>Contact Number</label>
                <input placeholder='e.g. +94 77 345 6789' value={contactNumber} onChange={e => setContactNumber(e.target.value)} className='w-full border px-3 py-2 rounded' required={role === 'driver'} />
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
        )}
      </div>
    </div>
  )
}

export default Apply
