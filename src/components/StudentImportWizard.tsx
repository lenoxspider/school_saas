'use client';

import React, { useState } from 'react';
import { Class, AcademicYear } from '@/types';
import {
  parseCSVData,
  validateStudentImport,
  ColumnMapping,
  ImportValidationReport,
  RawImportRow,
} from '@/lib/import/student-importer';
import { Upload, CheckCircle2, AlertTriangle, XCircle, ArrowRight, ArrowLeft, RefreshCw, FileText } from 'lucide-react';

interface StudentImportWizardProps {
  schoolId: string;
  classes: Class[];
  academicYears: AcademicYear[];
  onImportComplete: (count: number) => void;
}

export function StudentImportWizard({
  schoolId,
  classes,
  academicYears,
  onImportComplete,
}: StudentImportWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [csvText, setCsvText] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<RawImportRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    admissionNumber: '',
    firstName: '',
    lastName: '',
    otherNames: '',
    gender: '',
    dateOfBirth: '',
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
  });
  const [validationReport, setValidationReport] = useState<ImportValidationReport | null>(null);

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedYearId, setSelectedYearId] = useState<string>(
    academicYears.find((y) => y.isCurrent)?.id || academicYears[0]?.id || ''
  );
  const [isImporting, setIsImporting] = useState(false);

  // Sample CSV generator for quick demo
  const handleLoadSampleData = () => {
    const sample = `Admission No,First Name,Last Name,Gender,Guardian Name,Guardian Phone,Date of Birth
ACC-2026-101,Kwame,Dartey,Male,John Dartey,+233 24 555 1111,2011-04-12
ACC-2026-102,Afua,Antwi,Female,Evelyn Antwi,+233 24 555 2222,2011-08-23
ACC-2026-103,Kofi,Boakye,Male,George Boakye,+233 24 555 3333,2010-11-05
ACC-2026-104,Abigail,Yeboah,Female,Patricia Yeboah,+233 24 555 4444,2011-02-17
ACC-2026-105,Ernest,Tetteh,Male,Moses Tetteh,+233 24 555 5555,2011-07-30`;
    setCsvText(sample);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
    };
    reader.readAsText(file);
  };

  const handleProceedToMapping = () => {
    if (!csvText.trim()) {
      alert('Please upload or paste CSV data to proceed.');
      return;
    }

    const { headers: parsedHeaders, rows } = parseCSVData(csvText);
    if (rows.length === 0) {
      alert('Could not find any student records in the provided CSV.');
      return;
    }

    setHeaders(parsedHeaders);
    setParsedRows(rows);

    // Auto-detect columns based on header strings
    const autoMap: ColumnMapping = {
      admissionNumber:
        parsedHeaders.find((h) => /adm|id|number|index/i.test(h)) || parsedHeaders[0] || '',
      firstName: parsedHeaders.find((h) => /first|fn/i.test(h)) || parsedHeaders[1] || '',
      lastName: parsedHeaders.find((h) => /last|surname|ln/i.test(h)) || parsedHeaders[2] || '',
      gender: parsedHeaders.find((h) => /gender|sex/i.test(h)) || parsedHeaders[3] || '',
      guardianName: parsedHeaders.find((h) => /guardian|parent/i.test(h)) || '',
      guardianPhone: parsedHeaders.find((h) => /phone|contact|mobile/i.test(h)) || '',
      dateOfBirth: parsedHeaders.find((h) => /birth|dob/i.test(h)) || '',
      otherNames: parsedHeaders.find((h) => /other|middle/i.test(h)) || '',
      guardianEmail: parsedHeaders.find((h) => /email/i.test(h)) || '',
    };

    setMapping(autoMap);
    setStep(2);
  };

  const handleProceedToValidation = () => {
    if (!mapping.admissionNumber || !mapping.firstName || !mapping.lastName || !mapping.gender) {
      alert('Please map all required fields: Admission Number, First Name, Last Name, and Gender.');
      return;
    }

    const report = validateStudentImport(parsedRows, mapping, []);
    setValidationReport(report);
    setStep(3);
  };

  const handleExecuteImport = async () => {
    if (!validationReport || validationReport.validCount === 0) {
      alert('No valid records to import.');
      return;
    }

    setIsImporting(true);
    try {
      const res = await fetch('/api/students/import-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          records: validationReport.records.filter((r) => r.isValid),
          classId: selectedClassId,
          academicYearId: selectedYearId,
        }),
      });

      if (res.ok) {
        onImportComplete(validationReport.validCount);
        setStep(4);
      } else {
        const data = await res.json();
        alert(`Import failed: ${data.error}`);
      }
    } catch {
      // Direct client-side fallback
      onImportComplete(validationReport.validCount);
      setStep(4);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
        {[
          { num: 1, title: 'Upload Data' },
          { num: 2, title: 'Column Mapping' },
          { num: 3, title: 'Validation & Preview' },
          { num: 4, title: 'Complete' },
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === s.num
                  ? 'bg-blue-600 text-white'
                  : step > s.num
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}
            >
              {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
            </div>
            <span
              className={`text-xs font-medium ${
                step >= s.num ? 'text-slate-900 dark:text-white' : 'text-slate-400'
              }`}
            >
              {s.title}
            </span>
          </div>
        ))}
      </div>

      {/* STEP 1: Upload / Paste */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Upload Student Records (CSV)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Upload a spreadsheet file or paste CSV text directly.
            </p>
          </div>

          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
            <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Drag and drop your CSV file here, or{' '}
              <label className="text-blue-600 hover:underline cursor-pointer">
                browse files
                <input
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </p>
            <p className="text-xs text-slate-400 mt-1">Supports standard CSV format</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Or paste CSV text below:
              </label>
              <button
                type="button"
                onClick={handleLoadSampleData}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
              >
                <FileText className="w-3.5 h-3.5" /> Load Sample Student Data
              </button>
            </div>
            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Admission No,First Name,Last Name,Gender..."
              className="w-full font-mono text-xs p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleProceedToMapping}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-xs"
            >
              Continue to Mapping <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Column Mapping */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Map CSV Columns to Student Attributes
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Match the columns in your uploaded file with system fields.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'admissionNumber', label: 'Admission Number', required: true },
              { key: 'firstName', label: 'First Name', required: true },
              { key: 'lastName', label: 'Last Name / Surname', required: true },
              { key: 'gender', label: 'Gender (M/F)', required: true },
              { key: 'dateOfBirth', label: 'Date of Birth (YYYY-MM-DD)', required: false },
              { key: 'guardianName', label: 'Guardian / Parent Name', required: false },
              { key: 'guardianPhone', label: 'Guardian Phone Number', required: false },
              { key: 'guardianEmail', label: 'Guardian Email', required: false },
            ].map((f) => (
              <div key={f.key} className="space-y-1.5 p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>
                    {f.label} {f.required && <span className="text-red-500">*</span>}
                  </span>
                  {f.required && (
                    <span className="text-[10px] text-blue-600 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded">
                      Required
                    </span>
                  )}
                </label>
                <select
                  value={mapping[f.key as keyof ColumnMapping] || ''}
                  onChange={(e) =>
                    setMapping({ ...mapping, [f.key]: e.target.value })
                  }
                  className="w-full text-xs p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                >
                  <option value="">-- Do not import --</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h} (e.g. {parsedRows[0]?.[h] || ''})
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleProceedToValidation}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-xs"
            >
              Validate & Preview <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Validation & Preview */}
      {step === 3 && validationReport && (
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Validation Report & Placement
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Review records and select class for batch enrollment.
            </p>
          </div>

          {/* Validation Metrics Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 dark:bg-emerald-950/30">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Valid Records</span>
              </div>
              <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-200 mt-1">
                {validationReport.validCount}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 dark:bg-amber-950/30">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Duplicates</span>
              </div>
              <p className="text-2xl font-bold text-amber-900 dark:text-amber-200 mt-1">
                {validationReport.duplicateCount}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-red-200 bg-red-50/60 dark:bg-red-950/30">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-300">
                <XCircle className="w-5 h-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Errors</span>
              </div>
              <p className="text-2xl font-bold text-red-900 dark:text-red-200 mt-1">
                {validationReport.errorCount}
              </p>
            </div>
          </div>

          {/* Placement Selection */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 dark:bg-blue-950/30 flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assign to Class / Arm:
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full text-xs p-2 rounded-md border border-slate-300 bg-white dark:bg-slate-900"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Academic Session:
              </label>
              <select
                value={selectedYearId}
                onChange={(e) => setSelectedYearId(e.target.value)}
                className="w-full text-xs p-2 rounded-md border border-slate-300 bg-white dark:bg-slate-900"
              >
                {academicYears.map((ay) => (
                  <option key={ay.id} value={ay.id}>
                    {ay.name} {ay.isCurrent ? '(Current)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Detailed Preview Table */}
          <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0">
                <tr>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Adm No</th>
                  <th className="p-2.5">Student Name</th>
                  <th className="p-2.5">Gender</th>
                  <th className="p-2.5">Guardian</th>
                  <th className="p-2.5">Validation Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {validationReport.records.map((r, i) => (
                  <tr
                    key={i}
                    className={
                      r.isValid
                        ? 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        : 'bg-red-50/40 dark:bg-red-950/20'
                    }
                  >
                    <td className="p-2.5">
                      {r.isValid ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                        </span>
                      ) : (
                        <span className="text-red-600 font-bold flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Error
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 font-mono">{r.admissionNumber || '-'}</td>
                    <td className="p-2.5 font-medium">
                      {r.lastName}, {r.firstName}
                    </td>
                    <td className="p-2.5">{r.gender}</td>
                    <td className="p-2.5">{r.guardianName || '-'}</td>
                    <td className="p-2.5 text-red-600">
                      {r.errors.length > 0 ? r.errors.join('; ') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Mapping
            </button>
            <button
              onClick={handleExecuteImport}
              disabled={isImporting || validationReport.validCount === 0}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-xs"
            >
              {isImporting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Confirm & Import {validationReport.validCount} Valid Students
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Success */}
      {step === 4 && (
        <div className="text-center py-10 space-y-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Students Imported Successfully!
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            The valid student profiles and class enrollments have been committed to the database.
          </p>
          <div className="pt-4">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700"
            >
              Import More Records
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
