import React from 'react';
import { requireSuperAdmin } from '@/lib/auth/guards';
import { db } from '@/lib/db';
import { ShieldCheck, ShieldAlert, Lock, Key, Server } from 'lucide-react';
import { SecurityConsoleClient } from '@/components/SecurityConsoleClient';

export default async function AdminSecurityPage() {
  await requireSuperAdmin();

  const schools = db.getSchools();
  const suspendedSchools = schools.filter((s) => s.status === 'SUSPENDED');
  const allUsers = db.getUsers();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Platform Security & Tenant Isolation</h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time security posture, multi-tenant isolation gates, cryptographic session integrity, and self-attack audit logs.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 shrink-0">
          <ShieldCheck className="w-4 h-4" /> All Isolation Gates Active
        </span>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Tenant Isolation</span>
            <Lock className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-xl font-bold text-white mt-2">Zero Client Trust</p>
          <p className="text-[11px] text-slate-500 mt-1">Server-enforced session bindings</p>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Session Encryption</span>
            <Key className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-white mt-2">HS256 JWT</p>
          <p className="text-[11px] text-slate-500 mt-1">HTTP-only tamper-evident cookies</p>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Suspended Tenants</span>
            <ShieldAlert className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-xl font-bold text-white mt-2">{suspendedSchools.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Locked out from data access</p>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Credentials</span>
            <Server className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-xl font-bold text-white mt-2">{allUsers.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Bcrypt password hashing</p>
        </div>
      </div>

      {/* Interactive Security Self-Attack Console */}
      <SecurityConsoleClient />
    </div>
  );
}
