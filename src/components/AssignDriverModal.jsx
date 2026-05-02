import { useCallback, useEffect, useState } from 'react'
import {
  CheckCircle2,
  Loader2,
  Truck,
  User,
  X,
} from 'lucide-react'
import axiosInstance from '../api/axiosInstance'
import { updateDonationForm } from '../api'
import toast from 'react-hot-toast'

/**
 * AssignDriverModal
 *
 * Props:
 *   isOpen        – boolean
 *   onClose       – () => void
 *   sourceType    – 'donation' | 'request'
 *   sourceData    – the donation object or NGO request object
 *   onAssigned    – () => void   (called after successful assignment so parent can reload)
 */
export default function AssignDriverModal({
  isOpen,
  onClose,
  sourceType,
  sourceData,
  onAssigned,
}) {
  const [drivers, setDrivers] = useState([])
  const [loadingDrivers, setLoadingDrivers] = useState(false)
  const [selectedDriverId, setSelectedDriverId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  /* ---- Fetch available drivers ---------------------------------- */
  const fetchDrivers = useCallback(async () => {
    setLoadingDrivers(true)
    try {
      const { data } = await axiosInstance.get('/api/drivers')
      const list = Array.isArray(data) ? data : data?.data || []
      // Only show available drivers
      setDrivers(list.filter((d) => d.isAvailable !== false))
    } catch {
      setDrivers([])
    } finally {
      setLoadingDrivers(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      setSelectedDriverId('')
      fetchDrivers()
    }
  }, [isOpen, fetchDrivers])

  /* ---- Build delivery payload from donation --------------------- */
  function buildDonationPayload(donation) {
    const items = (donation?.items || []).map((item) => ({
      name: item?.productId || item?.name || 'Donation Item',
      qty: Number(item?.quantity || item?.qty || 1),
      unit: item?.unit || 'pack',
    }))

    // Ensure at least one item so validation passes
    if (items.length === 0) {
      items.push({ name: 'Donation items', qty: 1, unit: 'pack' })
    }

    return {
      deliverType: 'pickup',
      donationId: donation?.donationFormId || donation?._id || '',
      pickup: {
        address: donation?.address || donation?.pickupAddress || 'Pickup address (to be confirmed)',
        contactName: donation?.donorName || '',
        contactPhone: donation?.contact || '',
      },
      items,
      notes: `Auto-created from donation ${donation?.donationFormId || donation?._id}`,
    }
  }

  /* ---- Build delivery payload from NGO request ------------------ */
  function buildRequestPayload(request) {
    const items = (request?.requestedItems || []).map((item) => ({
      name: item?.itemName || item?.name || 'Requested Item',
      qty: Number(item?.quantity || item?.qty || 1),
      unit: item?.unit || 'pack',
    }))

    if (items.length === 0) {
      items.push({ name: 'Requested items', qty: 1, unit: 'pack' })
    }

    return {
      deliverType: 'drop',
      ngoId: request?.ngoId?._id || request?.ngoId || request?._id || '',
      drop: {
        address: request?.location?.address || request?.address || 'Drop address (to be confirmed)',
        contactName: request?.organizationName || '',
        contactPhone: request?.contactPhone || '',
      },
      items,
      notes: `Auto-created from NGO request ${request?.requestId || request?._id}`,
    }
  }

  /* ---- Submit: create delivery + assign driver ------------------ */
  const handleAssign = async () => {
    if (!selectedDriverId) {
      toast.error('Please select a driver')
      return
    }

    setSubmitting(true)
    try {
      // Step 1: Build the delivery payload based on source type
      const payload =
        sourceType === 'donation'
          ? buildDonationPayload(sourceData)
          : buildRequestPayload(sourceData)

      // Step 2: Create the delivery record
      const createRes = await axiosInstance.post('/api/deliveries', payload)
      const delivery = createRes.data

      const deliveryId = delivery?._id || delivery?.id
      if (!deliveryId) {
        throw new Error('Delivery created but no ID returned')
      }

      // Step 3: Assign the selected driver
      await axiosInstance.put(`/api/deliveries/${deliveryId}/assign`, {
        driverId: selectedDriverId,
      })

      // Step 4: Update source status
      if (sourceType === 'donation' && sourceData?._id) {
        // Mark donation as Received (enters inventory pipeline)
        await updateDonationForm(sourceData._id, { Status: 'Received' }).catch(() => {})
      }

      if (sourceType === 'request' && sourceData?._id) {
        // Mark request as APPROVED
        await axiosInstance
          .put(`/api/requests/${sourceData._id}`, { status: 'APPROVED' })
          .catch(() => {})
      }

      toast.success('Driver assigned successfully!')
      onClose()
      onAssigned?.()
    } catch (error) {
      const msg =
        error?.response?.data?.errors?.[0]?.msg ||
        error?.response?.data?.message ||
        error?.message ||
        'Failed to assign driver'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  /* ---- Derive display info for the header ----------------------- */
  const title =
    sourceType === 'donation'
      ? `Assign Driver — Donation ${sourceData?.donationFormId || sourceData?._id?.slice(-6) || ''}`
      : `Assign Driver — Request ${sourceData?.requestId || sourceData?._id?.slice(-6) || ''}`

  const subtitle =
    sourceType === 'donation'
      ? `${sourceData?.items?.length || 0} item(s) to pick up`
      : `${sourceData?.organizationName || 'NGO'} — ${sourceData?.requestedItems?.length || 0} item(s) to deliver`

  /* ---- Render --------------------------------------------------- */
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4 transition-all duration-200 ${
        isOpen ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'
      }`}
      onClick={() => !submitting && onClose()}
    >
      <div
        className={`w-full max-w-lg rounded-3xl border border-white/80 bg-white p-6 shadow-2xl transition-all duration-300 ${
          isOpen
            ? 'translate-y-0 scale-100 opacity-100'
            : 'translate-y-8 scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='mb-5 flex items-start justify-between'>
          <div>
            <h2 className='text-xl font-bold text-teal-900'>{title}</h2>
            <p className='mt-1 text-sm text-slate-500'>{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className='rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700'
          >
            <X size={18} />
          </button>
        </div>

        {/* Driver list */}
        <div className='mb-5'>
          <p className='mb-3 text-sm font-semibold text-slate-700'>
            Select an available driver
          </p>

          {loadingDrivers && (
            <div className='flex items-center justify-center gap-2 py-8 text-sm text-slate-500'>
              <Loader2 size={16} className='animate-spin' />
              Loading drivers...
            </div>
          )}

          {!loadingDrivers && drivers.length === 0 && (
            <div className='rounded-2xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500'>
              <User className='mx-auto mb-2 text-slate-400' size={24} />
              No available drivers found.
              <br />
              <span className='text-xs text-slate-400'>
                All drivers may be on delivery.
              </span>
            </div>
          )}

          {!loadingDrivers && drivers.length > 0 && (
            <div className='max-h-64 space-y-2 overflow-y-auto pr-1'>
              {drivers.map((driver) => {
                const id = driver?._id || driver?.id
                const isSelected = selectedDriverId === id

                return (
                  <button
                    key={id}
                    onClick={() => setSelectedDriverId(id)}
                    className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all duration-200 ${
                      isSelected
                        ? 'border-teal-500 bg-teal-300/15 text-teal-950 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-300/10'
                    }`}
                  >
                    <div className='flex items-center gap-3'>
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold ${
                          isSelected
                            ? 'bg-teal-700 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {(driver?.name || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className='text-sm font-semibold'>{driver?.name}</p>
                        <p className='text-xs text-slate-500'>
                          {driver?.vehicleType || 'Vehicle N/A'} · {driver?.phone || 'No phone'}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center gap-2'>
                      <span className='rounded-full border border-teal-300 bg-teal-300/30 px-2.5 py-0.5 text-xs font-semibold text-teal-900'>
                        Available
                      </span>
                      {isSelected && <CheckCircle2 size={18} className='text-teal-700' />}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className='flex items-center justify-end gap-3'>
          <button
            onClick={onClose}
            disabled={submitting}
            className='rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50'
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={submitting || !selectedDriverId}
            className='inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60'
          >
            {submitting ? (
              <>
                <Loader2 size={15} className='animate-spin' />
                Assigning...
              </>
            ) : (
              <>
                <Truck size={15} />
                Assign Driver
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
