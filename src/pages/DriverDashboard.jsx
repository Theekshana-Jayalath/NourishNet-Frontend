import { useCallback, useEffect, useMemo, useState } from 'react'
import axiosInstance from '../api/axiosInstance'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  Bike,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock4,
  History,
  PieChart,
  BarChart3,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Package,
  Search,
  Truck,
  UserRound,
  Van,
  X,
} from 'lucide-react'
import { Logo } from '../assets/assets'

const VEHICLES = ['Van', 'Truck', 'Bike']
const AVAILABLE_PICKUP_STATUSES = new Set(['ASSIGNED', 'CREATED', 'PENDING'])
const ACTIVE_STATUSES = new Set(['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'])
const HISTORY_STATUSES = new Set(['DELIVERED', 'CANCELLED'])

const STATUS_STYLES = {
  APPROVED: 'bg-sky-100 text-sky-700',
  ASSIGNED: 'bg-teal-300/30 text-teal-900',
  PICKED_UP: 'bg-teal-300/50 text-teal-900',
  IN_TRANSIT: 'bg-teal-500/20 text-teal-900',
  DELIVERED: 'bg-teal-300/30 text-teal-900',
  PENDING: 'bg-slate-100 text-slate-700',
  CANCELLED: 'bg-rose-100 text-rose-700',
}

function extractList(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data?.items)) return payload.data.items
  return []
}

function resolveUser() {
  try {
    return JSON.parse(localStorage.getItem('user')) || {}
  } catch {
    return {}
  }
}

function normalizePickup(item) {
  const firstItem = item?.items?.[0]
  const status = String(item?.status || item?.Status || '').toUpperCase() || 'APPROVED'

  return {
    id: item?._id || item?.id || item?.donationId,
    donationRef: item?.donationId || item?.donationFormId || item?._id,
    status,
    donorName: item?.donorName || item?.organizationName || item?.pickup?.contactName || 'Donation Pickup',
    address: item?.pickupAddress || item?.address || item?.pickup?.address || 'Address not provided',
    contact: item?.contact || item?.pickup?.contactPhone || item?.phone || 'N/A',
    itemCount: item?.items?.length || 0,
    itemPreview: firstItem?.name || firstItem?.productId || 'Food items',
    scheduledAt: item?.scheduledAt || item?.createdAt,
    raw: item,
  }
}

function normalizeDelivery(item) {
  const status = String(item?.status || item?.Status || '').toUpperCase()
  const deliverType = String(item?.deliverType || '').toLowerCase()
  const isDrop = deliverType === 'drop'

  return {
    id: item?._id || item?.id,
    donationRef: item?.donationId || item?.donationFormId || item?._id,
    status,
    deliverType,
    donorName:
      (isDrop ? item?.drop?.contactName : item?.pickup?.contactName) ||
      item?.donorName ||
      'Assigned Delivery',
    address:
      (isDrop ? item?.drop?.address : item?.pickup?.address) ||
      item?.address ||
      'Address not provided',
    contact:
      (isDrop ? item?.drop?.contactPhone : item?.pickup?.contactPhone) ||
      item?.contact ||
      'N/A',
    itemCount: item?.items?.length || 0,
    itemPreview: item?.items?.[0]?.name || (isDrop ? 'NGO request' : 'Donation items'),
    scheduledAt: item?.scheduledAt || item?.updatedAt,
    driverId: typeof item?.driverId === 'object' ? item?.driverId?._id : item?.driverId,
    raw: item,
  }
}

