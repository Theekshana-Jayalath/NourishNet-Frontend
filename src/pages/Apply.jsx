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
    if (r === 'ngo' && Array.isArray(members) && members.length > 0) {
      const cleaned = members.map(m => ({ name: (m.name || '').trim(), contact: (m.contact || '').trim() })).filter(m => m.name || m.contact)
      if (cleaned.length > 0) raw.members = cleaned
    }
    if (r === 'driver') { raw.vehicleType = vehicleType; raw.vehicleNumber = vehicleNumber; raw.licenseNumber = licenseNumber; raw.contact = contactNumber }

    const payload = Object.entries(raw).reduce((acc, [k, v]) => { if (v !== undefined && v !== null && v !== '') acc[k] = v; return acc }, {})

    try {
      const base = import.meta.env.VITE_API_URL
      const url = base ? `${base}/api/applications` : '/api/applications'
      const fetchOptions = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
      const res = await fetch(url, fetchOptions)
      const data = await res.json().catch(() => null)
      if (res.status === 201) {
        setSuccess('Application submitted successfully')
        setName(''); setEmail(''); setUsername(''); setPassword(''); setConfirmPassword(''); setRole(''); setContactNumber(''); setDonorType(''); setOrganizationName(''); setRegistrationNumber(''); setVehicleType(''); setLicenseNumber(''); setNotes(''); setNic(''); setAddress(''); setCity(''); setMembers([{ name: '', contact: '' }])
        return
      }
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
    <div className='min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-200 flex items-center justify-center py-12 px-4'>
      <div className='w-full max-w-4xl mx-auto'>
        <div className='bg-white rounded-2xl shadow-xl p-8'>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h2 className='text-2xl font-bold text-[#004b49]'>Create an application</h2>
              <p className='text-sm text-gray-500'>Apply as a Donor, NGO or Driver — fields adapt to your selection.</p>
            </div>
          </div>

          {error && <div className='mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-100'>{error}</div>}
          {serverErrors && serverErrors.length > 0 && (
            <div className='mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-100'>
              <strong className='block mb-2'>Validation details:</strong>
              <ul className='list-disc list-inside space-y-1'>
                {serverErrors.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}

          {success ? (
            <div className='py-8 text-center'>
              <div className='mx-auto mb-4 w-20 h-20 rounded-full bg-green-50 flex items-center justify-center text-green-700 text-3xl'>✓</div>
              <h3 className='text-xl font-semibold text-green-800 mb-2'>{success}</h3>
              <p className='text-sm text-gray-600 mb-6'>Thanks for applying. We'll contact you at the email provided.</p>
              <div className='flex justify-center gap-3'>
                <button onClick={() => navigate('/')} className='px-4 py-2 rounded-md bg-white border text-gray-700'>Back to Home</button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className='space-y-5'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-600 mb-1'>Full name</label>
                  <input placeholder='Jane Doe' value={name} onChange={e => setName(e.target.value)} className='w-full bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#66ada4] placeholder-gray-400' required />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-600 mb-1'>Email</label>
                  <input placeholder='jane@example.org' value={email} onChange={e => setEmail(e.target.value)} type='email' className='w-full bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#66ada4] placeholder-gray-400' required />
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-600 mb-1'>NIC</label>
                  <input placeholder='891234567V' value={nic} onChange={e => setNic(e.target.value)} className='w-full bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm focus:outline-none placeholder-gray-400' />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-600 mb-1'>City</label>
                  <input placeholder='Colombo' value={city} onChange={e => setCity(e.target.value)} className='w-full bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm focus:outline-none placeholder-gray-400' />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-600 mb-1'>Address</label>
                  <input placeholder='123 Galle Rd' value={address} onChange={e => setAddress(e.target.value)} className='w-full bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm focus:outline-none placeholder-gray-400' />
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-600 mb-1'>Username</label>
                  <input placeholder='desired username' value={username} onChange={e => setUsername(e.target.value)} className='w-full bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm focus:outline-none placeholder-gray-400' required />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-600 mb-1'>Password</label>
                  <div className='relative'>
                    <input placeholder='Choose a strong password' value={password} onChange={e => setPassword(e.target.value)} type={showPassword ? 'text' : 'password'} className='w-full bg-white border border-gray-200 rounded-lg px-4 py-2 pr-12 shadow-sm focus:outline-none placeholder-gray-400' required />
                    <button type='button' onClick={() => setShowPassword(s => !s)} className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500' aria-label='Toggle password visibility'>
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-600 mb-1'>Confirm Password</label>
                  <div className='relative'>
                    <input placeholder='Re-type your password' value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} type={showConfirm ? 'text' : 'password'} className='w-full bg-white border border-gray-200 rounded-lg px-4 py-2 pr-12 shadow-sm focus:outline-none placeholder-gray-400' required />
                    <button type='button' onClick={() => setShowConfirm(s => !s)} className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500' aria-label='Toggle confirm password visibility'>
                      {showConfirm ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-600 mb-2'>Role</label>
                <div className='flex gap-3'>
                  <button type='button' onClick={() => setRole('donor')} className={`px-4 py-2 rounded-lg ${role==='donor' ? 'bg-linear-to-r from-yellow-400 to-yellow-600 text-white shadow' : 'bg-yellow-50 text-yellow-700'}`}>Donor</button>
                  <button type='button' onClick={() => setRole('ngo')} className={`px-4 py-2 rounded-lg ${role==='ngo' ? 'bg-linear-to-r from-indigo-500 to-purple-600 text-white shadow' : 'bg-indigo-50 text-indigo-700'}`}>NGO</button>
                  <button type='button' onClick={() => setRole('driver')} className={`px-4 py-2 rounded-lg ${role==='driver' ? 'bg-linear-to-r from-emerald-500 to-teal-600 text-white shadow' : 'bg-emerald-50 text-emerald-700'}`}>Driver</button>
                </div>
              </div>

              {role === 'donor' && (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-600 mb-1'>Donor Type</label>
                    <select value={donorType} onChange={e => setDonorType(e.target.value)} className='w-full bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm placeholder-gray-400' required>
                      <option value='' disabled>Select donor type</option>
                      <option value='Individual'>Individual</option>
                      <option value='Corporate'>Corporate</option>
                      <option value='Restaurant'>Restaurant</option>
                      <option value='Organization'>Organization</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-600 mb-1'>Contact Number</label>
                    <input placeholder='+94 77 123 4567' value={contactNumber} onChange={e => setContactNumber(e.target.value)} className='w-full bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm placeholder-gray-400' required={role === 'donor'} />
                  </div>
                </div>
              )}

              {role === 'ngo' && (
                <>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-600 mb-1'>Organization Name</label>
                      <input placeholder='Helping Hands' value={organizationName} onChange={e => setOrganizationName(e.target.value)} className='w-full bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm placeholder-gray-400' required={role === 'ngo'} />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-600 mb-1'>Registration Number</label>
                      <input placeholder='REG-2023-001' value={registrationNumber} onChange={e => setRegistrationNumber(e.target.value)} className='w-full bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm placeholder-gray-400' required={role === 'ngo'} />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-600 mb-1'>Contact Number</label>
                      <input placeholder='+94 71 234 5678' value={contactNumber} onChange={e => setContactNumber(e.target.value)} className='w-full bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm placeholder-gray-400' required={role === 'ngo'} />
                    </div>
                  </div>

                  <div className='mt-4'>
                    <label className='block text-sm font-medium text-gray-600 mb-2'>Organization Members (optional)</label>
                    <div className='space-y-3'>
                      {members.map((m, idx) => (
                        <div key={idx} className='grid grid-cols-3 gap-3 items-end'>
                          <div>
                            <label className='text-xs block mb-1'>Member name</label>
                            <input value={m.name} onChange={e => {
                              const copy = [...members]; copy[idx] = { ...copy[idx], name: e.target.value }; setMembers(copy)
                            }} className='w-full bg-white border border-gray-200 rounded-lg px-3 py-2 placeholder-gray-400' placeholder='Full name' />
                          </div>
                          <div>
                            <label className='text-xs block mb-1'>Contact</label>
                            <input value={m.contact} onChange={e => {
                              const copy = [...members]; copy[idx] = { ...copy[idx], contact: e.target.value }; setMembers(copy)
                            }} className='w-full bg-white border border-gray-200 rounded-lg px-3 py-2 placeholder-gray-400' placeholder='Phone or email' />
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
                </>
              )}

              {role === 'driver' && (
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-600 mb-1'>Vehicle Type</label>
                    <input placeholder='Van, Motorcycle' value={vehicleType} onChange={e => setVehicleType(e.target.value)} className='w-full bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm placeholder-gray-400' required={role === 'driver'} />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-600 mb-1'>Vehicle Number</label>
                    <input placeholder='ABC-1234' value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value)} className='w-full bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm placeholder-gray-400' required={role === 'driver'} />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-600 mb-1'>License Number</label>
                    <input placeholder='L-123456' value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} className='w-full bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm placeholder-gray-400' required={role === 'driver'} />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-600 mb-1'>Contact Number</label>
                    <input placeholder='+94 77 345 6789' value={contactNumber} onChange={e => setContactNumber(e.target.value)} className='w-full bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm placeholder-gray-400' required={role === 'driver'} />
                  </div>
                </div>
              )}

              <div>
                <label className='block text-sm font-medium text-gray-600 mb-1'>Notes (optional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} className='w-full bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm placeholder-gray-400' rows={4} />
              </div>

              <div className='flex items-center justify-between'>
                <div className='text-sm text-gray-500'>By submitting you agree to our terms.</div>
                <div className='flex items-center gap-3'>
                  <button type='button' onClick={() => { /* keep form values */ navigate('/', { replace: true }) }} className='px-4 py-2 rounded-md bg-white border text-gray-700'>Cancel</button>
                  <button type='submit' className='px-6 py-2 rounded-md bg-linear-to-r from-[#317873] to-[#66ada4] text-white font-semibold shadow'>Submit Application</button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default Apply
