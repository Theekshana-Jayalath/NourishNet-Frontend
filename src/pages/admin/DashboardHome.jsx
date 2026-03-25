import React, { useEffect, useState } from 'react'

const DashboardHome = () => {
  const [counts, setCounts] = useState({ managers: null, donors: null, ngos: null, drivers: null, inventory: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCounts = async () => {
      setLoading(true)
      try {
        const invRes = await fetch('/api/display/items')
        if (invRes.ok) {
          const invJson = await invRes.json()
          setCounts(c => ({ ...c, inventory: invJson.count ?? (Array.isArray(invJson.data) ? invJson.data.length : null) }))
        }
        const usersRes = await fetch('/api/users')
        if (usersRes.ok) {
          const usersJson = await usersRes.json()
          const arr = Array.isArray(usersJson) ? usersJson : usersJson.data || usersJson.users || []
          const roleCounts = { managers: 0, donors: 0, ngos: 0, drivers: 0 }
          arr.forEach(u => { const r = (u.role||'').toLowerCase(); if (r==='manager') roleCounts.managers++; if(r==='donor') roleCounts.donors++; if(r==='ngo') roleCounts.ngos++; if(r==='driver') roleCounts.drivers++; })
          setCounts(c => ({ ...c, ...roleCounts }))
        }
      } catch (e) {
        // ignore
      } finally { setLoading(false) }
    }
    fetchCounts()
  }, [])

  return (
    <div>
      <section className='mb-6'>
        <div className='rounded-lg border border-gray-100 p-6 bg-white shadow-sm'>
          <h3 className='text-2xl font-bold text-[#004b49]'>Dashboard</h3>
          <p className='text-sm text-gray-600 mt-2'>Overview and quick actions.</p>
        </div>
      </section>

      <section className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6'>
        <div className='rounded-lg p-5 bg-white border border-gray-100 shadow-sm flex items-center gap-4'>
          <div className='p-3 rounded-md bg-[#96ded1]/30 text-[#317873]'>
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M16 11a4 4 0 11-8 0 4 4 0 018 0z'></path></svg>
          </div>
          <div>
            <div className='text-sm text-gray-500'>Total Managers</div>
            <div className='text-2xl font-bold text-[#004b49]'>{loading ? '...' : (counts.managers ?? 'N/A')}</div>
          </div>
        </div>

        <div className='rounded-lg p-5 bg-white border border-gray-100 shadow-sm flex items-center gap-4'>
          <div className='p-3 rounded-md bg-[#66ada4]/30 text-[#004b49]'>
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8c-3.866 0-7 3.134-7 7v1h14v-1c0-3.866-3.134-7-7-7zM12 2a4 4 0 110 8 4 4 0 010-8z'></path></svg>
          </div>
          <div>
            <div className='text-sm text-gray-500'>Total Donors</div>
            <div className='text-2xl font-bold text-[#004b49]'>{loading ? '...' : (counts.donors ?? 'N/A')}</div>
          </div>
        </div>

        <div className='rounded-lg p-5 bg-white border border-gray-100 shadow-sm flex items-center gap-4'>
          <div className='p-3 rounded-md bg-[#317873]/20 text-[#317873]'>
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 7h18M3 12h18M3 17h18'></path></svg>
          </div>
          <div>
            <div className='text-sm text-gray-500'>Total NGOs</div>
            <div className='text-2xl font-bold text-[#004b49]'>{loading ? '...' : (counts.ngos ?? 'N/A')}</div>
          </div>
        </div>

        <div className='rounded-lg p-5 bg-white border border-gray-100 shadow-sm flex items-center gap-4'>
          <div className='p-3 rounded-md bg-[#66ada4]/20 text-[#317873]'>
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 13h2l1-2h10l1 2h2'></path><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 6h14l1 7H4L5 6z'></path></svg>
          </div>
          <div>
            <div className='text-sm text-gray-500'>Total Drivers</div>
            <div className='text-2xl font-bold text-[#004b49]'>{loading ? '...' : (counts.drivers ?? 'N/A')}</div>
          </div>
        </div>

        <div className='rounded-lg p-5 bg-white border border-gray-100 shadow-sm flex items-center gap-4'>
          <div className='p-3 rounded-md bg-[#317873]/30 text-white' style={{ backgroundColor: '#317873' }}>
            <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 7h18M3 12h18M3 17h18'></path></svg>
          </div>
          <div>
            <div className='text-sm text-gray-500'>Total Inventory Items</div>
            <div className='text-2xl font-bold text-[#004b49]'>{loading ? '...' : (counts.inventory ?? 'N/A')}</div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default DashboardHome
