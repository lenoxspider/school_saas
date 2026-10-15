'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  AssessmentSubmission,
  AssessmentComponent,
  GradeBand,
  ScoreRecord,
  Student,
  ClassEnrollment,
} from '@/types';
import { calculateSubjectTotal, resolveGradeAndRemark, validateComponentScore } from '@/lib/engine/grading';
import { Save, Send, AlertCircle, CheckCircle2, RefreshCw, Lock } from 'lucide-react';

interface ScoreEntryRow {
  enrollmentId: string;
  student: Student;
  rollNumber?: string;
  scores: Record<string, number | null>;
  totalScore: number | null;
  grade: string | null;
  remark: string | null;
  errors: Record<string, string | undefined>;
}

interface ScoreEntryGridProps {
  submission: AssessmentSubmission;
  components: AssessmentComponent[];
  gradeBands: GradeBand[];
  enrollments: (ClassEnrollment & { student: Student })[];
  initialRecords: ScoreRecord[];
  isReadOnly?: boolean;
  onSave: (records: { enrollmentId: string; rawScores: Record<string, number | null> }[]) => Promise<void>;
  onSubmitForReview: () => Promise<void>;
}

export function ScoreEntryGrid({
  submission,
  components,
  gradeBands,
  enrollments,
  initialRecords,
  isReadOnly = false,
  onSave,
  onSubmitForReview,
}: ScoreEntryGridProps) {
  const [rows, setRows] = useState<ScoreEntryRow[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [activeCell, setActiveCell] = useState<{ rowIdx: number; compCode: string } | null>(null);

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Initialize rows from enrollments and initial records
  useEffect(() => {
    const recordsMap = new Map(initialRecords.map((r) => [r.enrollmentId, r]));

    const formattedRows: ScoreEntryRow[] = enrollments.map((enr) => {
      const existing = recordsMap.get(enr.id);
      const rawScores: Record<string, number | null> = {};

      components.forEach((c) => {
        rawScores[c.code] = existing?.rawScores[c.code] ?? null;
      });

      const { totalScore } = calculateSubjectTotal(rawScores, components);
      const { grade, remark } = resolveGradeAndRemark(totalScore, gradeBands);

      return {
        enrollmentId: enr.id,
        student: enr.student,
        rollNumber: enr.rollNumber,
        scores: rawScores,
        totalScore,
        grade,
        remark,
        errors: {},
      };
    });

    setRows(formattedRows);
  }, [enrollments, initialRecords, components, gradeBands]);

  const handleScoreChange = (rowIdx: number, compCode: string, valueStr: string) => {
    if (isReadOnly) return;

    const component = components.find((c) => c.code === compCode)!;
    const trimmed = valueStr.trim();
    let numVal: number | null = null;
    let error: string | undefined = undefined;

    if (trimmed !== '') {
      const parsed = parseFloat(trimmed);
      const validation = validateComponentScore(parsed, component);
      if (!validation.isValid) {
        error = validation.error;
      }
      numVal = isNaN(parsed) ? null : parsed;
    }

    setRows((prev) => {
      const next = [...prev];
      const row = { ...next[rowIdx] };
      row.scores = { ...row.scores, [compCode]: numVal };
      row.errors = { ...row.errors, [compCode]: error };

      // Recalculate totals
      const { totalScore } = calculateSubjectTotal(row.scores, components);
      const { grade, remark } = resolveGradeAndRemark(totalScore, gradeBands);
      row.totalScore = totalScore;
      row.grade = grade;
      row.remark = remark;

      next[rowIdx] = row;
      return next;
    });

    setSaveStatus('idle');
  };

  // Keyboard navigation handler (Arrows, Tab, Enter)
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIdx: number,
    compIdx: number
  ) => {
    const compCode = components[compIdx].code;
    const totalRows = rows.length;
    const totalComps = components.length;

    let targetRow = rowIdx;
    let targetComp = compIdx;

    if (e.key === 'ArrowDown' || e.key === 'Enter') {
      e.preventDefault();
      if (rowIdx < totalRows - 1) {
        targetRow = rowIdx + 1;
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (rowIdx > 0) {
        targetRow = rowIdx - 1;
      }
    } else if (e.key === 'ArrowRight' && e.currentTarget.selectionStart === e.currentTarget.value.length) {
      if (compIdx < totalComps - 1) {
        e.preventDefault();
        targetComp = compIdx + 1;
      }
    } else if (e.key === 'ArrowLeft' && e.currentTarget.selectionStart === 0) {
      if (compIdx > 0) {
        e.preventDefault();
        targetComp = compIdx - 1;
      }
    } else if (e.key === 'Tab') {
      // Natural Tab handles movement, but let's ensure focus wrapping
      if (!e.shiftKey && compIdx === totalComps - 1 && rowIdx < totalRows - 1) {
        e.preventDefault();
        targetRow = rowIdx + 1;
        targetComp = 0;
      } else if (e.shiftKey && compIdx === 0 && rowIdx > 0) {
        e.preventDefault();
        targetRow = rowIdx - 1;
        targetComp = totalComps - 1;
      }
    }

    if (targetRow !== rowIdx || targetComp !== compIdx) {
      const targetCode = components[targetComp].code;
      const refKey = `${targetRow}_${targetCode}`;
      inputRefs.current[refKey]?.focus();
      inputRefs.current[refKey]?.select();
    }
  };

  const handleManualSave = async () => {
    setIsSaving(true);
    setSaveStatus('saving');
    try {
      const payload = rows.map((r) => ({
        enrollmentId: r.enrollmentId,
        rawScores: r.scores,
      }));
      await onSave(payload);
      setSaveStatus('saved');
      setStatusMessage('Scores saved successfully.');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err: unknown) {
      setSaveStatus('error');
      setStatusMessage(`Save failed: ${String(err)}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    // Check if any error exists in grid
    const hasErrors = rows.some((r) => Object.values(r.errors).some((e) => !!e));
    if (hasErrors) {
      alert('Please fix all invalid scores before submitting.');
      return;
    }

    // Check for missing scores
    const missingCount = rows.filter((r) =>
      components.some((c) => r.scores[c.code] === null || r.scores[c.code] === undefined)
    ).length;

    if (missingCount > 0) {
      const confirmSubmit = window.confirm(
        `There are ${missingCount} students with incomplete scores. Are you sure you want to submit this sheet for administrative approval?`
      );
      if (!confirmSubmit) return;
    }

    await handleManualSave();
    await onSubmitForReview();
  };

  const missingScoresTotal = rows.reduce((count, r) => {
    const missingInRow = components.some((c) => r.scores[c.code] === null || r.scores[c.code] === undefined);
    return count + (missingInRow ? 1 : 0);
  }, 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Control Action Bar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              submission.status === 'PUBLISHED'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                : submission.status === 'APPROVED'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                : submission.status === 'SUBMITTED'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {isReadOnly ? <Lock className="w-3.5 h-3.5" /> : null}
            Status: {submission.status}
          </span>

          {missingScoresTotal > 0 ? (
            <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
              <AlertCircle className="w-4 h-4" /> {missingScoresTotal} student(s) with incomplete scores
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4" /> All scores complete
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {saveStatus === 'saved' && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium animate-fade-in flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {statusMessage}
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {statusMessage}
            </span>
          )}

          {!isReadOnly && (
            <>
              <button
                onClick={handleManualSave}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors shadow-xs"
              >
                {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Draft
              </button>

              <button
                onClick={handleSubmit}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                Submit for Approval
              </button>
            </>
          )}
        </div>
      </div>

      {/* Spreadsheet Table Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100/75 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <th className="p-3 w-12 text-center">#</th>
              <th className="p-3 w-28">Adm No</th>
              <th className="p-3 min-w-[200px]">Student Name</th>
              <th className="p-3 w-16 text-center">Gender</th>

              {components.map((comp) => (
                <th key={comp.code} className="p-3 w-32 text-center">
                  <div className="font-bold">{comp.name}</div>
                  <div className="text-[11px] font-normal text-slate-500">
                    Max: {comp.maxScore} (Weight: {comp.weight}%)
                  </div>
                </th>
              ))}

              <th className="p-3 w-24 text-center font-bold text-slate-900 dark:text-white bg-blue-50/50 dark:bg-blue-950/30">
                Total (100)
              </th>
              <th className="p-3 w-20 text-center font-bold text-slate-900 dark:text-white bg-blue-50/50 dark:bg-blue-950/30">
                Grade
              </th>
              <th className="p-3 min-w-[140px]">Remark</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((row, rowIdx) => (
              <tr
                key={row.enrollmentId}
                className={`transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40 ${
                  rowIdx % 2 === 1 ? 'bg-slate-50/30 dark:bg-slate-900/30' : ''
                }`}
              >
                <td className="p-2.5 text-center text-xs text-slate-400">
                  {row.rollNumber || rowIdx + 1}
                </td>
                <td className="p-2.5 text-xs font-mono text-slate-600 dark:text-slate-400">
                  {row.student.admissionNumber}
                </td>
                <td className="p-2.5 font-medium text-slate-900 dark:text-white">
                  {row.student.lastName.toUpperCase()}, {row.student.firstName}
                </td>
                <td className="p-2.5 text-center text-xs text-slate-500">
                  {row.student.gender === 'MALE' ? 'M' : 'F'}
                </td>

                {components.map((comp, compIdx) => {
                  const val = row.scores[comp.code];
                  const hasError = !!row.errors[comp.code];
                  const refKey = `${rowIdx}_${comp.code}`;

                  return (
                    <td key={comp.code} className="p-1.5 text-center">
                      <div className="relative">
                        <input
                          ref={(el) => {
                            inputRefs.current[refKey] = el;
                          }}
                          type="number"
                          step="0.5"
                          min="0"
                          max={comp.maxScore}
                          disabled={isReadOnly}
                          value={val !== null && val !== undefined ? val : ''}
                          placeholder="-"
                          onFocus={() => setActiveCell({ rowIdx, compCode: comp.code })}
                          onChange={(e) => handleScoreChange(rowIdx, comp.code, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, rowIdx, compIdx)}
                          className={`w-full text-center px-2 py-1.5 rounded-md border text-sm font-semibold transition-all outline-none ${
                            hasError
                              ? 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-700'
                              : activeCell?.rowIdx === rowIdx && activeCell?.compCode === comp.code
                              ? 'border-blue-600 ring-2 ring-blue-100 dark:ring-blue-900 bg-white dark:bg-slate-800 text-slate-900 dark:text-white'
                              : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200 hover:border-slate-300'
                          }`}
                        />
                        {hasError && (
                          <div className="absolute left-1/2 -translate-x-1/2 -top-8 z-20 whitespace-nowrap bg-red-600 text-white text-[10px] px-2 py-0.5 rounded shadow-lg">
                            {row.errors[comp.code]}
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}

                <td className="p-2.5 text-center font-bold text-slate-900 dark:text-white bg-blue-50/30 dark:bg-blue-950/20">
                  {row.totalScore !== null ? row.totalScore.toFixed(1) : '-'}
                </td>
                <td className="p-2.5 text-center font-bold text-blue-600 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-950/20">
                  {row.grade || '-'}
                </td>
                <td className="p-2.5 text-xs text-slate-600 dark:text-slate-400">
                  {row.remark || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
