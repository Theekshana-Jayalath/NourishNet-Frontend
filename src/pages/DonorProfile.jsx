import React, { useState } from "react";
import { Link } from "react-router-dom";
import { getUser } from "../api";

export default function DonorProfile() {
  const user = getUser() || {};

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    _id: user._id || "",
    userId: user.userId || "",
    name: user.name || "",
    username: user.username || "",
    email: user.email || "",
    role: user.role || "donor",
    nic: user.nic || "",
    contact: user.contact || "",
    city: user.city || "",
    donorType: user.donorType || user.donationType || "",
    addressLines:
      user.address && typeof user.address === "string"
        ? user.address.split(",").map((line) => line.trim()).filter(Boolean)
        : [""],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressChange = (index, value) => {
    const updated = [...formData.addressLines];
    updated[index] = value;
    setFormData((prev) => ({
      ...prev,
      addressLines: updated,
    }));
  };

  const addAddressLine = () => {
    setFormData((prev) => ({
      ...prev,
      addressLines: [...prev.addressLines, ""],
    }));
  };

  const removeAddressLine = (index) => {
    if (formData.addressLines.length === 1) return;

    const updated = formData.addressLines.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      addressLines: updated,
    }));
  };

  const handleSave = () => {
    // later you can connect this to backend PUT/PATCH
    console.log("Updated donor profile:", {
      ...formData,
      address: formData.addressLines.filter(Boolean).join(", "),
    });

    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      _id: user._id || "",
      userId: user.userId || "",
      name: user.name || "",
      username: user.username || "",
      email: user.email || "",
      role: user.role || "donor",
      nic: user.nic || "",
      contact: user.contact || "",
      city: user.city || "",
      donorType: user.donorType || user.donationType || "",
      addressLines:
        user.address && typeof user.address === "string"
          ? user.address.split(",").map((line) => line.trim()).filter(Boolean)
          : [""],
    });
    setIsEditing(false);
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-teal-900 via-teal-800 to-teal-700 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        {/* Top section */}
        <div className="mb-6 rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-teal-300 to-teal-500 text-3xl font-bold text-teal-950 shadow-lg">
                {formData.name ? formData.name.charAt(0).toUpperCase() : "D"}
              </div>

              <div>
                <p className="mb-1 text-sm font-medium uppercase tracking-[0.2em] text-teal-300">
                  Donor Account
                </p>
                <h1 className="text-3xl font-bold text-white">
                  My Profile
                </h1>
                <p className="mt-1 text-sm text-teal-100/80">
                  View and update your donor profile details
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/donor-dashboard"
                className="rounded-xl border border-teal-300/40 bg-white/10 px-5 py-3 text-sm font-semibold text-teal-100 transition hover:bg-white/20"
              >
                Back to Dashboard
              </Link>

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded-xl bg-gradient-to-r from-teal-300 to-teal-500 px-5 py-3 text-sm font-bold text-teal-950 shadow-lg transition hover:scale-[1.02]"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className="rounded-xl border border-red-200/40 bg-red-100/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-100/20"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="rounded-xl bg-gradient-to-r from-teal-300 to-teal-500 px-5 py-3 text-sm font-bold text-teal-950 shadow-lg transition hover:scale-[1.02]"
                  >
                    Save Changes
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Profile card */}
        <div className="rounded-3xl border border-teal-200/20 bg-white p-6 shadow-2xl md:p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-teal-950">
                Personal Information
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Manage your donor profile information below
              </p>
            </div>

            <div className="rounded-full bg-teal-100 px-4 py-2 text-xs font-bold uppercase tracking-wide text-teal-900">
              {formData.role || "donor"}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Name */}
            <ProfileField
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              isEditing={isEditing}
            />

            {/* Username */}
            <ProfileField
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              isEditing={isEditing}
            />

            {/* Email */}
            <ProfileField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              isEditing={isEditing}
            />

            {/* Contact */}
            <ProfileField
              label="Contact Number"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              isEditing={isEditing}
            />

            {/* NIC */}
            <ProfileField
              label="NIC"
              name="nic"
              value={formData.nic}
              onChange={handleChange}
              isEditing={isEditing}
            />

            {/* City */}
            <ProfileField
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              isEditing={isEditing}
            />

            {/* Donor type */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-teal-900">
                Donor Type
              </label>

              {isEditing ? (
                <select
                  name="donorType"
                  value={formData.donorType}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-950 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                >
                  <option value="">Select donor type</option>
                  <option value="Individual">Individual</option>
                  <option value="Organization">Organization</option>
                  <option value="Food Supplier">Food Supplier</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Retailer">Retailer</option>
                </select>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-700">
                  {formData.donorType || "—"}
                </div>
              )}
            </div>

            {/* Address section */}
            <div className="md:col-span-2">
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-semibold text-teal-900">
                  Address
                </label>

                {isEditing && (
                  <button
                    type="button"
                    onClick={addAddressLine}
                    className="rounded-xl bg-teal-100 px-4 py-2 text-xs font-bold text-teal-900 transition hover:bg-teal-200"
                  >
                    + Add More Address
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {formData.addressLines.map((line, index) => (
                  <div key={index} className="flex gap-3">
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={line}
                          onChange={(e) =>
                            handleAddressChange(index, e.target.value)
                          }
                          placeholder={`Address line ${index + 1}`}
                          className="flex-1 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-950 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeAddressLine(index)}
                          className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-700">
                        {line || "—"}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom summary removed per request */}
        </div>
      </div>
    </div>
  );
}

function ProfileField({
  label,
  name,
  value,
  onChange,
  isEditing,
  type = "text",
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-teal-900">
        {label}
      </label>

      {isEditing ? (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-950 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
        />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-700">
          {value || "—"}
        </div>
      )}
    </div>
  );
}