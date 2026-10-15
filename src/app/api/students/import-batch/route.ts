import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { ValidatedStudentRecord } from '@/lib/import/student-importer';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { records, classId, academicYearId } = (await req.json()) as {
      records: ValidatedStudentRecord[];
      classId: string;
      academicYearId: string;
    };

    if (!records || !classId || !academicYearId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    let importedCount = 0;
    const errors: string[] = [];

    for (const rec of records) {
      if (!rec.isValid) continue;

      try {
        db.createStudent(
          session.schoolId,
          {
            admissionNumber: rec.admissionNumber,
            firstName: rec.firstName,
            lastName: rec.lastName,
            otherNames: rec.otherNames,
            gender: rec.gender,
            dateOfBirth: rec.dateOfBirth,
            guardianName: rec.guardianName,
            guardianPhone: rec.guardianPhone,
            guardianEmail: rec.guardianEmail,
            status: 'ACTIVE',
          },
          classId,
          academicYearId
        );
        importedCount++;
      } catch (err: unknown) {
        errors.push(`Failed to import student ${rec.admissionNumber}: ${String(err)}`);
      }
    }

    // Audit log
    db.logAudit({
      schoolId: session.schoolId,
      userId: session.id,
      userName: `${session.firstName} ${session.lastName}`,
      userRole: session.role,
      action: 'STUDENTS_BULK_IMPORTED',
      resource: `Class:${classId}`,
      details: { importedCount, classId, academicYearId },
    });

    return NextResponse.json({ success: true, importedCount, errors });
  } catch (err: unknown) {
    return NextResponse.json({ error: `Batch import failed: ${String(err)}` }, { status: 500 });
  }
}
