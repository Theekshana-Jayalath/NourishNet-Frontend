import { useEffect, useMemo, useState } from "react";
import { filterMyRequests, getRequests, getUser } from "../../api";

export default function RequestProfile({ showToast }) {
  const user = getUser();

  const [profile, setProfile] = useState({
    username: user?.username || user?.name || "",
    email: user?.email || "",
    role: user?.role || "ngo",
    nic: user?.nic || "",
    address: user?.address || "",
    city: user?.city || "",
    organizationName: user?.organizationName || "",
    registrationNumber: user?.registrationNumber || "",
    contactNumber: user?.contactNumber || user?.contact || "",
  });

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getRequests({ page: 1, limit: 100 });
      setRequests(filterMyRequests(res.items || []));
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === "PENDING").length,
      approved: requests.filter(
        (r) => r.status === "APPROVED" || r.status === "FULFILLED"
      ).length,
      high: requests.filter((r) => r.urgencyLevel === "HIGH").length,
    };
  }, [requests]);

  const profileCompletion = useMemo(() => {
    const values = [
      profile.username,
      profile.email,
      profile.nic,
      profile.address,
      profile.city,
      profile.organizationName,
      profile.registrationNumber,
      profile.contactNumber,
    ];
    const filled = values.filter((v) => String(v || "").trim()).length;
    return Math.round((filled / values.length) * 100);
  }, [profile]);

  const saveProfile = () => {
    localStorage.setItem(
      "user",
      JSON.stringify({
        ...getUser(),
        username: profile.username,
        name: profile.username,
        email: profile.email,
        role: profile.role,
        nic: profile.nic,
        address: profile.address,
        city: profile.city,
        organizationName: profile.organizationName,
        registrationNumber: profile.registrationNumber,
        contactNumber: profile.contactNumber,
      })
    );

    showToast("Profile saved successfully");
  };

  return (
    <div>
      <div className="mb-10">
        <h2 className="text-4xl font-extrabold tracking-tight text-[#003331]">
          NGO Profile Management
        </h2>
        <p className="mt-2 text-lg text-[#3f4948]">
          Verify and maintain your organization’s architectural footprint and impact identity.
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-8">
          <section className="rounded-[32px] bg-white p-8 shadow-xl shadow-teal-900/5">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e4e9e9] text-[#003331]">
                <span className="material-symbols-outlined">badge</span>
              </div>
              <h3 className="text-2xl font-bold text-[#171d1d]">Identity & Contact</h3>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="User Name"
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
              />
              <Field
                label="Email Address"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
              <Field
                label="National Identity Number (NIC)"
                value={profile.nic}
                onChange={(e) => setProfile({ ...profile, nic: e.target.value })}
              />
              <Field
                label="Contact Number"
                value={profile.contactNumber}
                onChange={(e) => setProfile({ ...profile, contactNumber: e.target.value })}
              />
            </div>
          </section>

          <section className="rounded-[32px] bg-white p-8 shadow-xl shadow-teal-900/5">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e4e9e9] text-[#003331]">
                <span className="material-symbols-outlined">apartment</span>
              </div>
              <h3 className="text-2xl font-bold text-[#171d1d]">Organization Details</h3>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <Field
                  label="Organization Name"
                  value={profile.organizationName}
                  onChange={(e) =>
                    setProfile({ ...profile, organizationName: e.target.value })
                  }
                />
              </div>

              <div className="md:col-span-2">
                <Field
                  label="Registration Number"
                  value={profile.registrationNumber}
                  onChange={(e) =>
                    setProfile({ ...profile, registrationNumber: e.target.value })
                  }
                />
              </div>

              <Field
                label="City"
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
              />

              <Field
                label="HQ Address"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              />

              <Field label="Role" value={profile.role} disabled />
            </div>
          </section>

          <div className="flex flex-col justify-end gap-4 sm:flex-row">
            <button className="rounded-full px-8 py-4 text-lg font-medium text-[#171d1d] transition hover:bg-[#eff5f5]">
              Discard Changes
            </button>
            <button
              onClick={saveProfile}
              className="rounded-full bg-gradient-to-r from-[#003331] to-[#004b49] px-10 py-4 text-lg font-bold text-white shadow-2xl shadow-teal-900/10 transition hover:opacity-95"
            >
              Update Profile
            </button>
          </div>
        </div>

        <aside className="space-y-8">
          <div className="overflow-hidden rounded-[32px] bg-white shadow-xl shadow-teal-900/5">
            <div className="h-40 bg-gradient-to-br from-[#003331] to-[#004b49]" />
            <div className="relative px-8 pb-8 pt-16">
              <div className="absolute -top-14 left-8 flex h-28 w-28 items-center justify-center rounded-[28px] border-4 border-white bg-gradient-to-br from-[#003331] to-[#004b49] text-white shadow-2xl shadow-teal-900/20">
                <span className="material-symbols-outlined !text-[40px]">
                  volunteer_activism
                </span>
              </div>

              <h3 className="text-4xl font-black text-[#171d1d]">
                {profile.organizationName || "NGO Organization"}
              </h3>
              <p className="mt-2 text-lg text-[#3f4948]">
                Certified partner profile
              </p>

              <div className="mt-8 border-t border-[#bfc8c7]/20 pt-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#3f4948]/70">
                    Profile Completion
                  </span>
                  <span className="text-2xl font-black text-[#003331]">
                    {profileCompletion}%
                  </span>
                </div>
                <div className="h-3 rounded-full bg-[#dee3e3]">
                  <div
                    className="h-full rounded-full bg-[#003331]"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] bg-white p-8 shadow-xl shadow-teal-900/5">
            <h4 className="mb-6 text-xs font-extrabold uppercase tracking-[0.18em] text-[#3f4948]/70">
              Request Analytics
            </h4>

            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#b1eeea] border-t-[#004b49]" />
              </div>
            ) : (
              <div className="space-y-4">
                <SummaryCard
                  icon="bar_chart"
                  title="Total Requests"
                  value={stats.total}
                  iconBg="bg-[#eff5f5]"
                  valueClass="text-[#003331]"
                />
                <SummaryCard
                  icon="verified"
                  title="Approved"
                  value={stats.approved}
                  iconBg="bg-[#a5ede3]/40"
                  valueClass="text-[#004b49]"
                />
                <SummaryCard
                  icon="pending_actions"
                  title="Pending"
                  value={stats.pending}
                  iconBg="bg-red-50"
                  valueClass="text-red-600"
                />
              </div>
            )}

            <button className="mt-8 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-[#003331]">
              Download Impact Report
              <span className="material-symbols-outlined">download</span>
            </button>
          </div>

          <div className="rounded-[32px] bg-[#eff5f5] p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#003331]">
                <span className="material-symbols-outlined">workspace_premium</span>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-[#171d1d]">Architectural Clarity</h4>
                <p className="mt-2 text-[#3f4948]">
                  Your NGO profile is aligned with your current request activity and
                  operational visibility.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, disabled, ...props }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.18em] text-[#3f4948]">
        {label}
      </label>
      <input
        {...props}
        disabled={disabled}
        className={`w-full rounded-full border-none bg-[#e4e9e9] px-5 py-4 text-lg text-[#171d1d] outline-none ring-0 focus:ring-2 focus:ring-[#003331]/20 ${
          disabled ? "cursor-not-allowed opacity-70" : ""
        }`}
      />
    </div>
  );
}

function SummaryCard({ icon, title, value, iconBg, valueClass }) {
  return (
    <div className="flex items-center justify-between rounded-[24px] border border-[#bfc8c7]/20 p-5">
      <div className="flex items-center gap-4">
        <div className={`flex h-14 w-14 items-center justify-center rounded-full ${iconBg}`}>
          <span className="material-symbols-outlined text-[#003331]">{icon}</span>
        </div>
        <div>
          <p className="text-lg text-[#171d1d]">{title}</p>
        </div>
      </div>
      <div className={`text-4xl font-black ${valueClass}`}>{value}</div>
    </div>
  );
}