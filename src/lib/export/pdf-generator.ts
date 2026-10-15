import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ResultSnapshot, School } from '@/types';

export function generateReportCardPdf(snapshot: ResultSnapshot, school: School): Buffer {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Colors
  const primaryColor: [number, number, number] = [26, 54, 93]; // Dark Navy Blue #1a365d
  const secondaryColor: [number, number, number] = [49, 130, 206]; // Accent Blue

  // Top School Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 28, 'F');

  // School Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(school.name.toUpperCase(), pageWidth / 2, 12, { align: 'center' });

  // School Contact & Motto
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text(school.motto ? `"${school.motto}"` : school.address || '', pageWidth / 2, 18, {
    align: 'center',
  });
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Email: ${school.email} | Tel: ${school.phone || 'N/A'} | ${school.country}`,
    pageWidth / 2,
    23,
    { align: 'center' }
  );

  // Document Title Banner
  doc.setFillColor(240, 244, 248);
  doc.rect(10, 32, pageWidth - 20, 10, 'F');
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('OFFICIAL TERMINAL STUDENT REPORT CARD', pageWidth / 2, 38.5, { align: 'center' });

  // Student & Academic Info Box
  doc.setDrawColor(220, 225, 230);
  doc.setFillColor(252, 253, 255);
  doc.roundedRect(10, 45, pageWidth - 20, 26, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);

  // Left Column
  doc.setFont('helvetica', 'bold');
  doc.text('STUDENT NAME:', 15, 52);
  doc.setFont('helvetica', 'normal');
  doc.text(snapshot.studentName, 48, 52);

  doc.setFont('helvetica', 'bold');
  doc.text('ADMISSION NO:', 15, 59);
  doc.setFont('helvetica', 'normal');
  doc.text(snapshot.admissionNumber, 48, 59);

  doc.setFont('helvetica', 'bold');
  doc.text('CLASS / GRADE:', 15, 66);
  doc.setFont('helvetica', 'normal');
  doc.text(snapshot.className, 48, 66);

  // Right Column
  doc.setFont('helvetica', 'bold');
  doc.text('ACADEMIC YEAR:', pageWidth / 2 + 10, 52);
  doc.setFont('helvetica', 'normal');
  doc.text(snapshot.academicYearName, pageWidth / 2 + 45, 52);

  doc.setFont('helvetica', 'bold');
  doc.text('TERM / SESSION:', pageWidth / 2 + 10, 59);
  doc.setFont('helvetica', 'normal');
  doc.text(snapshot.termName, pageWidth / 2 + 45, 59);

  doc.setFont('helvetica', 'bold');
  doc.text('CLASS POSITION:', pageWidth / 2 + 10, 66);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `${snapshot.position} of ${snapshot.totalInClass} students (Avg: ${snapshot.averageScore.toFixed(1)}%)`,
    pageWidth / 2 + 45,
    66
  );

  // Subject Results Table
  const tableHeaders = ['SUBJECT', 'CA (40%)', 'EXAM (60%)', 'TOTAL (100%)', 'GRADE', 'REMARK'];
  const tableRows = snapshot.results.map((r) => [
    r.subjectName,
    r.rawScores['CA'] !== undefined && r.rawScores['CA'] !== null ? String(r.rawScores['CA']) : '-',
    r.rawScores['EXAM'] !== undefined && r.rawScores['EXAM'] !== null ? String(r.rawScores['EXAM']) : '-',
    r.totalScore.toFixed(1),
    r.grade,
    r.remark,
  ]);

  autoTable(doc, {
    startY: 75,
    head: [tableHeaders],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 30, 30],
    },
    columnStyles: {
      0: { halign: 'left', fontStyle: 'bold' },
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'center', fontStyle: 'bold' },
      4: { halign: 'center', fontStyle: 'bold' },
      5: { halign: 'left' },
    },
    margin: { left: 10, right: 10 },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable?.finalY || 160;

  // Performance Summary & Grading Key
  const summaryY = finalY + 8;
  doc.setFillColor(248, 250, 252);
  doc.rect(10, summaryY, pageWidth - 20, 20, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(10, summaryY, pageWidth - 20, 20, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryColor);
  doc.text('OVERALL ACADEMIC SUMMARY', 15, summaryY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  doc.text(`Total Score: ${snapshot.totalScore.toFixed(1)}`, 15, summaryY + 12);
  doc.text(`Term Average: ${snapshot.averageScore.toFixed(1)}%`, 65, summaryY + 12);
  doc.text(`Class Rank: ${snapshot.position} / ${snapshot.totalInClass}`, 120, summaryY + 12);
  doc.text(
    `Attendance: ${snapshot.attendanceDays || 60} / ${snapshot.totalSchoolDays || 60} Days`,
    165,
    summaryY + 12
  );

  // Remarks & Signatures Section
  const remarksY = summaryY + 24;

  // Class Teacher's Remark
  doc.setDrawColor(200, 200, 200);
  doc.rect(10, remarksY, pageWidth - 20, 18);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text("CLASS TEACHER'S REMARKS:", 14, remarksY + 5);
  doc.setFont('helvetica', 'italic');
  doc.text(
    snapshot.teacherComment ||
      'An industrious student with commendable academic enthusiasm and diligence.',
    14,
    remarksY + 11
  );

  // Headteacher's Remark
  const headRemarkY = remarksY + 21;
  doc.rect(10, headRemarkY, pageWidth - 20, 18);
  doc.setFont('helvetica', 'bold');
  doc.text("HEADTEACHER'S REMARKS & ENDORSEMENT:", 14, headRemarkY + 5);
  doc.setFont('helvetica', 'italic');
  doc.text(
    snapshot.headteacherComment ||
      'Very good academic performance. Keep up the high standard in the ensuing term.',
    14,
    headRemarkY + 11
  );

  // Signature Block
  const sigY = headRemarkY + 24;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  // Class Teacher Sig
  doc.line(20, sigY + 10, 70, sigY + 10);
  doc.text("Class Teacher's Signature", 27, sigY + 14);

  // School Stamp Area
  doc.line(pageWidth / 2 - 20, sigY + 10, pageWidth / 2 + 20, sigY + 10);
  doc.text('Official School Stamp / Crest', pageWidth / 2 - 18, sigY + 14);

  // Headteacher Sig
  doc.line(pageWidth - 70, sigY + 10, pageWidth - 20, sigY + 10);
  doc.text("Headteacher's Signature", pageWidth - 65, sigY + 14);

  // Footer Note
  doc.setFontSize(7);
  doc.setTextColor(130, 130, 130);
  doc.text(
    `Generated electronically on ${new Date().toLocaleDateString()} | School SaaS Academic Platform`,
    pageWidth / 2,
    288,
    { align: 'center' }
  );

  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}
