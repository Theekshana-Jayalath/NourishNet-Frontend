import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Activity,
  Boxes,
  CheckCircle2,
  Clock3,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  Truck,
  XCircle,
} from 'lucide-react'
import axiosInstance from '../api/axiosInstance'
import { getDonationForms, updateDonationForm, deleteDonationForm } from '../api'
import AssignDriverModal from '../components/AssignDriverModal'

/* ------------------------------------------------------------------ */
/*  Constants & helpers                                                */
/* ------------------------------------------------------------------ */
const ACTIVE_DELIVERY_STATUSES = new Set(['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'])

const TABS = [
  { id: 'donations', label: 'Pending Donations', icon: Package },
  { id: 'requests', label: 'NGO Requests', icon: ClipboardList },
  { id: 'inventory', label: 'Live Inventory', icon: Boxes },
  { id: 'audit', label: 'Audit Trail', icon: Activity },
]

const URGENCY_STYLES = {
  HIGH: 'bg-rose-100 text-rose-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  LOW: 'bg-sky-100 text-sky-700',
}

const REQUEST_STATUS_STYLES = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-teal-300/30 text-teal-900',
  PARTIALLY_APPROVED: 'bg-sky-100 text-sky-700',
  WAITLISTED: 'bg-slate-100 text-slate-600',
  FULFILLED: 'bg-teal-300/50 text-teal-900',
  REJECTED: 'bg-rose-100 text-rose-700',
}

function parseArray(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.applications)) return payload.applications
  if (Array.isArray(payload?.data?.items)) return payload.data.items
  return []
}

