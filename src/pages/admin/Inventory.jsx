import React, { useEffect, useState } from 'react'

const Inventory = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [q, setQ] = useState('')
  const [uploadingId, setUploadingId] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const token = localStorage.getItem('token')
  const headers = token ? { Authorization: `Bearer ${token}` } : {}

  const fetchItems = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/display/items', { headers })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(`${res.status} ${res.statusText} - ${text}`)
      }
      const data = await res.json()
      setItems(data.data || data)
    } catch (err) {
      setError(err.message || 'Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = items.filter(i => {
    if (!q) return true
    const s = q.toLowerCase()
    return (
      (i.productName || '').toLowerCase().includes(s) ||
      (i.productCategory || '').toLowerCase().includes(s)
    )
  })

  const handleImage = async (e, id) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingId(id)
    setUploadProgress(0)

    try {
      const form = new FormData()
      form.append('image', file)

      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      const res = await fetch(`/api/display/publish/${id}`, {
        method: 'PUT',
        headers: headers,
        body: form
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`${res.status} ${res.statusText} - ${text}`)
      }

      // refresh list
      await fetchItems()
    } catch (err) {
      alert('Upload failed: ' + (err.message || err))
    } finally {
      setUploadingId(null)
      setUploadProgress(0)
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-[#004b49]">Inventory</h3>
          <p className="text-sm text-gray-500">Current stock aggregated from received donations</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search product or category..."
            className="px-4 py-2 border rounded-lg text-sm w-64"
          />
          <button onClick={fetchItems} className="bg-[#2f7d79] text-white px-4 py-2 rounded-lg">Refresh</button>
        </div>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded-md mb-4">
          <div className="font-semibold">Failed to load inventory</div>
          <div className="text-sm mt-1">{error}</div>
          <div className="text-xs text-gray-500 mt-2">
            Possible causes:
            <ul className="list-disc ml-5">
              <li>Backend not running or unreachable.</li>
              <li>Display routes not mounted (server missing /api/display routes).</li>
            </ul>
          </div>
          <div className="text-xs text-gray-400 mt-2">Tip: start the backend and ensure the display endpoints are available at <code>/api/display/items</code>.</div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
      <thead className="text-left text-xs text-gray-500 border-b">
            <tr>
        <th className="py-3">Image</th>
              <th className="py-3">Product</th>
              <th>Category</th>
              <th>Unit</th>
              <th className="text-right">Quantity</th>
              <th>Nearest Expiry</th>
              <th>Days Left</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-gray-400">No items found.</td>
              </tr>
            )}

            {filtered.map(item => (
              <tr key={item._id} className="border-b">
                <td className="py-3">
                  {item.image ? (
                    <img src={`/uploads/${item.image}`} alt={item.productName} className="h-12 w-12 rounded-md object-cover" />
                  ) : (
                    <div className="h-12 w-12 bg-gray-100 rounded-md flex items-center justify-center text-xs text-gray-400">No Image</div>
                  )}
                </td>
                <td className="py-3 font-medium">{item.productName}</td>
                <td>{item.productCategory}</td>
                <td>{item.unit}</td>
                <td className="text-right font-semibold">{item.totalQuantity}</td>
                <td>{item.nearestExpireDate ? new Date(item.nearestExpireDate).toLocaleDateString() : '-'}</td>
                <td>{item.daysLeft ?? '-'}</td>
                <td className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {item.isExpiringSoon && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Expiring</span>}
                    <label className="inline-block">
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleImage(e, item._id)} />
                      <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded">Add Image</button>
                    </label>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Inventory
