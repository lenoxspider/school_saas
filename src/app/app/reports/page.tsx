import React from 'react';
import { requireTenant } from '@/lib/auth/guards';
import { db } from '@/lib/db';
import { ReportsExplorerClient } from './ReportsExplorerClient';
import { FileSpreadsheet, Download, FileText, CheckCircle2 } from 'lucide-react';

export default async function ReportsPage() {
  const { schoolId } = await requireTenant();

  const school = db.getSchoolById(schoolId);
  const classes = db.getClasses(schoolId);
  const terms = db.getTerms(schoolId);
  const subjects = db.getSubjects(schoolId);
  const currentTerm = db.getCurrentTerm(schoolId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Reports, Broadsheets & Transcripts
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Generate class broadsheets with competition rankings, export formatted Excel workbooks,
          and download bulk PDF report card ZIP archives with deterministic filenames.
        </p>
      </div>

      <ReportsExplorerClient
        school={school!}
        classes={classes}
        terms={terms}
        subjects={subjects}
        defaultTermId={currentTerm?.id || terms[0]?.id || ''}
      />
    </div>
  );
}
