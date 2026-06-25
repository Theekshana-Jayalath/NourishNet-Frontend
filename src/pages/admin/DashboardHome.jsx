import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from "recharts";
import { 
  Users, 
  Building2, 
  HandHeart, 
  Truck, 
  TrendingUp, 
  Clock, 
  Package,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  UserCog,
  TrendingDown
} from "lucide-react";
import { BASE_URL } from "../../api";

const DashboardHome = () => {

  const [stats, setStats] = useState({
    managers: 0,
    donors: 0,
    ngos: 0,
    drivers: 0
  });

  const [userGrowthData, setUserGrowthData] = useState([]);
  const [expiring, setExpiring] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // Fetch managers directly from users endpoint as fallback
  const fetchManagersDirectly = async () => {
    try {
      const res = await fetch(`${BASE_URL}/users?role=manager`, { headers });
      if (!res.ok) return 0;
      const data = await res.json();
      const users = Array.isArray(data) ? data : (data?.data || data?.users || []);
      const managers = users.filter(u => 
        u.role === 'manager' || 
        u.role === 'Manager' || 
        u.managerType ||
        u.department
      );
      return managers.length;
    } catch (err) {
      console.error("Failed to fetch managers directly:", err);
      return 0;
    }
  };

  const fetchStats = async () => {
    try {
      console.log('[DashboardHome] fetching /api/admin/stats');
      const res = await fetch(`${BASE_URL}/admin/stats`, { headers });
      
      if (!res.ok) {
        console.error('[DashboardHome] /api/admin/stats returned', res.status);
        const managerCount = await fetchManagersDirectly();
        setStats(prev => ({ ...prev, managers: managerCount }));
        return;
      }
      
      const data = await res.json();
      console.log('[DashboardHome] /api/admin/stats response', data);
      const payload = data?.data || data || {};
      
      let managerCount = Number(payload.managers) || 0;
      if (managerCount === 0) {
        managerCount = await fetchManagersDirectly();
      }
      
      setStats({
        managers: managerCount,
        donors: Number(payload.donors) || 0,
        ngos: Number(payload.ngos) || 0,
        drivers: Number(payload.drivers) || 0,
      });
    } catch (err) {
      console.error("Stats fetch error:", err);
      const managerCount = await fetchManagersDirectly();
      setStats(prev => ({ ...prev, managers: managerCount }));
    }
  };

  // NEW: Fetch real user growth data for the graph
  const fetchUserGrowth = async () => {
    try {
      // Fetch all users from your backend
      const res = await fetch(`${BASE_URL}/users?limit=10000`, { headers });
      if (!res.ok) {
        console.error("Failed to fetch users for growth chart:", res.status);
        setUserGrowthData([]);
        return;
      }
      
      const data = await res.json();
      const users = Array.isArray(data) ? data : (data?.data || data?.users || []);
      
      if (!users || users.length === 0) {
        console.log("No users found in database");
        setUserGrowthData([]);
        return;
      }
      
      // Get last 30 days
      const now = new Date();
      const last30Days = [];
      
      // Create array of last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        last30Days.push({
          date: dateStr,
          fullDate: date,
          donors: 0,
          ngos: 0,
          drivers: 0,
          managers: 0,
        });
      }
      
      // Count users by role and registration date
      let usersWithValidDate = 0;
      
      users.forEach(user => {
        // Try different possible date fields
        const createdAt = user.createdAt || user.created_at || user.registrationDate || user.date || user.joinedAt;
        
        if (!createdAt) return;
        
        const regDate = new Date(createdAt);
        if (isNaN(regDate.getTime())) return;
        
        usersWithValidDate++;
        regDate.setHours(0, 0, 0, 0);
        
        const dayDiff = Math.floor((now - regDate) / (1000 * 60 * 60 * 24));
        
        // Only include users from last 30 days
        if (dayDiff >= 0 && dayDiff < 30) {
          const index = 29 - dayDiff;
          if (last30Days[index]) {
            const role = (user.role || '').toLowerCase();
            if (role === 'donor') {
              last30Days[index].donors++;
            } else if (role === 'ngo') {
              last30Days[index].ngos++;
            } else if (role === 'driver') {
              last30Days[index].drivers++;
            } else if (role === 'manager' || user.managerType) {
              last30Days[index].managers++;
            }
          }
        }
      });
      
      console.log(`Users processed for growth chart: ${usersWithValidDate} with valid dates`);
      
      // Calculate cumulative totals for the chart (running total)
      let cumulativeDonors = 0;
      let cumulativeNgos = 0;
      let cumulativeDrivers = 0;
      let cumulativeManagers = 0;
      
      const cumulativeData = last30Days.map(day => {
        cumulativeDonors += day.donors;
        cumulativeNgos += day.ngos;
        cumulativeDrivers += day.drivers;
        cumulativeManagers += day.managers;
        
        return {
          date: day.date,
          donors: cumulativeDonors,
          ngos: cumulativeNgos,
          drivers: cumulativeDrivers,
          managers: cumulativeManagers,
          total: cumulativeDonors + cumulativeNgos + cumulativeDrivers + cumulativeManagers
        };
      });
      
      setUserGrowthData(cumulativeData);
      
    } catch (err) {
      console.error("Failed to fetch user growth:", err);
      setUserGrowthData([]);
    }
  };

  // Keep the original growth endpoint as fallback for donation trends
  const fetchGrowth = async () => {
    try {
      const res = await fetch(`${BASE_URL}/admin/growth`, { headers });
      if (!res.ok) return;
      const data = await res.json();
      // This data is for donation trends - we'll keep it but not use for user growth
      console.log("Donation trends data:", data);
    } catch (err) {
      console.error("Growth fetch error:", err);
    }
  };

  const fetchExpiring = async () => {
    try {
      const res = await fetch(`${BASE_URL}/inventory/expiring`, { headers });
      if (!res.ok) return;
      const data = await res.json();
      setExpiring(data);
    } catch (err) {
      console.error("Expiring fetch error:", err);
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchStats(), 
        fetchUserGrowth(),  // NEW: Fetch real user growth data
        fetchGrowth(), 
        fetchExpiring()
      ]);
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate growth percentages from real data
  const getGrowthPercentage = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  // Get last 7 days growth from real chart data
  const getRecentGrowth = () => {
    if (userGrowthData.length < 8) {
      return { donors: 0, ngos: 0, drivers: 0, managers: 0 };
    }
    
    const today = userGrowthData[userGrowthData.length - 1];
    const weekAgo = userGrowthData[userGrowthData.length - 8];
    
    return {
      donors: getGrowthPercentage(today.donors, weekAgo.donors),
      ngos: getGrowthPercentage(today.ngos, weekAgo.ngos),
      drivers: getGrowthPercentage(today.drivers, weekAgo.drivers),
      managers: getGrowthPercentage(today.managers, weekAgo.managers),
    };
  };

  const growth = getRecentGrowth();

  const statCards = [
    { 
      title: "Managers", 
      value: stats.managers, 
      icon: UserCog, 
      bgColor: "bg-teal-50", 
      textColor: "text-teal-700",
      growth: growth.managers 
    },
    { 
      title: "NGOs", 
      value: stats.ngos, 
      icon: Building2, 
      bgColor: "bg-emerald-50", 
      textColor: "text-emerald-700",
      growth: growth.ngos 
    },
    { 
      title: "Donors", 
      value: stats.donors, 
      icon: HandHeart, 
      bgColor: "bg-amber-50", 
      textColor: "text-amber-700",
      growth: growth.donors 
    },
    { 
      title: "Drivers", 
      value: stats.drivers, 
      icon: Truck, 
      bgColor: "bg-blue-50", 
      textColor: "text-blue-700",
      growth: growth.drivers 
    },
  ];

  const getTimeLeftColor = (timeLeft) => {
    if (!timeLeft) return "text-gray-400";
    const days = parseInt(timeLeft);
    if (isNaN(days)) return "text-gray-500";
    if (days <= 2) return "text-red-600 bg-red-50";
    if (days <= 5) return "text-amber-600 bg-amber-50";
    return "text-teal-600 bg-teal-50";
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 min-w-[220px]">
          <p className="text-xs font-semibold text-gray-500 mb-3 border-b pb-2">{label}</p>
          {payload.map((entry, idx) => (
            <div key={idx} className="flex items-center justify-between gap-6 text-sm py-1.5">
              <span className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></div>
                <span className="text-gray-600">{entry.name}:</span>
              </span>
              <span className="font-semibold text-gray-800">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const colors = {
    donors: "#f59e0b",
    ngos: "#10b981",
    drivers: "#3b82f6",
    managers: "#14b8a6"
  };

  if (loading && userGrowthData.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
          <p className="text-sm text-teal-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && userGrowthData.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={fetchAll}
            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards with Real Growth Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          const isPositive = card.growth >= 0;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{card.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${card.bgColor} group-hover:scale-110 transition-transform`}>
                  <Icon size={22} className={card.textColor} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                {isPositive ? (
                  <TrendingUp size={14} className="text-green-600" />
                ) : (
                  <TrendingDown size={14} className="text-red-600" />
                )}
                <span className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(card.growth)}% 
                </span>
                <span className="text-xs text-gray-400">vs last week</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* User Growth Graph - Real Time Data */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">User Growth Over Time</h3>
            <p className="text-xs text-gray-400 mt-0.5">How donors, NGOs, drivers, and managers are joining the platform</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAll}
              className="p-1.5 rounded-lg text-gray-400 hover:text-teal-500 hover:bg-teal-50 transition-colors"
              title="Refresh data"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-6 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.donors }}></div>
            <span className="text-xs text-gray-600">Donors</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.ngos }}></div>
            <span className="text-xs text-gray-600">NGOs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.drivers }}></div>
            <span className="text-xs text-gray-600">Drivers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.managers }}></div>
            <span className="text-xs text-gray-600">Managers</span>
          </div>
        </div>

        {userGrowthData && userGrowthData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={{ stroke: "#cbd5e1" }}
                interval={4}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={{ stroke: "#cbd5e1" }}
                label={{ value: 'Number of Users', angle: -90, position: 'insideLeft', style: { fontSize: '11px', fill: '#94a3b8' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="donors" 
                name="Donors"
                stroke={colors.donors} 
                strokeWidth={2.5}
                dot={{ r: 3, fill: colors.donors }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="ngos" 
                name="NGOs"
                stroke={colors.ngos} 
                strokeWidth={2.5}
                dot={{ r: 3, fill: colors.ngos }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="drivers" 
                name="Drivers"
                stroke={colors.drivers} 
                strokeWidth={2.5}
                dot={{ r: 3, fill: colors.drivers }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="managers" 
                name="Managers"
                stroke={colors.managers} 
                strokeWidth={2.5}
                dot={{ r: 3, fill: colors.managers }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-80 text-gray-400">
            <div className="text-center">
              <p>No user data available</p>
              <p className="text-xs mt-2">Users will appear here once they register</p>
            </div>
          </div>
        )}

        {/* Summary Stats - Real Time Totals */}
        {userGrowthData.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">
                {userGrowthData[userGrowthData.length - 1]?.donors || 0}
              </p>
              <p className="text-xs text-gray-500">Total Donors</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">
                {userGrowthData[userGrowthData.length - 1]?.ngos || 0}
              </p>
              <p className="text-xs text-gray-500">Total NGOs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {userGrowthData[userGrowthData.length - 1]?.drivers || 0}
              </p>
              <p className="text-xs text-gray-500">Total Drivers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-teal-600">
                {userGrowthData[userGrowthData.length - 1]?.managers || 0}
              </p>
              <p className="text-xs text-gray-500">Total Managers</p>
            </div>
          </div>
        )}
      </div>

      {/* Expiring Food Section - Unchanged */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 rounded-xl">
                <Clock size={18} className="text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Expiring Soon</h3>
                <p className="text-xs text-gray-400">Items needing attention</p>
              </div>
            </div>
            {expiring.length > 0 && (
              <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-1 rounded-full">
                {expiring.length} items
              </span>
            )}
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {expiring.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-3">
                <Package size={28} className="text-green-500" />
              </div>
              <p className="text-sm font-medium text-gray-600">All good!</p>
              <p className="text-xs text-gray-400 mt-1">No expiring items found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {expiring.map((item, idx) => (
                <div key={item._id || idx} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
                          <Package size={14} className="text-teal-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{item.location || "Unknown location"}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getTimeLeftColor(item.timeLeft)}`}>
                        {item.timeLeft || "Expiring soon"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <button className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 group">
            <span>Dispatch All Priority</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;