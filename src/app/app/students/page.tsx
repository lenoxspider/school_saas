import React from 'react';
import Link from 'next/link';
import { requireTenant } from '@/lib/auth/guards';
import { db } from '@/lib/db';
import { GraduationCap, Upload, Plus, Search, Filter, Phone, Mail, UserCheck } from 'lucide-react';

export default async function StudentsRosterPage() {
  const { schoolId } = await requireTenant();

  const students = db.getStudents(schoolId);
  const classes = db.getClasses(schoolId);
  const currentAy = db.getCurrentAcademicYear(schoolId);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Student Registry</h2>
          <p className="text-xs text-slate-500 mt-1">
            Total {students.length} active students enrolled for{' '}
            <span className="font-semibold text-blue-600">{currentAy?.name || 'Current Session'}</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/app/students/import"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 rounded-lg text-xs font-semibold border border-blue-200 dark:border-blue-800 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" /> CSV / Excel Import
          </Link>
        </div>
      </div>

      {/* Class Overview Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {classes.map((cls) => {
          const enrollments = db.getEnrollmentsByClass(schoolId, cls.id);
          return (
            <div
              key={cls.id}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shadow-xs"
            >
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{cls.name}</p>
                <p className="text-[11px] text-slate-500">{enrollments.length} Students</p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                L{cls.level}
              </span>
            </div>
          );
        })}
      </div>

      {/* Student List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Enrolled Students Directory
          </h3>
          <span className="text-xs text-slate-400 font-medium">{students.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                <th className="p-3 w-12 text-center">#</th>
                <th className="p-3">Admission No</th>
                <th className="p-3">Student Name</th>
                <th className="p-3 text-center">Gender</th>
                <th className="p-3">Guardian Name</th>
                <th className="p-3">Guardian Contact</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {students.map((student, idx) => (
                <tr
                  key={student.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="p-3 text-center text-slate-400">{idx + 1}</td>
                  <td className="p-3 font-mono font-medium text-slate-800 dark:text-slate-200">
                    {student.admissionNumber}
                  </td>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">
                    {student.lastName.toUpperCase()}, {student.firstName}{' '}
                    {student.otherNames || ''}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        student.gender === 'MALE'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300'
                      }`}
                    >
                      {student.gender === 'MALE' ? 'M' : 'F'}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">
                    {student.guardianName || '—'}
                  </td>
                  <td className="p-3 font-mono text-slate-600 dark:text-slate-400">
                    {student.guardianPhone || '—'}
                  </td>
                  <td className="p-3 text-center">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                      <UserCheck className="w-3 h-3" /> Active
                    </span>
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
