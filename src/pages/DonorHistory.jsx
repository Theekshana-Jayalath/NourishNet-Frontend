import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getUser, getToken, BASE_URL } from '../api'

// product mapping - keep in sync with backend codes
const PRODUCT_MAP = {
  UNP001: 'Rice',
  UNP002: 'Dhal',
  UNP003: 'Milk Powder',
  UNP004: 'Flour',
  UNP005: 'Sugar',
  UNP006: 'Salt',
  PRO001: 'Vegetable Curry',
  PRO002: 'Chicken Fried Rice',
  PRO003: 'Egg Sandwich',
  PRO004: 'Fish Curry',
  PRO005: 'Dhal Curry (Cooked)'
}

function getProductLabel(id) {
  if (!id) return 'Unknown'
  return PRODUCT_MAP[id] || id
}

function StatusBadge({ status }) {
  const color = status === 'Received' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
  return (
    <span className={`${color} inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold`}>
      {status}
    </span>
  )
}

export default function DonorHistory() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true)
      setError('')

      const user = getUser() || {}
      const userId = user?._id || user?.id
      if (!userId) {
        setError('No logged-in donor found.')
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`${BASE_URL}/donationForms`, {
          headers: {
            'Content-Type': 'application/json',
            ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
          },
        })

        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setError(data.message || data.errorMessage || 'Failed to fetch donation history')
          setLoading(false)
          return
        }

        const items = data.data || []
        const myReceived = items.filter((f) => {
          const formDonorId = (f.donorId && (f.donorId._id || f.donorId)) || f.donorId
          return String(formDonorId) === String(userId) // keep all statuses so pending appears immediately
        })

        // sort newest first
        myReceived.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

        setHistory(myReceived)
      } catch (err) {
        console.error('Fetch donation history error', err)
        setError(err.message || 'Network error')
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  return (
    <div className="p-8 bg-linear-to-br from-emerald-50 via-emerald-100 to-emerald-200 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-[#002a29]">Donation History</h1>
            <p className="text-sm text-gray-500 mt-1">Received donations linked to your account.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/donor-dashboard" className="inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-medium shadow">
              ← Back
            </Link>
          </div>
        </div>

        {loading && <div className="text-sm text-gray-500">Loading...</div>}
        {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <div className="grid gap-6">
          {history.length === 0 && !loading && <div className="text-sm text-gray-600">No received donations yet.</div>}

          {history.map((f) => (
            <article key={f._id || f.donationFormId} className="relative overflow-hidden rounded-2xl bg-white shadow-md border border-gray-100">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-700 to-teal-400"></div>
              <div className="p-6 pl-8">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-bold text-[#06372f]">{f.donationFormId || 'Donation'}</h2>
                      <span className="text-xs text-gray-400">• {new Date(f.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">Donor: <span className="font-medium text-gray-800">{(f.donorId && (f.donorId.name || f.donorId._id || f.donorId)) || ''}</span></p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={f.Status} />
                    <div className="text-sm text-gray-500">Items: <span className="font-semibold text-gray-700">{f.items?.length || 0}</span></div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  {f.items && f.items.map((it, i) => (
                    <div key={i} className="flex items-center justify-between gap-4 rounded-lg border border-gray-100 p-3">
                      <div>
                        <div className="text-sm font-semibold text-[#06433a]">{getProductLabel(it.productId)}</div>
                        <div className="text-xs text-gray-500 mt-0.5">Code: <span className="font-mono text-xs text-gray-600">{it.productId}</span></div>
                      </div>

                      <div className="flex-1 text-right">
                        <div className="text-sm text-gray-700">{it.quantity} {it.unit}</div>
                        <div className="text-xs text-gray-500 mt-1">{it.processingType} • {it.StorageType}</div>
                        <div className="text-xs text-gray-500 mt-1">Expires: <span className="font-medium">{it.expirationDate ? new Date(it.expirationDate).toLocaleDateString() : 'N/A'}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
