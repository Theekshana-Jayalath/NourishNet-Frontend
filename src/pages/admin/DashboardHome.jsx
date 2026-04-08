import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const DashboardHome = () => {

  const [stats,setStats] = useState({
    managers:0,
    donors:0,
    ngos:0,
    drivers:0
  });

  const [chartData,setChartData] = useState([]);
  const [expiring,setExpiring] = useState([]);

  const token = localStorage.getItem("token");

  const headers = token
  ? {Authorization:`Bearer ${token}`}
  : {}



/* ---------- FETCH STATS ---------- */
const fetchStats = async () => {
  try{
    const res = await fetch("/api/admin/stats",{headers})
    if(!res.ok) return
    const data = await res.json()
    setStats(data)
  }catch(err){}
}


/* ---------- FETCH GRAPH ---------- */
const fetchGrowth = async () => {
  try{
    const res = await fetch("/api/admin/growth",{headers})
    if(!res.ok) return
    const data = await res.json()
    setChartData(data)
  }catch(err){}
}


/* ---------- FETCH EXPIRING FOOD ---------- */
const fetchExpiring = async () => {
  try{
    const res = await fetch("/api/inventory/expiring",{headers})
    if(!res.ok) return
    const data = await res.json()
    setExpiring(data)
  }catch(err){}
}



/* ---------- AUTO REFRESH ---------- */
useEffect(()=>{

  fetchStats()
  fetchGrowth()
  fetchExpiring()

  const interval = setInterval(()=>{
    fetchStats()
    fetchGrowth()
    fetchExpiring()
  },5000)

  return ()=>clearInterval(interval)

},[])



return(
<div className="grid grid-cols-12 gap-6">

{/* LEFT SIDE */}
<div className="col-span-9 space-y-6">

{/* STATS */}
<div className="grid grid-cols-4 gap-4">
<StatCard title="Managers" value={stats.managers}/>
<StatCard title="NGOs" value={stats.ngos}/>
<StatCard title="Donors" value={stats.donors}/>
<StatCard title="Drivers" value={stats.drivers}/>
</div>


{/* GRAPH */}
<div className="bg-white p-6 rounded-2xl shadow-sm">
<h3 className="font-semibold mb-4">Community Growth</h3>

<ResponsiveContainer width="100%" height={300}>
<LineChart data={chartData}>
<XAxis dataKey="date"/>
<YAxis/>
<Tooltip/>
<Line type="monotone" dataKey="donations" stroke="#2f7d79" strokeWidth={3}/>
</LineChart>
</ResponsiveContainer>

</div>

</div>


{/* RIGHT PANEL */}
<div className="col-span-3">

<div className="bg-white p-5 rounded-2xl shadow-sm">

<h3 className="font-semibold mb-4">
Fast Expiring Food
</h3>

<div className="space-y-3">

{expiring.map(item => (
<ExpiringItem
key={item._id}
name={item.name}
location={item.location}
time={item.timeLeft}
/>
))}

{expiring.length === 0 && (
<p className="text-sm text-gray-400">
No expiring items
</p>
)}

</div>

<button className="mt-4 w-full bg-[#2f7d79] text-white py-2 rounded-lg">
Dispatch All Priority
</button>

</div>

</div>

</div>
)

}



/* ---------- STAT CARD ---------- */
const StatCard = ({title,value}) => (
<div className="bg-white p-4 rounded-xl shadow-sm">
<p className="text-sm text-gray-500">{title}</p>
<h2 className="text-2xl font-bold text-[#004b49]">{value}</h2>
</div>
)



/* ---------- EXPIRING ITEM ---------- */
const ExpiringItem = ({name,location,time}) => (
<div className="flex justify-between items-center border-b pb-2">

<div>
<p className="text-sm font-medium">{name}</p>
<p className="text-xs text-gray-500">{location}</p>
</div>

<div className="text-right">
<p className="text-xs text-red-500">{time}</p>
</div>

</div>
)



export default DashboardHome