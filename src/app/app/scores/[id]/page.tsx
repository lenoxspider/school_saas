import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireTenant } from '@/lib/auth/guards';
import { db } from '@/lib/db';
import { ScoreEntryContainer } from './ScoreEntryContainer';
import { ArrowLeft, BookOpen, School, Calendar } from 'lucide-react';

export default async function ScoreEntryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { schoolId, user } = await requireTenant();
  const { id: submissionId } = await params;

  const submissions = db.getSubmissions(schoolId);
  const submission = submissions.find((s) => s.id === submissionId);

  if (!submission) {
    notFound();
  }

  const gradingSystem = db.getDefaultGradingSystem(schoolId);
  const enrollments = db.getEnrollmentsByClass(schoolId, submission.classId);
  const initialRecords = db.getScoreRecords(schoolId, submission.id);

  const isReadOnly =
    submission.status === 'PUBLISHED' ||
    (submission.status === 'APPROVED' && user.role === 'TEACHER') ||
    (submission.status === 'SUBMITTED' && user.role === 'TEACHER');

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/app/scores"
              className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Score Selector
            </Link>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {submission.subject.name} Score Sheet
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Class: <span className="font-semibold text-slate-800 dark:text-slate-200">{submission.class.name}</span> • Term:{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">{submission.term.name}</span> • Grading Model:{' '}
            <span className="font-semibold text-blue-600 dark:text-blue-400">{gradingSystem.name}</span>
          </p>
        </div>
      </div>

      {/* Interactive Grid Container */}
      <ScoreEntryContainer
        submission={submission}
        components={gradingSystem.components}
        gradeBands={gradingSystem.gradeBands}
        enrollments={enrollments}
        initialRecords={initialRecords}
        isReadOnly={isReadOnly}
      />
    </div>
  );
}
