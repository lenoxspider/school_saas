import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { submissionId, records } = (await req.json()) as {
      submissionId: string;
      records: Array<{
        enrollmentId: string;
        rawScores: Record<string, number | null>;
        teacherNote?: string;
      }>;
    };

    if (!submissionId || !records) {
      return NextResponse.json({ error: 'submissionId and records are required' }, { status: 400 });
    }

    const submissions = db.getSubmissions(session.schoolId);
    const submission = submissions.find((s) => s.id === submissionId);
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    if (submission.status === 'PUBLISHED' && session.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Cannot edit published scores. Please contact administrator.' },
        { status: 403 }
      );
    }

    const gradingSystem = db.getDefaultGradingSystem(session.schoolId);
    const updated = db.saveScoreRecords(session.schoolId, submissionId, records, gradingSystem);

    // Audit log
    db.logAudit({
      schoolId: session.schoolId,
      userId: session.id,
      userName: `${session.firstName} ${session.lastName}`,
      userRole: session.role,
      action: 'SCORES_DRAFT_SAVED',
      resource: `AssessmentSubmission:${submissionId}`,
      details: {
        recordCount: updated.length,
        subject: submission.subject?.name,
        class: submission.class?.name,
      },
    });

    return NextResponse.json({ success: true, count: updated.length });
  } catch (err: unknown) {
    return NextResponse.json({ error: `Save scores failed: ${String(err)}` }, { status: 500 });
  }
}
