import React from 'react';
import { requireSchoolAdmin } from '@/lib/auth/guards';
import { db } from '@/lib/db';
import { ApprovalsListClient } from './ApprovalsListClient';
import { CheckCircle2, AlertCircle, Clock, Send } from 'lucide-react';

export default async function ApprovalsPage() {
  const { schoolId } = await requireSchoolAdmin();

  const submissions = db.getSubmissions(schoolId);
  const currentTerm = db.getCurrentTerm(schoolId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Score Approvals & Publication Queue
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Review teacher score submissions, reject with feedback, or approve & publish terminal
          results to lock in snapshot records for{' '}
          <span className="font-semibold text-blue-600">{currentTerm?.name || 'Active Term'}</span>.
        </p>
      </div>

      <ApprovalsListClient submissions={submissions} />
    </div>
  );
}
