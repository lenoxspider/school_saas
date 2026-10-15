import React from 'react';
import { requireSuperAdmin } from '@/lib/auth/guards';
import { db } from '@/lib/db';
import { Building2, ShieldAlert, CheckCircle2, XCircle, Search } from 'lucide-react';

export default async function SuperAdminSchoolsPage() {
  await requireSuperAdmin();
  const schools = db.getSchools();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">School Tenant Management</h2>
        <p className="text-xs text-slate-400 mt-1">
          Inspect multi-tenant isolation, manage subscription plans, and toggle tenant statuses.
        </p>
      </div>

      <div className="space-y-4">
        {schools.map((sch) => {
          const students = db.getStudents(sch.id);
          const teachers = db.getUsers(sch.id).filter((u) => u.role === 'TEACHER');

          return (
            <div
              key={sch.id}
              className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-bold text-white">{sch.name}</h3>
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {sch.code}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      sch.status === 'ACTIVE'
                        ? 'bg-emerald-950 text-emerald-300'
                        : 'bg-amber-950 text-amber-300'
                    }`}
                  >
                    {sch.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {sch.email} • {sch.phone || 'No phone'} • {sch.address || sch.country}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                  <span>{students.length} Enrolled Students</span>
                  <span>•</span>
                  <span>{teachers.length} Assigned Teachers</span>
                  <span>•</span>
                  <span>Plan: <strong className="text-blue-400 uppercase">{sch.plan}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300">
                  Tenant ID: {sch.id}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
