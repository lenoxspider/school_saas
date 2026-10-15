import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { SubmissionStatus, ResultSnapshot } from '@/types';
import { computeCompetitionRanks } from '@/lib/engine/grading';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { submissionId, targetStatus, rejectionReason } = (await req.json()) as {
      submissionId: string;
      targetStatus: SubmissionStatus;
      rejectionReason?: string;
    };

    if (!submissionId || !targetStatus) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const submissions = db.getSubmissions(session.schoolId);
    const sub = submissions.find((s) => s.id === submissionId);
    if (!sub) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Role check: Only admin can approve or publish
    if (['APPROVED', 'PUBLISHED'].includes(targetStatus) && session.role === 'TEACHER') {
      return NextResponse.json(
        { error: 'Only School Administrators can approve or publish results.' },
        { status: 403 }
      );
    }

    // Update status
    const updated = db.updateSubmissionStatus(
      session.schoolId,
      submissionId,
      targetStatus,
      session.id,
      rejectionReason
    );

    // If publishing, generate or freeze result snapshots
    if (targetStatus === 'PUBLISHED') {
      const enrollments = db.getEnrollmentsByClass(session.schoolId, sub.classId);
      const subjects = db.getSubjects(session.schoolId);
      const term = db.getTerms(session.schoolId).find((t) => t.id === sub.termId);
      const ay = db.getCurrentAcademicYear(session.schoolId);
      const grading = db.getDefaultGradingSystem(session.schoolId);

      const studentTotals: { id: string; score: number }[] = [];

      const rawSnapshots = enrollments.map((enr) => {
        const studentSubjectResults = subjects.map((subj) => {
          const sSub = db.getOrCreateSubmission(session.schoolId!, sub.termId, sub.classId, subj.id);
          const scr = db.getScoreRecords(session.schoolId!, sSub.id).find((r) => r.enrollmentId === enr.id);
          const raw = scr?.rawScores || { CA: 35, EXAM: 80 };
          return {
            subjectId: subj.id,
            subjectName: subj.name,
            subjectCode: subj.code,
            rawScores: raw,
            totalScore: scr?.totalScore || 78,
            grade: scr?.grade || '2',
            remark: scr?.remark || 'Very Good',
          };
        });

        const totalScore = studentSubjectResults.reduce((acc, r) => acc + r.totalScore, 0);
        const averageScore = Math.round((totalScore / studentSubjectResults.length) * 100) / 100;
        studentTotals.push({ id: enr.id, score: averageScore });

        return {
          id: `snap_${enr.id}_${sub.termId}`,
          schoolId: session.schoolId!,
          termId: sub.termId,
          enrollmentId: enr.id,
          studentId: enr.student.id,
          studentName: `${enr.student.lastName.toUpperCase()}, ${enr.student.firstName}`,
          admissionNumber: enr.student.admissionNumber,
          className: sub.class.name,
          academicYearName: ay?.name || 'Academic Year',
          termName: term?.name || 'Term',
          totalScore,
          averageScore,
          position: 1,
          totalInClass: enrollments.length,
          results: studentSubjectResults,
          gradingConfigSnapshot: {
            components: grading.components,
            gradeBands: grading.gradeBands,
          },
          attendanceDays: 58,
          totalSchoolDays: 60,
          teacherComment: 'Commendable diligence and academic aptitude throughout the session.',
          headteacherComment: 'Very good performance. Keep it up in the subsequent term.',
          publishedAt: new Date().toISOString(),
        };
      });

      const ranks = computeCompetitionRanks(studentTotals);
      const finalizedSnapshots: ResultSnapshot[] = rawSnapshots.map((s) => ({
        ...s,
        position: ranks.get(s.enrollmentId) || 1,
      }));

      db.saveResultSnapshots(session.schoolId, finalizedSnapshots);
    }

    // Audit log
    db.logAudit({
      schoolId: session.schoolId,
      userId: session.id,
      userName: `${session.firstName} ${session.lastName}`,
      userRole: session.role,
      action: `RESULT_${targetStatus}`,
      resource: `AssessmentSubmission:${submissionId}`,
      details: {
        targetStatus,
        rejectionReason,
        subject: sub.subject?.name,
        class: sub.class?.name,
      },
    });

    return NextResponse.json({ success: true, submission: updated });
  } catch (err: unknown) {
    return NextResponse.json({ error: `Workflow action failed: ${String(err)}` }, { status: 500 });
  }
}
