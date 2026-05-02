import React from "react";
import { Link } from "react-router-dom";
import { getUser } from "../../api";

export default function DonorProfile() {
  const raw = getUser() || {}
  const user = {
    name: raw.name || raw.username || "",
    username: raw.username || "",
    email: raw.email || "",
    role: raw.role || localStorage.getItem("role") || "donor",
    nic: raw.nic || "",
    contact: raw.contact || "",
    city: raw.city || "",
    donorType: raw.donorType || raw.donationType || "",
    addressLines: raw.address && typeof raw.address === "string" ? raw.address.split(',').map(s => s.trim()).filter(Boolean) : (raw.addressLines || []),
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-teal-800 to-teal-700 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        {/* Top section */}
        <div className="mb-6 rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-teal-300 to-teal-500 text-3xl font-bold text-teal-950 shadow-lg">
                {user.name ? user.name.charAt(0).toUpperCase() : "D"}
              </div>

              <div>
                <p className="mb-1 text-sm font-medium uppercase tracking-[0.2em] text-teal-300">
                  Donor Account
                </p>
                <h1 className="text-3xl font-bold text-white">My Profile</h1>
                <p className="mt-1 text-sm text-teal-100/80">View and update your donor profile details</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to={(() => {
                  const user = getUser() || {}
                  const userId = user?._id || user?.id
                  const userRole = user?.role || localStorage.getItem('role') || ''
                  const params = new URLSearchParams()
                  if (userId) params.set('id', userId)
                  if (userRole) params.set('role', userRole)
                  const qs = params.toString() ? `?${params.toString()}` : ''
                  return `/donor-dashboard${qs}`
                })()}
                className="rounded-xl border border-teal-300/40 bg-white/10 px-5 py-3 text-sm font-semibold text-teal-100 transition hover:bg-white/20"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Profile card */}
        <div className="rounded-3xl border border-teal-200/20 bg-white p-6 shadow-2xl md:p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-teal-950">Personal Information</h2>
              <p className="mt-1 text-sm text-slate-500">Manage your donor profile information below</p>
            </div>

            <div className="rounded-full bg-teal-100 px-4 py-2 text-xs font-bold uppercase tracking-wide text-teal-900">{user.role}</div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-teal-900">Full Name</label>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-700">{user.name || "—"}</div>
            </div>

            {/* Username */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-teal-900">Username</label>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-700">{user.username || "—"}</div>
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-teal-900">Email</label>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-700">{user.email || "—"}</div>
            </div>

            {/* Contact */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-teal-900">Contact Number</label>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-700">{user.contact || "—"}</div>
            </div>

            {/* NIC */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-teal-900">NIC</label>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-700">{user.nic || "—"}</div>
            </div>

            {/* City */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-teal-900">City</label>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-700">{user.city || "—"}</div>
            </div>

            {/* Donor type */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-teal-900">Donor Type</label>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-700">{user.donorType || "—"}</div>
            </div>

            {/* Address section */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-teal-900">Address</label>
              <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-700">
                {user.addressLines.length ? (
                  <div className="space-y-1">
                    {user.addressLines.map((line, i) => (
                      <div key={i} className="text-sm text-slate-700">{line}</div>
                    ))}
                  </div>
                ) : (
                  "—"
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
