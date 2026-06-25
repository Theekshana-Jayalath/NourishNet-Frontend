import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BASE_URL } from '../api'

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
      const url = `${BASE_URL}/applications`
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

  const roleOptions = [
    { id: 'donor', name: 'Donor', icon: '🤝', color: 'amber', gradient: 'from-amber-500 to-orange-600', bgLight: 'bg-amber-50', textLight: 'text-amber-700' },
    { id: 'ngo', name: 'NGO', icon: '🌱', color: 'indigo', gradient: 'from-indigo-500 to-purple-600', bgLight: 'bg-indigo-50', textLight: 'text-indigo-700' },
    { id: 'driver', name: 'Driver', icon: '🚚', color: 'emerald', gradient: 'from-emerald-500 to-teal-600', bgLight: 'bg-emerald-50', textLight: 'text-emerald-700' }
  ]

  return (
    <div className='min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 py-12 px-4'>
      <div className='max-w-5xl mx-auto'>
        
        {/* Header Card */}
        <div className='bg-gradient-to-r from-teal-600 to-teal-800 rounded-2xl p-8 mb-8 shadow-xl'>
          <div className='flex items-center gap-4'>
            <div className='w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm'>
              <span className='text-3xl'>📝</span>
            </div>
            <div>
              <h1 className='text-3xl font-bold text-white'>Join NourishNet</h1>
              <p className='text-teal-100 mt-1'>Create an application to become a donor, NGO partner, or delivery driver</p>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className='bg-white rounded-2xl shadow-xl overflow-hidden'>
          <div className='p-8'>
            
            {/* Success State */}
            {success ? (
              <div className='py-12 text-center'>
                <div className='w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg'>
                  <svg className='w-12 h-12 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                  </svg>
                </div>
                <h3 className='text-2xl font-bold text-gray-800 mb-2'>Application Submitted!</h3>
                <p className='text-gray-500 mb-6'>Thank you for applying. We'll review your application and contact you soon.</p>
                <div className='flex justify-center gap-4'>
                  <button onClick={() => navigate('/')} className='px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold shadow-md hover:shadow-lg transition-all'>
                    Back to Home
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className='space-y-6'>
                
                {/* Error Messages */}
                {error && (
                  <div className='bg-red-50 border-l-4 border-red-500 p-4 rounded-lg'>
                    <div className='flex items-center gap-2'>
                      <svg className='w-5 h-5 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                      </svg>
                      <span className='text-red-700'>{error}</span>
                    </div>
                  </div>
                )}
                
                {serverErrors && serverErrors.length > 0 && (
                  <div className='bg-red-50 border-l-4 border-red-500 p-4 rounded-lg'>
                    <p className='font-semibold text-red-700 mb-2'>Please fix the following:</p>
                    <ul className='list-disc list-inside space-y-1'>
                      {serverErrors.map((s, i) => <li key={i} className='text-red-600 text-sm'>{s}</li>)}
                    </ul>
                  </div>
                )}

                {/* Personal Information Section */}
                <div>
                  <h3 className='text-lg font-semibold text-teal-800 mb-4 flex items-center gap-2'>
                    <span className='w-1 h-6 bg-teal-500 rounded-full'></span>
                    Personal Information
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>Full Name *</label>
                      <input 
                        placeholder='John Doe' 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all'
                        required 
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>Email Address *</label>
                      <input 
                        placeholder='john@example.com' 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        type='email' 
                        className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all'
                        required 
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>NIC / National ID</label>
                      <input 
                        placeholder='891234567V' 
                        value={nic} 
                        onChange={e => setNic(e.target.value)} 
                        className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>Username *</label>
                      <input 
                        placeholder='john_doe' 
                        value={username} 
                        onChange={e => setUsername(e.target.value)} 
                        className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all'
                        required 
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>City</label>
                      <input 
                        placeholder='Colombo' 
                        value={city} 
                        onChange={e => setCity(e.target.value)} 
                        className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>Address</label>
                      <input 
                        placeholder='123 Main Street' 
                        value={address} 
                        onChange={e => setAddress(e.target.value)} 
                        className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all'
                      />
                    </div>
                  </div>
                </div>

                {/* Password Section */}
                <div>
                  <h3 className='text-lg font-semibold text-teal-800 mb-4 flex items-center gap-2'>
                    <span className='w-1 h-6 bg-teal-500 rounded-full'></span>
                    Security
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>Password *</label>
                      <div className='relative'>
                        <input 
                          placeholder='Create a password' 
                          value={password} 
                          onChange={e => setPassword(e.target.value)} 
                          type={showPassword ? 'text' : 'password'} 
                          className='w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all'
                          required 
                        />
                        <button 
                          type='button' 
                          onClick={() => setShowPassword(!showPassword)} 
                          className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors'
                        >
                          {showPassword ? '🙈' : '👁️'}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>Confirm Password *</label>
                      <div className='relative'>
                        <input 
                          placeholder='Confirm your password' 
                          value={confirmPassword} 
                          onChange={e => setConfirmPassword(e.target.value)} 
                          type={showConfirm ? 'text' : 'password'} 
                          className='w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all'
                          required 
                        />
                        <button 
                          type='button' 
                          onClick={() => setShowConfirm(!showConfirm)} 
                          className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors'
                        >
                          {showConfirm ? '🙈' : '👁️'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Role Selection */}
                <div>
                  <h3 className='text-lg font-semibold text-teal-800 mb-4 flex items-center gap-2'>
                    <span className='w-1 h-6 bg-teal-500 rounded-full'></span>
                    Select Your Role
                  </h3>
                  <div className='grid grid-cols-3 gap-4'>
                    {roleOptions.map(opt => (
                      <button
                        key={opt.id}
                        type='button'
                        onClick={() => setRole(opt.id)}
                        className={`p-4 rounded-xl text-center transition-all transform hover:scale-105 ${
                          role === opt.id 
                            ? `bg-gradient-to-r ${opt.gradient} text-white shadow-lg`
                            : `${opt.bgLight} ${opt.textLight} border-2 border-transparent hover:border-${opt.color}-300`
                        }`}
                      >
                        <div className='text-3xl mb-2'>{opt.icon}</div>
                        <div className='font-semibold'>{opt.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Role-specific Fields */}
                {role === 'donor' && (
                  <div>
                    <h3 className='text-lg font-semibold text-teal-800 mb-4 flex items-center gap-2'>
                      <span className='w-1 h-6 bg-amber-500 rounded-full'></span>
                      Donor Details
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Donor Type *</label>
                        <select 
                          value={donorType} 
                          onChange={e => setDonorType(e.target.value)} 
                          className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500'
                          required
                        >
                          <option value='' disabled>Select donor type</option>
                          <option value='Individual'>Individual</option>
                          <option value='Corporate'>Corporate</option>
                          <option value='Restaurant'>Restaurant</option>
                          <option value='Organization'>Organization</option>
                        </select>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Contact Number *</label>
                        <input 
                          placeholder='+94 77 123 4567' 
                          value={contactNumber} 
                          onChange={e => setContactNumber(e.target.value)} 
                          className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500'
                          required 
                        />
                      </div>
                    </div>
                  </div>
                )}

                {role === 'ngo' && (
                  <div>
                    <h3 className='text-lg font-semibold text-teal-800 mb-4 flex items-center gap-2'>
                      <span className='w-1 h-6 bg-indigo-500 rounded-full'></span>
                      Organization Details
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Organization Name *</label>
                        <input 
                          placeholder='Helping Hands Foundation' 
                          value={organizationName} 
                          onChange={e => setOrganizationName(e.target.value)} 
                          className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500'
                          required 
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Registration Number *</label>
                        <input 
                          placeholder='REG-2023-001' 
                          value={registrationNumber} 
                          onChange={e => setRegistrationNumber(e.target.value)} 
                          className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500'
                          required 
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Contact Number *</label>
                        <input 
                          placeholder='+94 71 234 5678' 
                          value={contactNumber} 
                          onChange={e => setContactNumber(e.target.value)} 
                          className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500'
                          required 
                        />
                      </div>
                    </div>

                    {/* Team Members Section */}
                    <div className='mt-5'>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>Team Members (Optional)</label>
                      <div className='space-y-3'>
                        {members.map((m, idx) => (
                          <div key={idx} className='grid grid-cols-1 md:grid-cols-3 gap-3 items-end'>
                            <div>
                              <input 
                                value={m.name} 
                                onChange={e => {
                                  const copy = [...members]; 
                                  copy[idx] = { ...copy[idx], name: e.target.value }; 
                                  setMembers(copy)
                                }} 
                                className='w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500'
                                placeholder='Full name' 
                              />
                            </div>
                            <div>
                              <input 
                                value={m.contact} 
                                onChange={e => {
                                  const copy = [...members]; 
                                  copy[idx] = { ...copy[idx], contact: e.target.value }; 
                                  setMembers(copy)
                                }} 
                                className='w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500'
                                placeholder='Phone or email' 
                              />
                            </div>
                            <div className='flex gap-2'>
                              <button 
                                type='button' 
                                onClick={() => {
                                  const copy = [...members]; 
                                  copy.splice(idx, 1); 
                                  setMembers(copy.length ? copy : [{ name: '', contact: '' }])
                                }} 
                                className='px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors'
                              >
                                Remove
                              </button>
                              {idx === members.length - 1 && (
                                <button 
                                  type='button' 
                                  onClick={() => setMembers([...members, { name: '', contact: '' }])} 
                                  className='px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors'
                                >
                                  Add Member
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {role === 'driver' && (
                  <div>
                    <h3 className='text-lg font-semibold text-teal-800 mb-4 flex items-center gap-2'>
                      <span className='w-1 h-6 bg-emerald-500 rounded-full'></span>
                      Driver & Vehicle Details
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Vehicle Type *</label>
                        <input 
                          placeholder='Van, Motorcycle, Truck' 
                          value={vehicleType} 
                          onChange={e => setVehicleType(e.target.value)} 
                          className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500'
                          required 
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Vehicle Number *</label>
                        <input 
                          placeholder='ABC-1234' 
                          value={vehicleNumber} 
                          onChange={e => setVehicleNumber(e.target.value)} 
                          className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500'
                          required 
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>License Number *</label>
                        <input 
                          placeholder='L-123456' 
                          value={licenseNumber} 
                          onChange={e => setLicenseNumber(e.target.value)} 
                          className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500'
                          required 
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Contact Number *</label>
                        <input 
                          placeholder='+94 77 345 6789' 
                          value={contactNumber} 
                          onChange={e => setContactNumber(e.target.value)} 
                          className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500'
                          required 
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes Section */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Additional Notes (Optional)</label>
                  <textarea 
                    value={notes} 
                    onChange={e => setNotes(e.target.value)} 
                    rows={4}
                    placeholder='Any additional information you would like to share with us...'
                    className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all resize-none'
                  />
                </div>

                {/* Form Actions */}
                <div className='flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-100'>
                  <p className='text-sm text-gray-500'>By submitting, you agree to our Terms of Service and Privacy Policy.</p>
                  <div className='flex gap-3'>
                    <button 
                      type='button' 
                      onClick={() => navigate('/')} 
                      className='px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all'
                    >
                      Cancel
                    </button>
                    <button 
                      type='submit' 
                      className='px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105'
                    >
                      Submit Application
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Apply