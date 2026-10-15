'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AssessmentSubmission, Class, Subject, Term, SubmissionStatus } from '@/types';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  ArrowRight,
  RefreshCw,
  Eye,
  Lock,
} from 'lucide-react';

interface Props {
  submissions: (AssessmentSubmission & { class: Class; subject: Subject; term: Term })[];
}

export function ApprovalsListClient({ submissions }: Props) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>('ALL');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filtered = submissions.filter((s) => {
    if (filter === 'ALL') return true;
    return s.status === filter;
  });

  const handleStatusChange = async (
    submissionId: string,
    targetStatus: SubmissionStatus,
    rejectionReason?: string
  ) => {
    if (targetStatus === 'DRAFT') {
      const reason = prompt('Please enter the reason for rejecting this score sheet:');
      if (!reason) return;
      rejectionReason = reason;
    }

    if (targetStatus === 'PUBLISHED') {
      const confirmPub = window.confirm(
        'Publishing will generate immutable result snapshots for all students in this class. Are you sure you want to proceed?'
      );
      if (!confirmPub) return;
    }

    setProcessingId(submissionId);
    try {
      const res = await fetch('/api/scores/workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          targetStatus,
          rejectionReason,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(`Action failed: ${data.error}`);
        return;
      }

      router.refresh();
    } catch (err: unknown) {
      alert(`Workflow error: ${String(err)}`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {['ALL', 'SUBMITTED', 'APPROVED', 'PUBLISHED', 'DRAFT'].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === st
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            {st} ({st === 'ALL' ? submissions.length : submissions.filter((s) => s.status === st).length})
          </button>
        ))}
      </div>

      {/* Submissions Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No submissions found in this status.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                  <th className="p-3.5">Subject & Class</th>
                  <th className="p-3.5">Academic Session</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5">Timeline / Notes</th>
                  <th className="p-3.5 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((sub) => {
                  const isBusy = processingId === sub.id;

                  return (
                    <tr
                      key={sub.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-3.5">
                        <p className="font-bold text-slate-900 dark:text-white">
                          {sub.subject.name}
                        </p>
                        <p className="text-[11px] text-slate-500">{sub.class.name}</p>
                      </td>

                      <td className="p-3.5 text-slate-600 dark:text-slate-400">
                        {sub.term.name}
                      </td>

                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            sub.status === 'PUBLISHED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : sub.status === 'APPROVED'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                              : sub.status === 'SUBMITTED'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {sub.status === 'PUBLISHED' && <Lock className="w-3 h-3" />}
                          {sub.status}
                        </span>
                      </td>

                      <td className="p-3.5 text-slate-500">
                        {sub.rejectionReason ? (
                          <span className="text-red-500 font-medium">
                            Rejected: {sub.rejectionReason}
                          </span>
                        ) : sub.submittedAt ? (
                          <span>Submitted {new Date(sub.submittedAt).toLocaleDateString()}</span>
                        ) : (
                          <span>Last edited {new Date(sub.updatedAt).toLocaleDateString()}</span>
                        )}
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/app/scores/${sub.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 font-semibold"
                          >
                            <Eye className="w-3.5 h-3.5" /> Inspect Grid
                          </Link>

                          {sub.status === 'SUBMITTED' && (
                            <>
                              <button
                                disabled={isBusy}
                                onClick={() => handleStatusChange(sub.id, 'APPROVED')}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                              >
                                {isBusy ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-3 h-3" />
                                )}
                                Approve
                              </button>
                              <button
                                disabled={isBusy}
                                onClick={() => handleStatusChange(sub.id, 'DRAFT')}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-semibold"
                              >
                                <XCircle className="w-3 h-3" /> Reject
                              </button>
                            </>
                          )}

                          {sub.status === 'APPROVED' && (
                            <button
                              disabled={isBusy}
                              onClick={() => handleStatusChange(sub.id, 'PUBLISHED')}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
                            >
                              {isBusy ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <Lock className="w-3 h-3" />
                              )}
                              Publish Results
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
