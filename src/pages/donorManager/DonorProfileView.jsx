import React from "react";
import { useParams } from "react-router-dom";

export default function DonorProfileView({ donor }) {
  const params = useParams();
  const id = donor?._id || params.id || "unknown";

  const created = donor?.createdAt || donor?.registeredAt || donor?.createdAtClient;

  return (
    <div className="space-y-4">
      <header className="flex items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 text-white text-2xl font-extrabold">
          {((donor?.name || donor?.username || "D").split(" ").map(n=>n[0]).join("").slice(0,2)).toUpperCase()}
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">{donor?.name || donor?.username || "Anonymous Donor"}</h2>
          <div className="mt-1 text-sm text-slate-500">ID: <span className="font-mono text-xs text-slate-600">{id}</span></div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-100 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-700">Contact</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <div><span className="text-slate-500">Email: </span>{donor?.email || "—"}</div>
            <div><span className="text-slate-500">Phone: </span>{donor?.phone || "—"}</div>
            <div><span className="text-slate-500">Location: </span>{donor?.location || donor?.address || "—"}</div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-100 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-700">Stats</h3>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-emerald-50 p-3 text-center">
              <div className="text-sm text-slate-500">Donations</div>
              <div className="mt-1 text-lg font-bold text-slate-900">{donor?.totalDonations || 0}</div>
            </div>
            <div className="rounded-lg bg-amber-50 p-3 text-center">
              <div className="text-sm text-slate-500">Member Since</div>
              <div className="mt-1 text-lg font-bold text-slate-900">{created ? new Date(created).toLocaleDateString() : '—'}</div>
            </div>
            <div className="rounded-lg bg-sky-50 p-3 text-center">
              <div className="text-sm text-slate-500">Type</div>
              <div className="mt-1 text-lg font-bold text-slate-900">{donor?.type || donor?.category || '—'}</div>
            </div>
          </div>
        </div>
      </div>

      {donor?.notes && (
        <div className="rounded-lg border border-slate-100 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-700">Notes</h3>
          <div className="mt-2 text-sm text-slate-600">{donor.notes}</div>
        </div>
      )}
    </div>
  );
}
