import React from 'react';
import Link from 'next/link';
import { requireSuperAdmin } from '@/lib/auth/guards';
import { db } from '@/lib/db';
import { Building2, Users, GraduationCap, ShieldCheck, Activity, ArrowRight, DollarSign } from 'lucide-react';

export default async function SuperAdminDashboardPage() {
  const user = await requireSuperAdmin();

  const schools = db.getSchools();
  const allUsers = db.getUsers();
  const allStudents = db.getRawData().students;
  const activeSchools = schools.filter((s) => s.status === 'ACTIVE');
  const trialSchools = schools.filter((s) => s.status === 'TRIAL');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Platform Master Console
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Global tenant oversight, multi-school subscriptions, and platform health telemetry.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
          <Activity className="w-3.5 h-3.5" /> All Services Operational
        </span>
      </div>

      {/* Global Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Schools</span>
            <Building2 className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{schools.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            {activeSchools.length} Active • {trialSchools.length} On Trial
          </p>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Students</span>
            <GraduationCap className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{allStudents.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Managed across all tenants</p>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Staff</span>
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{allUsers.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Admins & Subject Teachers</p>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Estimated MRR</span>
            <DollarSign className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            ${schools.reduce((acc, s) => acc + (s.plan === 'premium' ? 50 : s.plan === 'standard' ? 30 : 15), 0)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Monthly recurring run rate</p>
        </div>
      </div>

      {/* Tenants Roster */}
      <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white">Registered School Tenants</h3>
          <Link href="/admin/schools" className="text-xs text-blue-400 hover:underline">
            Manage Tenants →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="p-3">School Name</th>
                <th className="p-3">Country</th>
                <th className="p-3">Plan</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {schools.map((sch) => (
                <tr key={sch.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3">
                    <p className="font-bold text-white">{sch.name}</p>
                    <p className="text-[10px] font-mono text-slate-500">{sch.email}</p>
                  </td>
                  <td className="p-3 text-slate-300">{sch.country}</td>
                  <td className="p-3">
                    <span className="font-mono uppercase font-bold text-blue-400">
                      {sch.plan}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        sch.status === 'ACTIVE'
                          ? 'bg-emerald-950 text-emerald-300'
                          : 'bg-amber-950 text-amber-300'
                      }`}
                    >
                      {sch.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">
                    {new Date(sch.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
