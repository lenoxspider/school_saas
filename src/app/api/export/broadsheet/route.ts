import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { generateBroadsheetExcel, BroadsheetStudentRow } from '@/lib/export/excel-generator';
import { computeCompetitionRanks } from '@/lib/engine/grading';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');
    const termId = searchParams.get('termId') || db.getCurrentTerm(session.schoolId)?.id;

    if (!classId || !termId) {
      return NextResponse.json({ error: 'classId and termId are required' }, { status: 400 });
    }

    const school = db.getSchoolById(session.schoolId);
    const cls = db.getClassById(session.schoolId, classId);
    const term = db.getTerms(session.schoolId).find((t) => t.id === termId);
    const subjects = db.getSubjects(session.schoolId);

    if (!school || !cls || !term) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    const enrollments = db.getEnrollmentsByClass(session.schoolId, classId);
    const submissions = db.getSubmissions(session.schoolId, { classId, termId });

    // Build student rows with subject score mapping
    const studentScoreTotals: { id: string; score: number }[] = [];

    const rawRows = enrollments.map((enr) => {
      const subjectScores: Record<string, { total: number | null; grade: string | null }> = {};
      let totalMarks = 0;
      let subjectCount = 0;

      subjects.forEach((subj) => {
        const sub = submissions.find((s) => s.subjectId === subj.id);
        if (sub) {
          const scr = db.getScoreRecords(session.schoolId!, sub.id).find((r) => r.enrollmentId === enr.id);
          subjectScores[subj.id] = {
            total: scr?.totalScore ?? null,
            grade: scr?.grade ?? null,
          };
          if (scr?.totalScore !== null && scr?.totalScore !== undefined) {
            totalMarks += scr.totalScore;
            subjectCount++;
          }
        } else {
          subjectScores[subj.id] = { total: null, grade: null };
        }
      });

      const average = subjectCount > 0 ? Math.round((totalMarks / subjectCount) * 100) / 100 : 0;
      studentScoreTotals.push({ id: enr.id, score: average });

      return {
        enrollmentId: enr.id,
        student: enr.student,
        rollNumber: enr.rollNumber,
        subjectScores,
        totalMarks,
        average,
      };
    });

    // Compute standard competition ranks (1, 2, 2, 4)
    const ranks = computeCompetitionRanks(studentScoreTotals);

    const rows: BroadsheetStudentRow[] = rawRows.map((r) => ({
      student: r.student,
      rollNumber: r.rollNumber,
      subjectScores: r.subjectScores,
      totalMarks: r.totalMarks,
      average: r.average,
      position: ranks.get(r.enrollmentId) || 1,
    }));

    // Sort by position ascending
    rows.sort((a, b) => a.position - b.position);

    const excelBuffer = await generateBroadsheetExcel(school, term, cls, subjects, rows);
    const filename = `${cls.name.replace(/\s+/g, '_')}_${term.name.replace(/\s+/g, '_')}_Broadsheet.xlsx`;

    return new NextResponse(new Uint8Array(excelBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: `Broadsheet export failed: ${String(err)}` }, { status: 500 });
  }
}
