import React, { useEffect, useState } from 'react'

const DashboardHome = () => {

  const [counts, setCounts] = useState({
    managers:null, donors:null, ngos:null, drivers:null, inventory:null
  })

  const [loading,setLoading] = useState(true)

  useEffect(()=>{
    setTimeout(()=>{
      setCounts({
        managers:3,
        donors:2,
        ngos:2,
        drivers:1,
        inventory:1
      })
      setLoading(false)
    },800)
  },[])

  return (
    <div className="space-y-6">

      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-[#004b49]">
          Dashboard Overview
        </h2>
        <p className="text-gray-500">
          Monitor system statistics
        </p>
      </div>

      {/* COUNTER BOXES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">

        {/* Managers */}
        <div className="p-6 rounded-2xl text-white
        bg-gradient-to-r from-cyan-500 to-cyan-700
        shadow-lg hover:scale-[1.02] transition">

          <div className="text-sm opacity-90">
            Total Managers
          </div>

          <div className="text-4xl font-bold mt-2">
            {loading ? '...' : counts.managers}
          </div>
        </div>

        {/* Donors */}
        <div className="p-6 rounded-2xl text-white
        bg-gradient-to-r from-emerald-500 to-emerald-700
        shadow-lg hover:scale-[1.02] transition">

          <div className="text-sm opacity-90">
            Total Donors
          </div>

          <div className="text-4xl font-bold mt-2">
            {loading ? '...' : counts.donors}
          </div>
        </div>

        {/* NGOs */}
        <div className="p-6 rounded-2xl text-white
        bg-gradient-to-r from-purple-500 to-purple-700
        shadow-lg hover:scale-[1.02] transition">

          <div className="text-sm opacity-90">
            Total NGOs
          </div>

          <div className="text-4xl font-bold mt-2">
            {loading ? '...' : counts.ngos}
          </div>
        </div>

        {/* Drivers */}
        <div className="p-6 rounded-2xl text-white
        bg-gradient-to-r from-orange-500 to-orange-700
        shadow-lg hover:scale-[1.02] transition">

          <div className="text-sm opacity-90">
            Total Drivers
          </div>

          <div className="text-4xl font-bold mt-2">
            {loading ? '...' : counts.drivers}
          </div>
        </div>

        {/* Inventory */}
        <div className="p-6 rounded-2xl text-white
        bg-gradient-to-r from-teal-500 to-teal-800
        shadow-lg hover:scale-[1.02] transition">

          <div className="text-sm opacity-90">
            Inventory Items
          </div>

          <div className="text-4xl font-bold mt-2">
            {loading ? '...' : counts.inventory}
          </div>
        </div>

      </div>

      {/* Bottom panels */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Expiring soon */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="font-semibold text-lg mb-4">
            Expiring Soon Items
          </h3>

          <div className="space-y-3">

            <div className="flex justify-between p-3 bg-red-50 rounded-lg">
              <span>Cooked Rice</span>
              <span className="text-red-600 text-sm">
                Today
              </span>
            </div>

            <div className="flex justify-between p-3 bg-yellow-50 rounded-lg">
              <span>Bread</span>
              <span className="text-yellow-600 text-sm">
                Tomorrow
              </span>
            </div>

          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="font-semibold text-lg mb-4">
            Notifications
          </h3>

          <div className="space-y-3 text-sm">

            <div className="p-3 bg-gray-50 rounded-lg">
              New donor registered
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              Inventory updated
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              Manager approved
            </div>

          </div>
        </div>

      </div>

    </div>
  )
}

export default DashboardHome