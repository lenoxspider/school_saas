import React from 'react';
import { requireSchoolAdmin } from '@/lib/auth/guards';
import { db } from '@/lib/db';
import { History, Shield, User, Clock, CheckCircle2 } from 'lucide-react';

export default async function AuditLogPage() {
  const { schoolId } = await requireSchoolAdmin();

  const logs = db.getAuditLogs(schoolId, 100);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Immutable Audit Trail
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Complete, tamper-evident log of score submissions, approvals, enrollments, and
          administrative operations.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            System Event Log ({logs.length} entries)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Actor</th>
                <th className="p-3.5">Resource</th>
                <th className="p-3.5">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="p-3.5 text-slate-500 font-mono">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>

                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center gap-1 font-mono font-bold text-[10px] px-2 py-0.5 rounded ${
                        log.action.includes('APPROVED') || log.action.includes('PUBLISHED')
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : log.action.includes('SUBMITTED')
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {log.userName || 'System'}
                    </p>
                    <p className="text-[10px] text-slate-500">{log.userRole || 'Automated'}</p>
                  </td>

                  <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">
                    {log.resource}
                  </td>

                  <td className="p-3.5 text-slate-600 dark:text-slate-400">
                    {log.details ? JSON.stringify(log.details) : '—'}
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
