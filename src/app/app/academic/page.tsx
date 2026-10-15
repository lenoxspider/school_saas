import React from 'react';
import { requireSchoolAdmin } from '@/lib/auth/guards';
import { db } from '@/lib/db';
import { Calendar, Layers, BookOpen, Sliders, CheckCircle2 } from 'lucide-react';

export default async function AcademicStructurePage() {
  const { schoolId } = await requireSchoolAdmin();

  const academicYears = db.getAcademicYears(schoolId);
  const terms = db.getTerms(schoolId);
  const classes = db.getClasses(schoolId);
  const subjects = db.getSubjects(schoolId);
  const gradingSystem = db.getDefaultGradingSystem(schoolId);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Academic Structure & Grading Settings
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Configure academic calendar sessions, terms, grade arms, subjects, and dynamic grading
          component weights.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Academic Years & Terms */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Academic Years & Terms
            </h3>
          </div>

          <div className="space-y-3">
            {academicYears.map((ay) => (
              <div
                key={ay.id}
                className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {ay.name}
                  </span>
                  {ay.isCurrent && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      Active Session
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {ay.startDate} to {ay.endDate}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex flex-wrap gap-2">
                  {terms
                    .filter((t) => t.academicYearId === ay.id)
                    .map((term) => (
                      <span
                        key={term.id}
                        className={`text-[11px] px-2.5 py-1 rounded-md font-medium border ${
                          term.isCurrent
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {term.name} {term.isCurrent ? '• Current' : ''}
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Classes & Arms */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Layers className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Classes & Arms</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {classes.map((cls) => {
              const enrollments = db.getEnrollmentsByClass(schoolId, cls.id);
              return (
                <div
                  key={cls.id}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40"
                >
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{cls.name}</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Level {cls.level} • {enrollments.length} Students
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Subjects */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <BookOpen className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Curriculum & Subjects
            </h3>
          </div>

          <div className="space-y-2">
            {subjects.map((subj) => (
              <div
                key={subj.id}
                className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {subj.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 ml-2">[{subj.code}]</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    subj.isCore
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800'
                  }`}
                >
                  {subj.isCore ? 'Core Subject' : 'Elective'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Configurable Grading Engine */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Sliders className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Grading Scheme & Assessment Weights
            </h3>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
              <p className="text-xs font-bold text-blue-900 dark:text-blue-300">
                {gradingSystem.name}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {gradingSystem.components.map((c) => (
                  <div
                    key={c.code}
                    className="p-2 rounded bg-white dark:bg-slate-900 text-xs font-medium border border-blue-200 dark:border-blue-800"
                  >
                    <span className="font-bold">{c.name}</span>
                    <span className="block text-[11px] text-slate-500">
                      Weight: {c.weight}% (Max: {c.maxScore})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Configured Grade Bands
              </p>
              <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                      <th className="p-2">Grade</th>
                      <th className="p-2">Score Range</th>
                      <th className="p-2">Remark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {gradingSystem.gradeBands.map((b) => (
                      <tr key={b.grade}>
                        <td className="p-2 font-bold">{b.grade} ({b.label})</td>
                        <td className="p-2 font-mono">{b.minScore}% – {b.maxScore}%</td>
                        <td className="p-2 text-slate-600 dark:text-slate-400">{b.remark}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
