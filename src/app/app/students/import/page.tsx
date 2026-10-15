import React from 'react';
import Link from 'next/link';
import { requireTenant } from '@/lib/auth/guards';
import { db } from '@/lib/db';
import { StudentImportWizard } from '@/components/StudentImportWizard';
import { ArrowLeft, Upload, Users } from 'lucide-react';
import { StudentImportClientWrapper } from './StudentImportClientWrapper';

export default async function StudentImportPage() {
  const { schoolId } = await requireTenant();

  const classes = db.getClasses(schoolId);
  const academicYears = db.getAcademicYears(schoolId);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link
          href="/app/students"
          className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 font-medium transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Student Registry
        </Link>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Batch Student Import</h2>
        <p className="text-xs text-slate-500 mt-1">
          Upload spreadsheets, map columns, validate duplicate records, and bulk enroll students into
          classes without manual data entry.
        </p>
      </div>

      <StudentImportClientWrapper
        schoolId={schoolId}
        classes={classes}
        academicYears={academicYears}
      />
    </div>
  );
}
