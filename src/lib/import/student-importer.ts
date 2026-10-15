import Papa from 'papaparse';
import { Gender } from '@/types';

export interface RawImportRow {
  [key: string]: string | undefined;
}

export interface ColumnMapping {
  admissionNumber: string;
  firstName: string;
  lastName: string;
  otherNames?: string;
  gender: string;
  dateOfBirth?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
}

export interface ValidatedStudentRecord {
  rowIndex: number;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  otherNames?: string;
  gender: Gender;
  dateOfBirth?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  isValid: boolean;
  isDuplicate: boolean;
  errors: string[];
}

export interface ImportValidationReport {
  totalRows: number;
  validCount: number;
  duplicateCount: number;
  errorCount: number;
  records: ValidatedStudentRecord[];
  columnHeaders: string[];
}

/**
 * Parses raw CSV text into rows and headers
 */
export function parseCSVData(csvText: string): { headers: string[]; rows: RawImportRow[] } {
  const result = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  const headers = result.meta.fields || [];
  const rows = result.data as RawImportRow[];

  return { headers, rows };
}

/**
 * Validates parsed rows against current school records to detect errors and duplicates
 */
export function validateStudentImport(
  rows: RawImportRow[],
  mapping: ColumnMapping,
  existingAdmissionNumbers: string[] = []
): ImportValidationReport {
  const existingAdmNumbers = new Set(
    existingAdmissionNumbers.map((adm) => adm.trim().toUpperCase())
  );
  const seenInBatch = new Set<string>();

  const records: ValidatedStudentRecord[] = [];
  let validCount = 0;
  let duplicateCount = 0;
  let errorCount = 0;

  rows.forEach((row, index) => {
    const errors: string[] = [];
    const adm = (row[mapping.admissionNumber] || '').trim();
    const fn = (row[mapping.firstName] || '').trim();
    const ln = (row[mapping.lastName] || '').trim();
    const on = mapping.otherNames ? (row[mapping.otherNames] || '').trim() : undefined;
    const rawGender = (row[mapping.gender] || '').trim().toUpperCase();
    const dob = mapping.dateOfBirth ? (row[mapping.dateOfBirth] || '').trim() : undefined;
    const gName = mapping.guardianName ? (row[mapping.guardianName] || '').trim() : undefined;
    const gPhone = mapping.guardianPhone ? (row[mapping.guardianPhone] || '').trim() : undefined;
    const gEmail = mapping.guardianEmail ? (row[mapping.guardianEmail] || '').trim() : undefined;

    // Required fields check
    if (!adm) errors.push('Admission Number is required');
    if (!fn) errors.push('First Name is required');
    if (!ln) errors.push('Last Name is required');
    if (!rawGender) errors.push('Gender is required');

    // Gender check
    let gender: Gender = 'OTHER';
    if (['M', 'MALE', 'BOY'].includes(rawGender)) {
      gender = 'MALE';
    } else if (['F', 'FEMALE', 'GIRL'].includes(rawGender)) {
      gender = 'FEMALE';
    } else if (['OTHER'].includes(rawGender)) {
      gender = 'OTHER';
    } else if (rawGender) {
      errors.push(`Invalid gender: "${rawGender}". Must be MALE or FEMALE.`);
    }

    // Duplicate check
    const upperAdm = adm.toUpperCase();
    let isDuplicate = false;
    if (upperAdm) {
      if (existingAdmNumbers.has(upperAdm)) {
        isDuplicate = true;
        errors.push(`Duplicate: Admission number "${adm}" already exists in the school.`);
      } else if (seenInBatch.has(upperAdm)) {
        isDuplicate = true;
        errors.push(`Duplicate in file: Admission number "${adm}" is repeated.`);
      } else {
        seenInBatch.add(upperAdm);
      }
    }

    const isValid = errors.length === 0;
    if (isValid) {
      validCount++;
    } else {
      if (isDuplicate) duplicateCount++;
      else errorCount++;
    }

    records.push({
      rowIndex: index + 1,
      admissionNumber: adm,
      firstName: fn,
      lastName: ln,
      otherNames: on,
      gender,
      dateOfBirth: dob,
      guardianName: gName,
      guardianPhone: gPhone,
      guardianEmail: gEmail,
      isValid,
      isDuplicate,
      errors,
    });
  });

  return {
    totalRows: rows.length,
    validCount,
    duplicateCount,
    errorCount,
    records,
    columnHeaders: Object.keys(rows[0] || {}),
  };
}
