import React from 'react';
import Link from 'next/link';
import { requireTenant } from '@/lib/auth/guards';
import { db } from '@/lib/db';
import { Calculator, ArrowRight, CheckCircle2, Clock, Lock } from 'lucide-react';

export default async function ScoreEntrySelectorPage() {
  const { schoolId, user } = await requireTenant();

  const classes = db.getClasses(schoolId);
  const subjects = db.getSubjects(schoolId);
  const currentTerm = db.getCurrentTerm(schoolId);
  const teacherAssignments = db.getTeacherAssignments(schoolId, user.role === 'TEACHER' ? user.id : undefined);

  // Filter classes & subjects if teacher
  const allowedClassIds = new Set(
    user.role === 'TEACHER' ? teacherAssignments.map((ta) => ta.classId) : classes.map((c) => c.id)
  );

  const availableClasses = classes.filter((c) => allowedClassIds.has(c.id));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Score Entry Hub</h2>
        <p className="text-xs text-slate-500 mt-1">
          Select a class and subject to open the rapid spreadsheet score entry grid for{' '}
          <span className="font-semibold text-blue-600">{currentTerm?.name || 'Active Term'}</span>.
        </p>
      </div>

      <div className="space-y-8">
        {availableClasses.map((cls) => {
          const enrollments = db.getEnrollmentsByClass(schoolId, cls.id);

          return (
            <div
              key={cls.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs"
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{cls.name}</h3>
                  <p className="text-xs text-slate-500">{enrollments.length} enrolled students</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full">
                  Level {cls.level}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map((subj) => {
                  const isAssigned =
                    user.role !== 'TEACHER' ||
                    teacherAssignments.some(
                      (ta) =>
                        ta.classId === cls.id && (ta.subjectId === subj.id || ta.isClassTeacher)
                    );

                  if (!isAssigned) return null;

                  const sub = db.getOrCreateSubmission(
                    schoolId,
                    currentTerm?.id || '',
                    cls.id,
                    subj.id
                  );
                  const records = db.getScoreRecords(schoolId, sub.id);
                  const completeCount = records.filter(
                    (r) => r.totalScore !== null && r.totalScore !== undefined
                  ).length;

                  return (
                    <div
                      key={subj.id}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {subj.name}
                          </p>
                          <p className="text-[11px] font-mono text-slate-500">{subj.code}</p>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            sub.status === 'PUBLISHED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : sub.status === 'APPROVED'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                              : sub.status === 'SUBMITTED'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                              : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60 dark:border-slate-800">
                        <span className="text-slate-500">
                          {completeCount} / {enrollments.length} entered
                        </span>
                        <Link
                          href={`/app/scores/${sub.id}`}
                          className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Open Grid <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
