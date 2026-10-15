'use client';

import React, { useState } from 'react';
import { AuditLog, School } from '@/types';
import { Search } from 'lucide-react';

interface Props {
  initialLogs: AuditLog[];
  schools: School[];
}

export function GlobalAuditTableClient({ initialLogs, schools }: Props) {
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('ALL');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const schoolMap = new Map(schools.map((s) => [s.id, s.name]));

  const filteredLogs = initialLogs.filter((log) => {
    if (selectedSchoolId !== 'ALL' && log.schoolId !== selectedSchoolId) return false;
    if (selectedAction !== 'ALL' && log.action !== selectedAction) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchAction = log.action.toLowerCase().includes(term);
      const matchActor = (log.userName || '').toLowerCase().includes(term);
      const matchResource = log.resource.toLowerCase().includes(term);
      const matchSchool = log.schoolId ? (schoolMap.get(log.schoolId) || '').toLowerCase().includes(term) : false;
      if (!matchAction && !matchActor && !matchResource && !matchSchool) return false;
    }
    return true;
  });

  const uniqueActions = Array.from(new Set(initialLogs.map((l) => l.action)));

  return (
    <div className="space-y-4">
      {/* Filter and Search Bar */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* School Selector */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Filter by School Tenant
            </label>
            <select
              value={selectedSchoolId}
              onChange={(e) => setSelectedSchoolId(e.target.value)}
              className="text-xs px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-white font-medium"
            >
              <option value="ALL">All School Tenants ({schools.length})</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* Action Selector */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Event Action
            </label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="text-xs px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-white font-medium"
            >
              <option value="ALL">All Actions ({uniqueActions.length})</option>
              {uniqueActions.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Text Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search action, actor, resource..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Global Logs Table */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/40">
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">School Tenant</th>
                <th className="p-3.5">Action Event</th>
                <th className="p-3.5">Actor (Role)</th>
                <th className="p-3.5">Resource ID</th>
                <th className="p-3.5">Event Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No matching audit entries found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const schoolName = log.schoolId ? schoolMap.get(log.schoolId) || log.schoolId : 'Platform Global';

                  return (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>

                      <td className="p-3.5">
                        <span className="font-semibold text-white">{schoolName}</span>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 font-mono font-bold text-[10px] px-2 py-0.5 rounded ${
                            log.action.includes('APPROVED') || log.action.includes('PUBLISHED')
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : log.action.includes('SUBMITTED')
                              ? 'bg-blue-950 text-blue-300 border border-blue-800'
                              : log.action.includes('LOGIN')
                              ? 'bg-purple-950 text-purple-300 border border-purple-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <p className="font-semibold text-white">{log.userName || 'System'}</p>
                        <p className="text-[10px] text-slate-500">{log.userRole || 'Automated'}</p>
                      </td>

                      <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                        {log.resource}
                      </td>

                      <td className="p-3.5 font-mono text-[11px] text-slate-400 max-w-[240px] truncate">
                        {log.details ? JSON.stringify(log.details) : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
