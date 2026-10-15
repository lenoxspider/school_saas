import ExcelJS from 'exceljs';
import { School, Term, Class, Subject, Student, ScoreRecord } from '@/types';

export interface BroadsheetStudentRow {
  student: Student;
  rollNumber?: string;
  subjectScores: Record<string, { total: number | null; grade: string | null }>;
  totalMarks: number;
  average: number;
  position: number;
}

export async function generateBroadsheetExcel(
  school: School,
  term: Term,
  cls: Class,
  subjects: Subject[],
  rows: BroadsheetStudentRow[]
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'School SaaS Platform';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(`${cls.name} Broadsheet`, {
    views: [{ showGridLines: true }],
  });

  // Title Headers
  worksheet.mergeCells('A1', `${String.fromCharCode(68 + subjects.length * 2)}1`);
  const titleRow = worksheet.getCell('A1');
  titleRow.value = school.name.toUpperCase();
  titleRow.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
  titleRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1A365D' }, // Navy
  };
  worksheet.getRow(1).height = 30;

  worksheet.mergeCells('A2', `${String.fromCharCode(68 + subjects.length * 2)}2`);
  const subTitleRow = worksheet.getCell('A2');
  subTitleRow.value = `ACADEMIC BROADSHEET — ${cls.name.toUpperCase()} — ${term.name.toUpperCase()}`;
  subTitleRow.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FF2D3748' } };
  subTitleRow.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(2).height = 22;

  // Header row setup
  const headerColNames: string[] = ['Roll', 'Adm No', 'Student Name', 'Gender'];
  subjects.forEach((s) => {
    headerColNames.push(`${s.code} (Tot)`);
    headerColNames.push(`${s.code} (Grd)`);
  });
  headerColNames.push('Total Score', 'Average (%)', 'Position');

  const headerRow = worksheet.addRow(headerColNames);
  headerRow.height = 24;
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2B6CB0' }, // Accent Blue
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });

  // Data rows
  rows.forEach((r, idx) => {
    const rowValues: (string | number)[] = [
      r.rollNumber || String(idx + 1).padStart(2, '0'),
      r.student.admissionNumber,
      `${r.student.lastName.toUpperCase()}, ${r.student.firstName}`,
      r.student.gender === 'MALE' ? 'M' : 'F',
    ];

    subjects.forEach((s) => {
      const score = r.subjectScores[s.id];
      rowValues.push(score && score.total !== null ? score.total : '-');
      rowValues.push(score && score.grade ? score.grade : '-');
    });

    rowValues.push(r.totalMarks.toFixed(1), `${r.average.toFixed(1)}%`, r.position);

    const dataRow = worksheet.addRow(rowValues);
    dataRow.height = 20;

    dataRow.eachCell((cell, colNum) => {
      cell.font = { name: 'Calibri', size: 10 };
      cell.alignment = {
        horizontal: colNum === 3 ? 'left' : 'center',
        vertical: 'middle',
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
      // Zebra stripe
      if (idx % 2 === 1) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF7FAFC' },
        };
      }
    });
  });

  // Auto-fit column widths
  worksheet.columns.forEach((column, i) => {
    if (i === 2) {
      column.width = 28; // Student name
    } else if (i === 1) {
      column.width = 16; // Adm No
    } else {
      column.width = 12;
    }
  });

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