function toReadableDate(value) {
  try {
    return value ? new Date(value).toLocaleString() : 'N/A'
  } catch {
    return 'N/A'
  }
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('donations')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [donations, setDonations] = useState([])
  const [deliveries, setDeliveries] = useState([])
  const [applications, setApplications] = useState([])
  const [ngoRequests, setNgoRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState('')
  const [assignModal, setAssignModal] = useState({ isOpen: false, sourceType: '', sourceData: null })
  const [searchTerm, setSearchTerm] = useState('')
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('role')
    window.location.href = '/login'
  }

  /* ---- Data fetching -------------------------------------------- */
  const loadDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      const [donationRes, deliveryRes, appRes, requestRes] = await Promise.all([
        // donation list comes from centralized helper; keep axiosInstance for other services
        (async () => ({ data: await getDonationForms() }))(),
        axiosInstance.get('/api/deliveries', { params: { limit: 100 } }).catch(() => ({ data: [] })),
        axiosInstance.get('/api/applications').catch(() => ({ data: [] })),
        axiosInstance.get('/api/requests', { params: { limit: 50 } }).catch(() => ({ data: [] })),
      ])

      setDonations(parseArray(donationRes.data))
      setDeliveries(parseArray(deliveryRes.data))
      setApplications(parseArray(appRes.data))
      setNgoRequests(parseArray(requestRes.data))
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load manager dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  /* ---- Stats ---------------------------------------------------- */
  const stats = useMemo(() => {
    const totalDonations = donations.length
    const pendingDonations = donations.filter(
      (d) => String(d?.Status || '').toLowerCase() === 'pending'
    ).length

    const pendingRequests = ngoRequests.filter(
      (r) => String(r?.status || '').toUpperCase() === 'PENDING'
    ).length

    const activeDriverIds = new Set(
      deliveries
        .filter((delivery) =>
          ACTIVE_DELIVERY_STATUSES.has(String(delivery?.status || '').toUpperCase())
        )
        .map((delivery) => {
          const driver = delivery?.driverId
          if (typeof driver === 'string') return driver
          return driver?._id
        })
        .filter(Boolean)
    )

    const stockLevel = donations
      .filter((donation) => String(donation?.Status || '').toLowerCase() === 'received')
      .reduce((total, donation) => {
        const sum = (donation?.items || []).reduce(
          (acc, item) => acc + Number(item?.quantity || 0),
          0
        )
        return total + sum
      }, 0)

    return {
      totalDonations,
      pendingDonations,
      pendingRequests,
      activeDrivers: activeDriverIds.size,
      stockLevel,
    }
  }, [applications, deliveries, donations, ngoRequests])

  /* ---- Inventory chart data ------------------------------------- */
  const inventoryItems = useMemo(() => {
    const map = new Map()

    donations
      .filter((donation) => String(donation?.Status || '').toLowerCase() === 'received')
      .forEach((donation) => {
        ;(donation?.items || []).forEach((item) => {
          const name = item?.productId || 'Unknown Item'
          const quantity = Number(item?.quantity || 0)
          const unit = item?.unit || 'units'
          const key = `${name}-${unit}`
          const current = map.get(key) || { name, quantity: 0, unit }
          current.quantity += quantity
          map.set(key, current)
        })
      })

    const list = Array.from(map.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 6)
    const max = list.length ? list[0].quantity : 1

    return list.map((item) => ({
      ...item,
      progress: Math.max(8, Math.round((item.quantity / max) * 100)),
    }))
  }, [donations])

  /* ---- Filtered lists ------------------------------------------- */
  const recentDonations = useMemo(() => {
    return [...donations]
      .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0))
      .slice(0, 10)
  }, [donations])

  const pendingDonations = useMemo(() => {
    return donations.filter(
      (donation) => String(donation?.Status || '').toLowerCase() === 'pending'
    )
  }, [donations])

  const normalizedSearch = searchTerm.trim().toLowerCase()
  const matchesSearch = (value) => {
    if (!normalizedSearch) return true
    return String(value || '').toLowerCase().includes(normalizedSearch)
  }

  const filteredDonations = useMemo(() => {
    return pendingDonations.filter((donation) => {
      const items = (donation?.items || []).map((item) => item?.productId).join(' ')
      return [
        donation?.donationFormId,
        donation?._id,
        donation?.Status,
        items,
        donation?.createdAt,
      ].some(matchesSearch)
    })
  }, [pendingDonations, normalizedSearch])

  const sortedRequests = useMemo(() => {
    return [...ngoRequests].sort(
      (a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0)
    )
  }, [ngoRequests])

  const filteredRequests = useMemo(() => {
    return sortedRequests.filter((request) => {
      const items = (request?.requestedItems || [])
        .map((item) => `${item?.itemName} ${item?.quantity} ${item?.unit}`)
        .join(' ')
      return [
        request?.requestId,
        request?._id,
        request?.organizationName,
        request?.contactPhone,
        request?.status,
        request?.urgencyLevel,
        request?.location?.address,
        items,
      ].some(matchesSearch)
    })
  }, [sortedRequests, normalizedSearch])

  const auditTrail = useMemo(() => {
    const deliveryEvents = deliveries.flatMap((delivery) => {
      const baseName = delivery?.driverId?.name || 'Driver'
      return (delivery?.history || []).map((historyItem) => ({
        id: `${delivery?._id}-${historyItem?.at}-${historyItem?.status}`,
        message:
          historyItem?.message || `${baseName} updated delivery to ${historyItem?.status}`,
        at: historyItem?.at,
        type: 'delivery',
      }))
    })

    const donationEvents = donations.map((donation) => ({
      id: `donation-${donation?._id}`,
      message: `Donation ${donation?.donationFormId || donation?._id} is ${donation?.Status || 'Pending'}`,
      at: donation?.updatedAt || donation?.createdAt,
      type: 'donation',
    }))

    const requestEvents = ngoRequests.map((request) => {
      const status = String(request?.status || 'PENDING').toUpperCase()
      return {
        id: `request-${request?._id}`,
        message: `NGO Request ${request?.requestId || request?._id} is ${status}`,
        at: request?.updatedAt || request?.createdAt,
        type: 'ngo',
      }
    })

    return [...deliveryEvents, ...donationEvents, ...requestEvents]
      .filter((item) => item?.at)
      .sort((a, b) => new Date(b.at) - new Date(a.at))
      .slice(0, 7)
  }, [deliveries, donations, ngoRequests])

  /* ---- Actions -------------------------------------------------- */
  const handleApproveDonation = async (donation) => {
    if (!donation?._id) return
    setActionLoadingId(donation._id)

    try {
  await updateDonationForm(donation._id, { Status: 'Received' })
      toast.success('Donation approved and moved to stock')
      await loadDashboardData()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to approve donation')
    } finally {
      setActionLoadingId('')
    }
  }

  const handleRejectDonation = async (donation) => {
    if (!donation?._id) return

    const confirmed = window.confirm('Reject and remove this donation record?')
    if (!confirmed) return

    setActionLoadingId(donation._id)
    try {
  await deleteDonationForm(donation._id)
      toast.success('Donation rejected successfully')
      await loadDashboardData()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to reject donation')
    } finally {
      setActionLoadingId('')
    }
  }

  const handleApproveRequest = async (request) => {
    if (!request?._id) return
    setActionLoadingId(request._id)
    try {
      await axiosInstance.put(`/api/requests/${request._id}`, { status: 'APPROVED' })
      toast.success('NGO request approved')
      await loadDashboardData()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to approve request')
    } finally {
      setActionLoadingId('')
    }
  }

  /* ---- Assign Driver Modal -------------------------------------- */
  const openAssignModal = (sourceType, sourceData) => {
    setAssignModal({ isOpen: true, sourceType, sourceData })
  }

  const closeAssignModal = () => {
    setAssignModal({ isOpen: false, sourceType: '', sourceData: null })
  }

  const handleRejectRequest = async (request) => {
    if (!request?._id) return

    const confirmed = window.confirm('Reject this NGO request?')
    if (!confirmed) return

    setActionLoadingId(request._id)
    try {
      await axiosInstance.put(`/api/requests/${request._id}`, { status: 'REJECTED' })
      toast.success('NGO request rejected')
      await loadDashboardData()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to reject request')
    } finally {
      setActionLoadingId('')
    }
  }

  /* ---- Render --------------------------------------------------- */
  return (
    <div className='min-h-screen bg-slate-50'>
      <div className='lg:flex'>
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-teal-950 bg-teal-950 p-4 shadow-[inset_-1px_0_0_rgba(49,120,115,0.2)] transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className='flex h-full flex-col'>
            <div className='rounded-2xl border border-teal-900/70 bg-white/5 p-4 shadow-sm'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-white'>
                  <LayoutDashboard size={18} />
                </div>
                <div>
                  <p className='text-sm font-semibold text-white'>NourishNet</p>
                  <p className='text-xs text-white/80'>Delivery Manager</p>
                </div>
              </div>
            </div>

            <nav className='mt-6 space-y-2'>
              <button
                onClick={() => {
                  setActiveTab('donations')
                  setSidebarOpen(false)
                }}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium transition-all duration-300 ${
                  activeTab === 'donations'
                    ? 'bg-linear-to-r from-teal-700 to-teal-500 text-white shadow-lg shadow-teal-950/30'
                    : 'text-teal-300/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Package size={17} className={activeTab === 'donations' ? 'text-white' : 'text-teal-300/70'} />
                Pending Donations
              </button>

              {TABS.filter((tab) => tab.id !== 'donations').map((tab) => {
                const Icon = tab.icon
                const active = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id)
                      setSidebarOpen(false)
                    }}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium transition-all duration-300 ${
                      active
                        ? 'bg-linear-to-r from-teal-700 to-teal-500 text-white shadow-lg shadow-teal-950/30'
                        : 'text-teal-300/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon size={17} className={active ? 'text-white' : 'text-teal-300/70'} />
                    {tab.label}
                    {tab.id === 'requests' && stats.pendingRequests > 0 && (
                      <span className='ml-auto rounded-full bg-teal-200/20 px-2 py-0.5 text-xs font-bold text-teal-100'>
                        {stats.pendingRequests}
                      </span>
                    )}
                    {tab.id === 'inventory' && stats.stockLevel > 0 && (
                      <span className='ml-auto rounded-full bg-teal-200/20 px-2 py-0.5 text-xs font-bold text-teal-100'>
                        {stats.stockLevel}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>

            <button
              onClick={handleLogout}
              className='mt-auto flex items-center justify-center gap-2 rounded-2xl border border-teal-700 bg-transparent px-4 py-3 text-sm font-semibold text-teal-200 transition hover:border-red-900/50 hover:bg-red-500/10 hover:text-red-300'
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

        <main className='min-h-screen flex-1 p-4 md:p-6'>
          <div className='mx-auto max-w-7xl space-y-6'>
            {/* Header */}
            <header className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
              <div className='flex flex-wrap items-center justify-between gap-4'>
                <div className='flex items-center gap-3'>
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className='rounded-xl border border-slate-200 bg-white p-2 text-teal-700 lg:hidden'
                  >
                    <Menu size={18} />
                  </button>
                  <div>
                    <h1 className='text-3xl font-bold tracking-tight text-teal-900'>
                      Delivery Manager Dashboard
                    </h1>
                    <p className='mt-1 text-sm text-slate-500'>
                      Real-time operations overview for donations, NGO requests, inventory, and
                      delivery flow.
                    </p>
                  </div>
                </div>

                <div className='flex flex-1 items-center justify-end gap-3'>
                  <div className='relative hidden min-w-[220px] max-w-[320px] flex-1 sm:block'>
                    <Search className='pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
                    <input
                      type='search'
                      placeholder='Search donations or NGO requests...'
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      className='w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-teal-400 focus:bg-white'
                    />
                  </div>
                </div>

                <button
                  onClick={loadDashboardData}
                  disabled={loading}
                  className='rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60'
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </header>

        {/* Stats Row */}
        <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-5'>
          <StatsCard
            title='Total Donations'
            value={stats.totalDonations}
            icon={<Package size={18} />}
            accent='from-teal-500/10 to-teal-300/20'
          />
          <StatsCard
            title='Pending Donations'
            value={stats.pendingDonations}
            icon={<Clock3 size={18} />}
            accent='from-amber-500/10 to-amber-100'
          />
          <StatsCard
            title='Pending NGO Requests'
            value={stats.pendingRequests}
            icon={<ClipboardList size={18} />}
            accent='from-teal-500/10 to-teal-300/20'
          />
          <StatsCard
            title='Active Drivers'
            value={stats.activeDrivers}
            icon={<Truck size={18} />}
            accent='from-teal-700/10 to-teal-300/20'
          />
          <StatsCard
            title='Stock Level'
            value={stats.stockLevel}
            suffix='units'
            icon={<Boxes size={18} />}
            accent='from-slate-500/10 to-slate-100'
          />
        </section>

        {/* Tab Bar */}
        <nav className='flex flex-wrap gap-2'>
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-md shadow-teal-300/40'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:text-teal-700'
                }`}
              >
                <Icon size={16} />
                {tab.label}
                {tab.id === 'donations' && stats.pendingDonations > 0 && (
                  <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'}`}>
                    {stats.pendingDonations}
                  </span>
                )}
                {tab.id === 'requests' && stats.pendingRequests > 0 && (
                  <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-teal-300/30 text-teal-900'}`}>
                    {stats.pendingRequests}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Tab Content */}
        {activeTab === 'donations' && (
          <DonationsTab
            loading={loading}
            donations={filteredDonations}
            actionLoadingId={actionLoadingId}
            onApprove={handleApproveDonation}
            onReject={handleRejectDonation}
            onAssignDriver={(donation) => openAssignModal('donation', donation)}
          />
        )}

        {activeTab === 'requests' && (
          <RequestsTab
            loading={loading}
            requests={filteredRequests}
            actionLoadingId={actionLoadingId}
            onApprove={handleApproveRequest}
            onReject={handleRejectRequest}
            onAssignDriver={(request) => openAssignModal('request', request)}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryTab loading={loading} items={inventoryItems} />
        )}

        {activeTab === 'audit' && (
          <AuditTab loading={loading} events={auditTrail} />
        )}
            {/* Assign Driver Modal */}
            <AssignDriverModal
              isOpen={assignModal.isOpen}
              onClose={closeAssignModal}
              sourceType={assignModal.sourceType}
              sourceData={assignModal.sourceData}
              onAssigned={loadDashboardData}
            />
          </div>
        </main>
      </div>
    </div>
  )
}