const DriverDashboard = () => {
  const [activeView, setActiveView] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pickups, setPickups] = useState([])
  const [deliveries, setDeliveries] = useState([])
  const [deliveryHistory, setDeliveryHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [selectedPickup, setSelectedPickup] = useState(null)
  const [selectedVehicle, setSelectedVehicle] = useState('Van')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [resolvedDriverId, setResolvedDriverId] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const user = useMemo(() => resolveUser(), [])
  const navigate = useNavigate()

  const driverId = user?._id || user?.id
  const driverName = user?.name || user?.username || 'Driver'
  const profileVehicle = user?.vehicleType || 'Truck'

  const fetchDriverProfile = useCallback(async () => {
    if (!driverId) return
    try {
      const res = await axiosInstance.get('/api/drivers')
      const list = extractList(res.data)
      const matched = list.find((item) => item?.userId === driverId || item?._id === driverId)
      setResolvedDriverId(matched?._id || '')
    } catch {
      setResolvedDriverId('')
    }
  }, [driverId])

  const fetchDeliveries = useCallback(async () => {
    try {
      const driverFilter = resolvedDriverId || driverId
      const res = await axiosInstance.get('/api/deliveries', {
        params: driverFilter ? { driverId: driverFilter, limit: 50 } : { limit: 50 },
      })

      const list = extractList(res.data).map(normalizeDelivery)
      const pickupList = list.filter(
        (item) =>
          ['pickup', 'drop'].includes(item.deliverType) &&
          AVAILABLE_PICKUP_STATUSES.has(item.status)
      )

      setPickups(pickupList)
      setDeliveries(
        list.filter(
          (item) =>
            ACTIVE_STATUSES.has(item.status) &&
            !AVAILABLE_PICKUP_STATUSES.has(item.status)
        )
      )
      setDeliveryHistory(list.filter((item) => HISTORY_STATUSES.has(item.status)))
    } catch {
      setPickups([])
      setDeliveries([])
      setDeliveryHistory([])
    }
  }, [driverId])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      await fetchDriverProfile()
      await fetchDeliveries()
    } finally {
      setLoading(false)
    }
  }, [fetchDeliveries, fetchDriverProfile])

  useEffect(() => {
    loadData()
  }, [loadData])

  const openAcceptModal = (pickup) => {
    setSelectedPickup(pickup)
    setSelectedVehicle('Van')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    if (isActionLoading) return
    setIsModalOpen(false)
    setSelectedPickup(null)
  }

 const handleAcceptPickup = async () => {
    if (!selectedPickup) return

    setIsActionLoading(true)
    try {
      // Step 1: Mark the assigned pickup as started
      await axiosInstance.put(`/api/deliveries/${selectedPickup.id}/status`, {
        status: 'PICKED_UP',
        message: `Pickup started by ${driverName} with ${selectedVehicle}`,
      })

      // Step 2: Update driver's vehicle type if it changed
      if (resolvedDriverId || driverId) {
        await axiosInstance
          .put(`/api/drivers/${resolvedDriverId || driverId}`, { vehicleType: selectedVehicle })
          .catch(() => {}) // Non-critical
      }

      toast.success(`Pickup started with ${selectedVehicle}`)
      closeModal()
      setActiveView('tasks')
      await loadData() // Full refresh
    } catch (error) {
      const msg =
        error?.response?.data?.errors?.[0]?.msg ||
        error?.response?.data?.message ||
        error?.message ||
        'Failed to accept pickup'
      toast.error(msg)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleCompleteDelivery = async (delivery) => {
    setIsActionLoading(true)
    try {
      // Always use the delivery API to mark as DELIVERED
      await axiosInstance.put(`/api/deliveries/${delivery.id}/status`, {
        status: 'DELIVERED',
        message: 'Completed by driver from dashboard',
      })

      setDeliveries((prev) => prev.filter((item) => item.id !== delivery.id))
      setDeliveryHistory((prev) => [{ ...delivery, status: 'DELIVERED' }, ...prev])
      toast.success('Delivery marked as completed')
    } catch {
      toast.error('Failed to complete delivery')
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const overviewStats = [
    { label: 'Open Pickups', value: pickups.length, icon: Package },
    { label: 'Active Tasks', value: deliveries.length, icon: ClipboardCheck },
    { label: 'Completed Trips', value: deliveryHistory.length, icon: CheckCircle2 },
  ]

  const normalizedSearch = searchTerm.trim().toLowerCase()
  const matchesSearch = (item) => {
    if (!normalizedSearch) return true
    const haystack = [
      item?.donorName,
      item?.address,
      item?.contact,
      item?.itemPreview,
      item?.donationRef,
      item?.status,
      item?.deliverType,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return haystack.includes(normalizedSearch)
  }

  const filteredPickups = useMemo(
    () => pickups.filter(matchesSearch),
    [pickups, normalizedSearch]
  )
  const filteredDeliveries = useMemo(
    () => deliveries.filter(matchesSearch),
    [deliveries, normalizedSearch]
  )
  const filteredHistory = useMemo(
    () => deliveryHistory.filter(matchesSearch),
    [deliveryHistory, normalizedSearch]
  )

  const chartTotals = useMemo(() => {
    const allItems = [...pickups, ...deliveries, ...deliveryHistory]
    const pickupCount = allItems.filter((item) => item.deliverType === 'pickup').length
    const ngoCount = allItems.filter((item) => item.deliverType === 'drop').length
    const total = pickupCount + ngoCount

    return {
      total,
      pickupCount,
      ngoCount,
      completed: deliveryHistory.length,
      active: deliveries.length,
      open: pickups.length,
    }
  }, [deliveries.length, deliveryHistory.length, pickups.length, deliveries, deliveryHistory, pickups])

  const completionRate = chartTotals.total
    ? Math.round((chartTotals.completed / chartTotals.total) * 100)
    : 0

  const sidebarLinks = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'pickups', label: 'Available Pickups', icon: Package },
    { id: 'tasks', label: 'Active Tasks', icon: ClipboardCheck },
    { id: 'history', label: 'Delivery History', icon: History },
  ]

  const renderStatus = (status) => {
    const key = String(status || '').toUpperCase()
    return (
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[key] || 'bg-slate-100 text-slate-700'}`}>
        {key.replace('_', ' ')}
      </span>
    )
  }

  const renderOverview = () => (
    <section className='space-y-5'>
      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
        {overviewStats.map((stat) => (
          <article
            key={stat.label}
            className='rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl'
          >
            <p className='text-sm font-medium text-slate-500'>{stat.label}</p>
            <div className='mt-3 flex items-center justify-between'>
              <p className='text-3xl font-bold text-slate-900'>{stat.value}</p>
              <span className='inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-900'>
                <stat.icon size={14} />
                Live
              </span>
            </div>
          </article>
        ))}
      </div>

      <div className='grid gap-4 lg:grid-cols-[1.2fr_1fr]'>
        <div className='rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-700'>
              <BarChart3 size={18} />
            </div>
            <div>
              <h2 className='text-lg font-semibold text-slate-900'>Today Snapshot</h2>
              <p className='text-sm text-slate-600'>Track pickups, complete route milestones, and keep delivery turnaround smooth.</p>
            </div>
          </div>

          <div className='mt-6 space-y-4'>
            {[
              { label: 'Open Pickups', value: chartTotals.open, max: Math.max(chartTotals.total, 1), color: 'bg-amber-400' },
              { label: 'Active Tasks', value: chartTotals.active, max: Math.max(chartTotals.total, 1), color: 'bg-teal-500' },
              { label: 'Completed Trips', value: chartTotals.completed, max: Math.max(chartTotals.total, 1), color: 'bg-emerald-500' },
            ].map((item) => (
              <div key={item.label} className='space-y-2'>
                <div className='flex items-center justify-between text-sm text-slate-600'>
                  <span className='font-medium text-slate-800'>{item.label}</span>
                  <span>{item.value}</span>
                </div>
                <div className='h-2 w-full rounded-full bg-slate-100'>
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${Math.min(100, Math.round((item.value / item.max) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-600'>
              <PieChart size={18} />
            </div>
            <div>
              <h2 className='text-lg font-semibold text-slate-900'>Completion Mix</h2>
              <p className='text-sm text-slate-600'>Pickup vs NGO deliveries across your current workload.</p>
            </div>
          </div>

          <div className='mt-6 flex flex-wrap items-center justify-between gap-6'>
            <div
              className='relative flex h-36 w-36 items-center justify-center rounded-full'
              style={{
                background: `conic-gradient(#14b8a6 0 ${chartTotals.total ? Math.round((chartTotals.pickupCount / chartTotals.total) * 360) : 0}deg, #38bdf8 0 360deg)`,
              }}
            >
              <div className='flex h-24 w-24 items-center justify-center rounded-full bg-white text-center'>
                <div>
                  <p className='text-2xl font-bold text-slate-900'>{completionRate}%</p>
                  <p className='text-xs text-slate-500'>Completed</p>
                </div>
              </div>
            </div>

            <div className='space-y-3 text-sm text-slate-600'>
              <div className='flex items-center gap-2'>
                <span className='h-2.5 w-2.5 rounded-full bg-teal-500' />
                <span className='font-medium text-slate-800'>Donation Pickups</span>
                <span className='ml-auto font-semibold text-slate-900'>{chartTotals.pickupCount}</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='h-2.5 w-2.5 rounded-full bg-sky-400' />
                <span className='font-medium text-slate-800'>NGO Deliveries</span>
                <span className='ml-auto font-semibold text-slate-900'>{chartTotals.ngoCount}</span>
              </div>
              <div className='rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600'>
                Total runs: <span className='font-semibold text-slate-900'>{chartTotals.total || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )

  const renderCards = (items, actionLabel, onAction) => (
    <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
      {items.map((item) => (
        <Card
          key={item.id}
          title={item.donorName}
          subtitle={item.itemPreview}
          status={renderStatus(item.status)}
          address={item.address}
          contact={item.contact}
          schedule={item.scheduledAt}
          count={item.itemCount}
          actionLabel={actionLabel}
          actionIcon={<CheckCircle2 size={16} />}
          onAction={() => onAction(item)}
          disabled={isActionLoading}
        />
      ))}
    </section>
  )

  const renderHistorySection = (title, subtitle, items) => (
    <section className='space-y-3'>
      <div className='flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-100 bg-white px-5 py-4 shadow-sm'>
        <div>
          <h2 className='text-lg font-semibold text-slate-900'>{title}</h2>
          <p className='text-sm text-slate-500'>{subtitle}</p>
        </div>
        <span className='rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800'>
          {items.length} record{items.length === 1 ? '' : 's'}
        </span>
      </div>

      {items.length
        ? renderCards(items, 'View Details', () => toast('History item selected'))
        : <EmptyState title='No history records in this section' />}
    </section>
  )

  const renderMainContent = () => {
    if (loading) {
      return (
        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className='h-56 animate-pulse rounded-3xl bg-white shadow-sm' />
          ))}
        </div>
      )
    }

    if (activeView === 'overview') return renderOverview()

    if (activeView === 'pickups') {
      return filteredPickups.length
        ? renderCards(filteredPickups, 'Accept Pickup', openAcceptModal)
        : <EmptyState title='No available pickups currently' />
    }

    if (activeView === 'tasks') {
      return filteredDeliveries.length
        ? renderCards(filteredDeliveries, 'Complete Task', handleCompleteDelivery)
        : <EmptyState title='No active tasks assigned' />
    }

    const pickupHistory = filteredHistory.filter((item) => item.deliverType === 'pickup')
    const ngoHistory = filteredHistory.filter((item) => item.deliverType === 'drop')

    if (!pickupHistory.length && !ngoHistory.length) {
      return <EmptyState title='No delivery history yet' />
    }

    return (
      <div className='space-y-6'>
        {renderHistorySection(
          'Donation Pickup History',
          'Completed pickups assigned to you by the manager.',
          pickupHistory
        )}
        {renderHistorySection(
          'NGO Request Delivery History',
          'Completed NGO deliveries assigned to you by the manager.',
          ngoHistory
        )}
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-slate-50 text-slate-800'>
      <div className='lg:flex'>
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-teal-950 bg-teal-950 p-4 shadow-[inset_-1px_0_0_rgba(49,120,115,0.2)] transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className='flex h-full flex-col'>
            <div className='rounded-2xl border border-teal-900/70 bg-white/5 p-4 shadow-sm'>
              <div className='flex items-center gap-3'>
                <img src={Logo} alt='NourishNet' className='h-10 w-10 rounded-xl object-cover' />
                <div>
                  <p className='text-sm font-semibold text-white'>NourishNet</p>
                  <p className='text-xs text-white'>Driver Workspace</p>
                </div>
              </div>
            </div>

            <nav className='mt-6 space-y-2'>
              {sidebarLinks.map((link) => {
                const Icon = link.icon
                const active = activeView === link.id

                return (
                  <button
                    key={link.id}
                    onClick={() => {
                      setActiveView(link.id)
                      setSidebarOpen(false)
                    }}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium transition-all duration-300 ${
                      active
                        ? 'bg-linear-to-r from-teal-700 to-teal-500 text-white shadow-lg shadow-teal-950/30'
                        : 'text-teal-300/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon size={17} className={active ? 'text-white' : 'text-teal-300/70'} />
                    {link.label}
                  </button>
                )
              })}
            </nav>

            <button
              onClick={handleLogout}
              className='mt-auto flex items-center justify-center gap-2 rounded-2xl border border-teal-700 bg-transparent px-4 py-3 text-sm font-semibold text-teal-300 transition hover:border-red-900/50 hover:bg-red-500/10 hover:text-red-400'
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </aside>

        {sidebarOpen && (
          <button
            className='fixed inset-0 z-40 bg-slate-900/35 lg:hidden'
            onClick={() => setSidebarOpen(false)}
            aria-label='Close sidebar overlay'
          />
        )}

        <main className='min-h-screen flex-1 p-4 md:p-6 lg:p-8'>
          <header className='mb-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-xl'>
            <div className='flex flex-wrap items-center justify-between gap-4'>
              <div className='flex items-center gap-3'>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className='rounded-xl border border-slate-200 bg-white p-2 text-teal-700 lg:hidden'
                >
                  <Menu size={18} />
                </button>
                <div>
                  <h1 className='text-2xl font-bold text-slate-900'>Welcome back, {driverName}</h1>
                  <p className='text-sm text-slate-500'>Manage your daily pickups and deliveries efficiently.</p>
                </div>
              </div>

              <div className='flex flex-1 items-center justify-end gap-3'>
                <div className='relative hidden min-w-[220px] max-w-[320px] flex-1 sm:block'>
                  <Search className='pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
                  <input
                    type='search'
                    placeholder='Search deliveries...'
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className='w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-teal-400 focus:bg-white'
                  />
                </div>
              </div>

              <div className='flex items-center gap-3'>
                <button className='rounded-xl border border-slate-200 bg-white p-2 text-teal-700 transition hover:bg-slate-100'>
                  <Bell size={18} />
                </button>

                <div className='flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 font-semibold text-white'>
                    {driverName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className='text-sm font-semibold text-slate-800'>{driverName}</p>
                    <p className='text-xs text-slate-500'>{profileVehicle} Driver</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {renderMainContent()}
        </main>
      </div>

      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4 transition-all duration-200 ${
          isModalOpen ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'
        }`}
        onClick={closeModal}
      >
        <div
          className={`w-full max-w-md rounded-3xl border border-white/80 bg-white p-6 shadow-2xl transition-all duration-300 ${
            isModalOpen ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-8 scale-95 opacity-0'
          }`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className='mb-6 flex items-start justify-between'>
            <div>
              <h2 className='text-2xl font-bold text-slate-900'>Confirm Pickup</h2>
              <p className='mt-1 text-sm text-slate-600'>Choose a vehicle before assigning this pickup.</p>
            </div>
            <button
              onClick={closeModal}
              disabled={isActionLoading}
              className='rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700'
            >
              <X size={18} />
            </button>
          </div>

          <div className='space-y-3'>
            {VEHICLES.map((vehicle) => {
              const isActive = selectedVehicle === vehicle
              const Icon = vehicle === 'Van' ? Van : vehicle === 'Truck' ? Truck : Bike

              return (
                <button
                  key={vehicle}
                  onClick={() => setSelectedVehicle(vehicle)}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all duration-300 ${
                    isActive
                      ? 'border-teal-500 bg-teal-300/15 text-teal-950 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-300/10'
                  }`}
                >
                  <span className='flex items-center gap-3 font-semibold'>
                    <Icon size={18} />
                    {vehicle}
                  </span>
                  {isActive ? <CheckCircle2 size={18} /> : null}
                </button>
              )
            })}
          </div>

          <button
            onClick={handleAcceptPickup}
            disabled={isActionLoading}
            className='mt-6 w-full rounded-2xl bg-teal-700 px-4 py-3 font-semibold text-white transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-70'
          >
            {isActionLoading ? 'Updating status...' : 'Confirm and Accept Pickup'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Card({ title, subtitle, status, address, contact, schedule, count, actionLabel, actionIcon, onAction, disabled }) {
  return (
    <article className='group rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl'>
      <div className='mb-4 flex items-start justify-between gap-3'>
        <div>
          <h3 className='text-lg font-bold text-slate-900'>{title}</h3>
          <p className='text-sm text-slate-500'>{subtitle}</p>
        </div>
        {status}
      </div>

      <div className='space-y-2 text-sm text-slate-700'>
        <Meta icon={<MapPin size={15} />} text={address} />
        <Meta icon={<UserRound size={15} />} text={contact} />
        <Meta icon={<Package size={15} />} text={`${count} item${count === 1 ? '' : 's'}`} />
        <Meta icon={<CalendarDays size={15} />} text={schedule ? new Date(schedule).toLocaleString() : 'Schedule not provided'} />
      </div>

      <button
        onClick={onAction}
        disabled={disabled}
        className='mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-700 px-4 py-2.5 font-semibold text-white transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-65'
      >
        {actionIcon}
        {actionLabel}
      </button>
    </article>
  )
}

function Meta({ icon, text }) {
  return (
    <p className='flex items-center gap-2'>
      <span className='text-slate-400'>{icon}</span>
      <span>{text}</span>
    </p>
  )
}

function EmptyState({ title }) {
  return (
    <div className='rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:shadow-xl'>
      <Clock4 className='mx-auto mb-3 text-slate-400' size={28} />
      <h3 className='text-lg font-semibold text-slate-700'>{title}</h3>
      <p className='mt-2 text-sm text-slate-500'>Check back soon or refresh to load the latest data.</p>
    </div>
  )
}

export default DriverDashboard
