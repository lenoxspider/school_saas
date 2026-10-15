import React from 'react';
import Link from 'next/link';
import { requireTenant } from '@/lib/auth/guards';
import { db } from '@/lib/db';
import {
  GraduationCap,
  Users,
  Building2,
  Calendar,
  Calculator,
  CheckCircle2,
  FileSpreadsheet,
  ArrowRight,
  Clock,
  AlertCircle,
  FileText,
  TrendingUp,
} from 'lucide-react';

export default async function TenantDashboardPage() {
  const { user, schoolId } = await requireTenant();

  const school = db.getSchoolById(schoolId);
  const students = db.getStudents(schoolId);
  const teachers = db.getUsers(schoolId).filter((u) => u.role === 'TEACHER');
  const classes = db.getClasses(schoolId);
  const currentAy = db.getCurrentAcademicYear(schoolId);
  const currentTerm = db.getCurrentTerm(schoolId);
  const submissions = db.getSubmissions(schoolId);
  const auditLogs = db.getAuditLogs(schoolId, 5);

  const pendingSubmissions = submissions.filter((s) => s.status === 'SUBMITTED' || s.status === 'UNDER_REVIEW');
  const approvedSubmissions = submissions.filter((s) => s.status === 'APPROVED' || s.status === 'PUBLISHED');

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Welcome back, {user.firstName}!
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {school?.name} • {currentAy?.name || 'Academic Session'} •{' '}
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {currentTerm?.name || 'Term 2'} (Active)
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/app/scores"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Calculator className="w-4 h-4" /> Open Score Entry
          </Link>
          <Link
            href="/app/reports"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" /> Generate Broadsheets
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Students</span>
            <GraduationCap className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {students.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Enrolled across {classes.length} classes</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Teaching Staff</span>
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {teachers.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Active subject teachers</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Approvals</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {pendingSubmissions.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {pendingSubmissions.length > 0 ? 'Awaiting administrative review' : 'All sheets up to date'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Published Results</span>
            <CheckCircle2 className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {approvedSubmissions.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Ready for PDF report card output</p>
        </div>
      </div>

      {/* Main Grid: Pending Action Items & Score Entry Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Academic Pipeline & Quick Entries */}
        <div className="lg:col-span-2 space-y-6">
          {/* Result Workflow Status Tracker */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" /> Academic Results Processing Pipeline
              </h3>
              <span className="text-xs text-slate-500">
                {currentTerm?.name || 'Active Term'}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 mb-6">
              <div className="p-2">
                <p className="text-xs font-semibold text-slate-500">1. Drafts</p>
                <p className="text-lg font-bold text-slate-700 dark:text-slate-300">
                  {submissions.filter((s) => s.status === 'DRAFT').length}
                </p>
              </div>
              <div className="p-2">
                <p className="text-xs font-semibold text-amber-600">2. Submitted</p>
                <p className="text-lg font-bold text-amber-600">
                  {submissions.filter((s) => s.status === 'SUBMITTED').length}
                </p>
              </div>
              <div className="p-2">
                <p className="text-xs font-semibold text-blue-600">3. Approved</p>
                <p className="text-lg font-bold text-blue-600">
                  {submissions.filter((s) => s.status === 'APPROVED').length}
                </p>
              </div>
              <div className="p-2">
                <p className="text-xs font-semibold text-emerald-600">4. Published</p>
                <p className="text-lg font-bold text-emerald-600">
                  {submissions.filter((s) => s.status === 'PUBLISHED').length}
                </p>
              </div>
            </div>

            {/* Submissions List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Recent Score Submissions
              </h4>
              {submissions.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No score submissions recorded yet.
                </p>
              ) : (
                submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {sub.subject.name} — {sub.class.name}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {sub.term.name} • Updated {new Date(sub.updatedAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          sub.status === 'PUBLISHED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : sub.status === 'APPROVED'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                            : sub.status === 'SUBMITTED'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {sub.status}
                      </span>
                      <Link
                        href={`/app/scores/${sub.id}`}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View Grid →
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Actions & Audit Trail */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Quick Actions</h3>

            <Link
              href="/app/students/import"
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-400 hover:bg-blue-50/30 transition-all text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                CSV / Excel Student Import
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              href="/app/scores"
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-400 hover:bg-blue-50/30 transition-all text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <span className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-600" />
                Continuous Assessment Entry
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              href="/app/reports"
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-400 hover:bg-blue-50/30 transition-all text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <span className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-purple-600" />
                Bulk PDF Report Cards & Broadsheets
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>

          {/* Audit Logs Widget */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Activity</h3>
              <Link href="/app/audit" className="text-xs text-blue-600 hover:underline font-semibold">
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div key={log.id} className="text-xs border-l-2 border-blue-500 pl-3 py-1">
                  <p className="font-semibold text-slate-900 dark:text-white">{log.action}</p>
                  <p className="text-slate-500 text-[11px]">
                    By {log.userName || 'System'} • {new Date(log.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