/* ================================================================== */
/*  SUB-COMPONENTS                                                     */
/* ================================================================== */

/* ---- Donations Tab ---------------------------------------------- */
function DonationsTab({ loading, donations, actionLoadingId, onApprove, onReject, onAssignDriver }) {
  return (
    <section className='rounded-2xl border border-slate-200 bg-white shadow-sm'>
      <div className='flex items-center justify-between border-b border-slate-100 p-5'>
        <h2 className='text-lg font-semibold text-slate-900'>Pending Donations</h2>
        <span className='text-xs font-semibold uppercase tracking-wide text-slate-400'>
          {donations.length} shown
        </span>
      </div>

      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-slate-100'>
          <thead className='bg-slate-50'>
            <tr>
              <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>
                Donation
              </th>
              <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>
                Items
              </th>
              <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>
                Status
              </th>
              <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>
                Created
              </th>
              <th className='px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-100 bg-white'>
            {loading && (
              <tr>
                <td colSpan={5} className='px-4 py-8 text-center text-sm text-slate-500'>
                  Loading donations...
                </td>
              </tr>
            )}

            {!loading && donations.length === 0 && (
              <tr>
                <td colSpan={5} className='px-4 py-8 text-center text-sm text-slate-500'>
                  No recent donations found.
                </td>
              </tr>
            )}

            {!loading &&
              donations.map((donation) => {
                const isPending =
                  String(donation?.Status || '').toLowerCase() === 'pending'
                const busy = actionLoadingId === donation?._id

                return (
                  <tr
                    key={donation?._id}
                    className='transition hover:bg-teal-300/10'
                  >
                    <td className='px-4 py-3 text-sm font-medium text-slate-700'>
                      {donation?.donationFormId || donation?._id?.slice(-6)}
                    </td>
                    <td className='px-4 py-3 text-sm text-slate-600'>
                      {donation?.items?.length || 0}
                    </td>
                    <td className='px-4 py-3 text-sm'>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          isPending
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-teal-300/30 text-teal-900'
                        }`}
                      >
                        {donation?.Status || 'Pending'}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-sm text-slate-600'>
                      {toReadableDate(donation?.createdAt)}
                    </td>
                    <td className='px-4 py-3 text-right text-sm'>
                      <div className='inline-flex items-center gap-2'>
                        <button
                          onClick={() => onAssignDriver(donation)}
                          disabled={busy}
                          className='inline-flex items-center gap-1 rounded-lg bg-teal-700 px-3 py-1.5 text-white transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60'
                        >
                          <Truck size={14} />
                          Assign Driver
                        </button>
                        <button
                          onClick={() => onApprove(donation)}
                          disabled={!isPending || busy}
                          className='inline-flex items-center gap-1 rounded-lg bg-teal-500 px-3 py-1.5 text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60'
                        >
                          <CheckCircle2 size={14} />
                          Approve
                        </button>
                        <button
                          onClick={() => onReject(donation)}
                          disabled={!isPending || busy}
                          className='inline-flex items-center gap-1 rounded-lg bg-rose-500 px-3 py-1.5 text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60'
                        >
                          <XCircle size={14} />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

/* ---- NGO Requests Tab ------------------------------------------- */
function RequestsTab({ loading, requests, actionLoadingId, onApprove, onReject, onAssignDriver }) {
  return (
    <section className='rounded-2xl border border-slate-200 bg-white shadow-sm'>
      <div className='flex items-center justify-between border-b border-slate-100 p-5'>
        <h2 className='text-lg font-semibold text-slate-900'>NGO Requests</h2>
        <span className='text-xs font-semibold uppercase tracking-wide text-slate-400'>
          {requests.length} total
        </span>
      </div>

      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-slate-100'>
          <thead className='bg-slate-50'>
            <tr>
              <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>
                Request ID
              </th>
              <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>
                Organization
              </th>
              <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>
                People
              </th>
              <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>
                Urgency
              </th>
              <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>
                Needed Before
              </th>
              <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>
                Items
              </th>
              <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>
                Status
              </th>
              <th className='px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-100 bg-white'>
            {loading && (
              <tr>
                <td colSpan={8} className='px-4 py-8 text-center text-sm text-slate-500'>
                  Loading NGO requests...
                </td>
              </tr>
            )}

            {!loading && requests.length === 0 && (
              <tr>
                <td colSpan={8} className='px-4 py-8 text-center text-sm text-slate-500'>
                  No NGO requests found.
                </td>
              </tr>
            )}

            {!loading &&
              requests.map((req) => {
                const status = String(req?.status || '').toUpperCase()
                const isPending = status === 'PENDING'
                const urgency = String(req?.urgencyLevel || '').toUpperCase()
                const busy = actionLoadingId === req?._id

                const itemsSummary = (req?.requestedItems || [])
                  .map((i) => `${i.itemName} (${i.quantity} ${i.unit})`)
                  .join(', ')

                return (
                  <tr key={req?._id} className='transition hover:bg-teal-300/10'>
                    <td className='px-4 py-3 text-sm font-medium text-slate-700'>
                      {req?.requestId || req?._id?.slice(-6)}
                    </td>
                    <td className='px-4 py-3 text-sm text-slate-700 font-medium'>
                      {req?.organizationName || '—'}
                    </td>
                    <td className='px-4 py-3 text-sm text-slate-600'>
                      {req?.peopleCount || '—'}
                    </td>
                    <td className='px-4 py-3 text-sm'>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${URGENCY_STYLES[urgency] || 'bg-slate-100 text-slate-600'}`}
                      >
                        {urgency || 'N/A'}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-sm text-slate-600'>
                      {req?.neededBefore
                        ? new Date(req.neededBefore).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className='max-w-[200px] truncate px-4 py-3 text-sm text-slate-600' title={itemsSummary}>
                      {itemsSummary || '—'}
                    </td>
                    <td className='px-4 py-3 text-sm'>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${REQUEST_STATUS_STYLES[status] || 'bg-slate-100 text-slate-600'}`}
                      >
                        {status || 'PENDING'}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-right text-sm'>
                      <div className='inline-flex items-center gap-2'>
                        <button
                          onClick={() => onAssignDriver(req)}
                          disabled={busy}
                          className='inline-flex items-center gap-1 rounded-lg bg-teal-700 px-3 py-1.5 text-white transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60'
                        >
                          <Truck size={14} />
                          Assign Driver
                        </button>
                        <button
                          onClick={() => onApprove(req)}
                          disabled={!isPending || busy}
                          className='inline-flex items-center gap-1 rounded-lg bg-teal-500 px-3 py-1.5 text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60'
                        >
                          <CheckCircle2 size={14} />
                          Approve
                        </button>
                        <button
                          onClick={() => onReject(req)}
                          disabled={!isPending || busy}
                          className='inline-flex items-center gap-1 rounded-lg bg-rose-500 px-3 py-1.5 text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60'
                        >
                          <XCircle size={14} />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

/* ---- Inventory Tab ---------------------------------------------- */
function InventoryTab({ loading, items }) {
  return (
    <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
      <h2 className='text-lg font-semibold text-slate-900'>Live Inventory</h2>
      <p className='mt-1 text-sm text-slate-500'>
        Top stocked items based on approved donations.
      </p>

      <div className='mt-4 space-y-4'>
        {loading && <p className='text-sm text-slate-500'>Loading inventory...</p>}

        {!loading && items.length === 0 && (
          <p className='text-sm text-slate-500'>No inventory data available yet.</p>
        )}

        {!loading &&
          items.map((item) => (
            <div
              key={`${item.name}-${item.unit}`}
              className='rounded-xl border border-slate-100 p-3 transition hover:border-teal-300'
            >
              <div className='mb-2 flex items-center justify-between text-sm'>
                <span className='font-medium text-slate-700'>{item.name}</span>
                <span className='text-slate-500'>
                  {item.quantity} {item.unit}
                </span>
              </div>
              <div className='h-2 rounded-full bg-slate-100'>
                <div
                  className='h-2 rounded-full bg-teal-500 transition-all duration-500'
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          ))}
      </div>
    </section>
  )
}

/* ---- Audit Tab -------------------------------------------------- */
function AuditTab({ loading, events }) {
  const donationEvents = events.filter((event) => event.type === 'donation')
  const ngoEvents = events.filter((event) => event.type === 'ngo')

  return (
    <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-lg font-semibold text-slate-900'>Audit Trail</h2>
        <Activity size={18} className='text-teal-700' />
      </div>

      <div className='space-y-3'>
        {loading && <p className='text-sm text-slate-500'>Loading activity...</p>}

        {!loading && events.length === 0 && (
          <p className='text-sm text-slate-500'>No recent system actions available.</p>
        )}

        {!loading && events.length > 0 && (
          <div className='space-y-6'>
            <div>
              <div className='mb-3 flex items-center justify-between text-sm'>
                <p className='font-semibold text-slate-800'>Donation Received</p>
                <span className='text-xs text-slate-500'>{donationEvents.length} entries</span>
              </div>
              <div className='space-y-2'>
                {donationEvents.length === 0 && (
                  <p className='rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-sm text-slate-500'>
                    No donation updates yet.
                  </p>
                )}
                {donationEvents.map((event) => (
                  <div
                    key={event.id}
                    className='flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3'
                  >
                    <span className='mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500' />
                    <div>
                      <p className='text-sm font-medium text-slate-700'>{event.message}</p>
                      <p className='text-xs text-slate-500'>{toReadableDate(event.at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className='mb-3 flex items-center justify-between text-sm'>
                <p className='font-semibold text-slate-800'>NGO Request Received</p>
                <span className='text-xs text-slate-500'>{ngoEvents.length} entries</span>
              </div>
              <div className='space-y-2'>
                {ngoEvents.length === 0 && (
                  <p className='rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-sm text-slate-500'>
                    No NGO request updates yet.
                  </p>
                )}
                {ngoEvents.map((event) => (
                  <div
                    key={event.id}
                    className='flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3'
                  >
                    <span className='mt-1 h-2.5 w-2.5 rounded-full bg-sky-500' />
                    <div>
                      <p className='text-sm font-medium text-slate-700'>{event.message}</p>
                      <p className='text-xs text-slate-500'>{toReadableDate(event.at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

/* ---- Stats Card ------------------------------------------------- */
function StatsCard({ title, value, suffix, icon, accent }) {
  return (
    <article
      className={`rounded-2xl border border-slate-200 bg-linear-to-br ${accent} p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
    >
      <div className='mb-4 inline-flex rounded-xl bg-white/90 p-2 text-teal-700 shadow-sm'>
        {icon}
      </div>
      <p className='text-sm font-medium text-slate-600'>{title}</p>
      <p className='mt-1 text-2xl font-bold text-slate-900'>
        {value}
        {suffix ? (
          <span className='ml-1 text-sm font-medium text-slate-500'>{suffix}</span>
        ) : null}
      </p>
    </article>
  )
}

export default ManagerDashboard
