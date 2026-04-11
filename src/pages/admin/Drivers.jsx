import React, { useEffect, useMemo, useState } from 'react'
import axiosInstance from '../../api/axiosInstance'
import toast from 'react-hot-toast'
import { Edit3, Loader2, Plus, Search, Trash2, UserRound, X } from 'lucide-react'

const API_PATH = '/api/drivers'

const INITIAL_FORM = {
  name: '',
  licenseNumber: '',
  phone: '',
  vehicleType: '',
  status: 'Available',
}

const Drivers = () => {
  const [drivers, setDrivers] = useState([])
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState('')

  useEffect(() => {
    fetchDrivers()
  }, [])

  const getId = (driver) => driver?._id || driver?.id || driver?.driverId

  const getStatus = (driver) => {
    if (driver?.status) return String(driver.status)
    if (typeof driver?.isAvailable === 'boolean') {
      return driver.isAvailable ? 'Available' : 'On Delivery'
    }
    return 'Unknown'
  }

  const normalizeDriver = (driver) => ({
    ...driver,
    name: driver?.name || 'Unnamed Driver',
    licenseNumber: driver?.licenseNumber || driver?.plateNumber || 'Not specified',
    phone: driver?.phone || driver?.contact || '',
    vehicleType: driver?.vehicleType || 'Bike',
    status: getStatus(driver),
  })

  const statusBadgeClass = (status) => {
    const normalized = String(status || '').toLowerCase()
    if (normalized.includes('available')) return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    if (normalized.includes('delivery') || normalized.includes('transit')) {
      return 'bg-amber-100 text-amber-700 border-amber-200'
    }
    return 'bg-slate-100 text-slate-600 border-slate-200'
  }

  const filteredDrivers = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return drivers

    return drivers.filter((driver) => {
      return (
        String(driver?.name || '').toLowerCase().includes(term) ||
        String(driver?.licenseNumber || '').toLowerCase().includes(term) ||
        String(driver?.vehicleType || '').toLowerCase().includes(term) ||
        String(driver?.status || '').toLowerCase().includes(term)
      )
    })
  }, [drivers, search])

  const fetchDrivers = async () => {
    setLoading(true)
    try {
      const { data } = await axiosInstance.get(API_PATH)
      const list = Array.isArray(data) ? data : data?.data || []
      setDrivers(list.map(normalizeDriver))
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load drivers')
      setDrivers([])
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setFormData(INITIAL_FORM)
    setEditingId(null)
  }

  const openCreate = () => {
    resetForm()
    setModalOpen(true)
  }

  const openEdit = (driver) => {
    const id = getId(driver)
    if (!id) {
      toast.error('Unable to edit this driver')
      return
    }

    setEditingId(id)
    setFormData({
      name: driver?.name || '',
      licenseNumber: driver?.licenseNumber || '',
      phone: driver?.phone || '',
      vehicleType: driver?.vehicleType || 'Bike',
      status: driver?.status || 'Available',
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    if (saving) return
    setModalOpen(false)
    resetForm()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)

    const payload = {
      name: formData.name,
      licenseNumber: formData.licenseNumber,
      phone: formData.phone,
      vehicleType: formData.vehicleType,
      status: formData.status,
      isAvailable: formData.status === 'Available',
    }

    try {
      if (editingId) {
        await axiosInstance.put(`${API_PATH}/${editingId}`, payload)
        toast.success('Driver updated successfully')
      } else {
        await axiosInstance.post(API_PATH, payload)
        toast.success('Driver added successfully')
      }

      closeModal()
      await fetchDrivers()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save driver')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (driver) => {
    const id = getId(driver)
    if (!id) {
      toast.error('Unable to delete this driver')
      return
    }

    if (!window.confirm('Delete this driver?')) return

    setDeletingId(id)
    try {
      await axiosInstance.delete(`${API_PATH}/${id}`)
      toast.success('Driver deleted successfully')
      await fetchDrivers()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete driver')
    } finally {
      setDeletingId('')
    }
  }

  return (
    <div className='space-y-6'>
      <div className='rounded-2xl border border-emerald-100 bg-linear-to-r from-emerald-50 via-white to-slate-50 p-6 shadow-sm'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div>
            <h3 className='text-2xl font-bold text-[#0f3f3c]'>Driver Management</h3>
            <p className='text-slate-600'>Manage fleet records, vehicle assignment details, and driver availability.</p>
          </div>

          <button
            onClick={openCreate}
            className='inline-flex items-center gap-2 rounded-xl bg-[#317873] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#2b6a66]'
          >
            <Plus size={16} />
            Add New Driver
          </button>
        </div>
      </div>

      <div className='relative'>
        <Search size={16} className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' />
        <input
          type='text'
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder='Search by name, license number, vehicle, or status'
          className='w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100'
        />
      </div>

      <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-slate-200'>
            <thead className='bg-slate-50'>
              <tr>
                <th className='px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500'>Name</th>
                <th className='px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500'>License Number</th>
                <th className='px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500'>Vehicle Type</th>
                <th className='px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500'>Status</th>
                <th className='px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500'>Actions</th>
              </tr>
            </thead>

            <tbody className='divide-y divide-slate-100 bg-white'>
              {loading && (
                <tr>
                  <td colSpan={5} className='px-5 py-12 text-center text-sm text-slate-500'>
                    <span className='inline-flex items-center gap-2'>
                      <Loader2 size={16} className='animate-spin' />
                      Loading drivers...
                    </span>
                  </td>
                </tr>
              )}

              {!loading && filteredDrivers.length === 0 && (
                <tr>
                  <td colSpan={5} className='px-5 py-12 text-center'>
                    <div className='mx-auto flex max-w-sm flex-col items-center gap-2 text-slate-500'>
                      <UserRound size={22} className='text-slate-400' />
                      <p className='text-sm font-medium'>No drivers found</p>
                      <p className='text-xs text-slate-400'>Try adjusting your search terms or add a new driver.</p>
                    </div>
                  </td>
                </tr>
              )}

              {!loading &&
                filteredDrivers.map((driver) => {
                  const id = getId(driver)

                  return (
                    <tr key={id || `${driver?.licenseNumber}-${driver?.name}`} className='transition hover:bg-emerald-50/40'>
                      <td className='px-5 py-4 text-sm font-medium text-slate-800'>{driver?.name}</td>
                      <td className='px-5 py-4 text-sm text-slate-600'>{driver?.licenseNumber}</td>
                      <td className='px-5 py-4 text-sm text-slate-600'>{driver?.vehicleType}</td>
                      <td className='px-5 py-4 text-sm'>
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusBadgeClass(driver?.status)}`}>
                          {driver?.status}
                        </span>
                      </td>
                      <td className='px-5 py-4 text-right text-sm'>
                        <div className='inline-flex items-center gap-2'>
                          <button
                            onClick={() => openEdit(driver)}
                            className='inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700 transition hover:bg-emerald-100'
                          >
                            <Edit3 size={14} />
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(driver)}
                            disabled={deletingId === id}
                            className='inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60'
                          >
                            {deletingId === id ? <Loader2 size={14} className='animate-spin' /> : <Trash2 size={14} />}
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4 transition-all duration-200 ${
          modalOpen ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'
        }`}
        onClick={closeModal}
      >
        <div
          className={`w-full max-w-2xl rounded-2xl border border-white/70 bg-white p-6 shadow-2xl transition-all duration-300 ${
            modalOpen ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-8 scale-95 opacity-0'
          }`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className='mb-6 flex items-start justify-between'>
            <div>
              <h4 className='text-xl font-bold text-slate-900'>{editingId ? 'Edit Driver' : 'Add New Driver'}</h4>
              <p className='text-sm text-slate-500'>Maintain professional and accurate fleet information.</p>
            </div>

            <button
              onClick={closeModal}
              disabled={saving}
              className='rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700'
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div>
              <label className='mb-1 block text-sm font-medium text-slate-700'>Name</label>
              <input
                type='text'
                name='name'
                value={formData.name}
                onChange={handleChange}
                className='w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100'
                required
              />
            </div>

            <div>
              <label className='mb-1 block text-sm font-medium text-slate-700'>License Number</label>
              <input
                type='text'
                name='licenseNumber'
                value={formData.licenseNumber}
                onChange={handleChange}
                className='w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100'
                required
              />
            </div>

            <div>
              <label className='mb-1 block text-sm font-medium text-slate-700'>Phone Number</label>
              <input
                type='text'
                name='phone'
                value={formData.phone}
                onChange={handleChange}
                className='w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100'
                required
              />
            </div>

            <div>
              <label className='mb-1 block text-sm font-medium text-slate-700'>Vehicle Type</label>
              <select
                name='vehicleType'
                value={formData.vehicleType}
                onChange={handleChange}
                className='w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100'
                required
              >
                <option value=''>Select vehicle type</option>
                <option value='Bike'>Bike</option>
                <option value='Van'>Van</option>
                <option value='Truck'>Truck</option>
              </select>
            </div>

            <div className='md:col-span-2'>
              <label className='mb-1 block text-sm font-medium text-slate-700'>Status</label>
              <select
                name='status'
                value={formData.status}
                onChange={handleChange}
                className='w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100'
              >
                <option value='Available'>Available</option>
                <option value='On Delivery'>On Delivery</option>
              </select>
            </div>

            <div className='mt-2 flex items-center justify-end gap-3 md:col-span-2'>
              <button
                type='button'
                onClick={closeModal}
                className='rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50'
              >
                Cancel
              </button>

              <button
                type='submit'
                disabled={saving}
                className='inline-flex items-center gap-2 rounded-xl bg-[#317873] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2a6965] disabled:cursor-not-allowed disabled:opacity-65'
              >
                {saving && <Loader2 size={15} className='animate-spin' />}
                {saving ? 'Saving...' : editingId ? 'Update Driver' : 'Create Driver'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Drivers
