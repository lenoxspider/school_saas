'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AssessmentSubmission,
  AssessmentComponent,
  GradeBand,
  ScoreRecord,
  Student,
  ClassEnrollment,
} from '@/types';
import { ScoreEntryGrid } from '@/components/ScoreEntryGrid';

interface ScoreEntryContainerProps {
  submission: AssessmentSubmission;
  components: AssessmentComponent[];
  gradeBands: GradeBand[];
  enrollments: (ClassEnrollment & { student: Student })[];
  initialRecords: ScoreRecord[];
  isReadOnly?: boolean;
}

export function ScoreEntryContainer({
  submission,
  components,
  gradeBands,
  enrollments,
  initialRecords,
  isReadOnly = false,
}: ScoreEntryContainerProps) {
  const router = useRouter();
  const [currentSubmission, setCurrentSubmission] = useState(submission);

  const handleSave = async (
    records: { enrollmentId: string; rawScores: Record<string, number | null> }[]
  ) => {
    const res = await fetch('/api/scores/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submissionId: currentSubmission.id,
        records,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to save scores');
    }
  };

  const handleSubmitForReview = async () => {
    const res = await fetch('/api/scores/workflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submissionId: currentSubmission.id,
        targetStatus: 'SUBMITTED',
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      alert(`Submission failed: ${data.error}`);
      return;
    }

    const data = await res.json();
    setCurrentSubmission(data.submission);
    alert('Scores submitted successfully for administrative review!');
    router.refresh();
  };

  return (
    <ScoreEntryGrid
      submission={currentSubmission}
      components={components}
      gradeBands={gradeBands}
      enrollments={enrollments}
      initialRecords={initialRecords}
      isReadOnly={isReadOnly}
      onSave={handleSave}
      onSubmitForReview={handleSubmitForReview}
    />
  );
}
