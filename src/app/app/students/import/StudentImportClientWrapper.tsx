'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Class, AcademicYear } from '@/types';
import { StudentImportWizard } from '@/components/StudentImportWizard';

interface Props {
  schoolId: string;
  classes: Class[];
  academicYears: AcademicYear[];
}

export function StudentImportClientWrapper({ schoolId, classes, academicYears }: Props) {
  const router = useRouter();

  const handleComplete = (count: number) => {
    router.refresh();
  };

  return (
    <StudentImportWizard
      schoolId={schoolId}
      classes={classes}
      academicYears={academicYears}
      onImportComplete={handleComplete}
    />
  );
}
