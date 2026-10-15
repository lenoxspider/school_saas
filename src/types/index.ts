export type Role = 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER';

export type SchoolStatus = 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED' | 'CANCELLED';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export type StudentStatus = 'ACTIVE' | 'GRADUATED' | 'TRANSFERRED' | 'SUSPENDED';

export type SubmissionStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'PUBLISHED';

export interface School {
  id: string;
  name: string;
  code: string;
  logoUrl?: string;
  motto?: string;
  email: string;
  phone?: string;
  address?: string;
  country: string;
  currency: string;
  status: SchoolStatus;
  plan: 'basic' | 'standard' | 'premium';
  trialEndsAt?: string;
  subscriptionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  schoolId?: string; // null for Super Admin
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: Role;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionUser {
  id: string;
  schoolId?: string;
  schoolName?: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface AcademicYear {
  id: string;
  schoolId: string;
  name: string; // e.g. "2025/2026"
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Term {
  id: string;
  schoolId: string;
  academicYearId: string;
  name: string; // e.g. "Term 1", "Term 2", "Semester 1"
  termNumber: number;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Class {
  id: string;
  schoolId: string;
  name: string; // e.g. "Basic 7A", "JHS 2 Green"
  level: number; // 1..12
  capacity?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  schoolId: string;
  name: string; // e.g. "Mathematics", "Integrated Science"
  code: string; // e.g. "MATH", "SCI"
  isCore: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherAssignment {
  id: string;
  schoolId: string;
  userId: string;
  classId: string;
  subjectId?: string; // null if Form/Class Teacher
  isClassTeacher: boolean;
}

export interface Student {
  id: string;
  schoolId: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  otherNames?: string;
  dateOfBirth?: string;
  gender: Gender;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  photoUrl?: string;
  status: StudentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ClassEnrollment {
  id: string;
  schoolId: string;
  studentId: string;
  academicYearId: string;
  classId: string;
  rollNumber?: string;
  createdAt: string;
}

export interface AssessmentComponent {
  code: string; // e.g. "CA", "EXAM", "HW", "TEST"
  name: string; // e.g. "Continuous Assessment", "Exam"
  maxScore: number; // e.g. 40
  weight: number; // e.g. 40 (percentage or scale weight)
}

export interface GradeBand {
  grade: string; // e.g. "1", "A+", "A"
  label: string; // e.g. "Excellent", "Distinction"
  minScore: number; // e.g. 80
  maxScore: number; // e.g. 100
  remark: string; // e.g. "Outstanding performance"
}

export interface GradingSystem {
  id: string;
  schoolId: string;
  name: string; // e.g. "Standard 40/60 BECE"
  isDefault: boolean;
  components: AssessmentComponent[];
  gradeBands: GradeBand[];
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentSubmission {
  id: string;
  schoolId: string;
  termId: string;
  classId: string;
  subjectId: string;
  status: SubmissionStatus;
  submittedById?: string;
  submittedAt?: string;
  reviewedById?: string;
  reviewedAt?: string;
  approvedById?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScoreRecord {
  id: string;
  schoolId: string;
  submissionId: string;
  enrollmentId: string;
  rawScores: Record<string, number | null>; // { "CA": 35.5, "EXAM": 80 }
  totalScore: number | null; // out of 100
  grade: string | null;
  remark: string | null;
  teacherNote?: string;
  updatedAt: string;
}

export interface StudentSubjectResult {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  rawScores: Record<string, number | null>;
  totalScore: number;
  grade: string;
  remark: string;
  classAverage?: number;
  positionInSubject?: number;
}

export interface ResultSnapshot {
  id: string;
  schoolId: string;
  termId: string;
  enrollmentId: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  className: string;
  academicYearName: string;
  termName: string;
  totalScore: number;
  averageScore: number;
  position: number;
  totalInClass: number;
  results: StudentSubjectResult[];
  gradingConfigSnapshot: {
    components: AssessmentComponent[];
    gradeBands: GradeBand[];
  };
  attendanceDays?: number;
  totalSchoolDays?: number;
  teacherComment?: string;
  headteacherComment?: string;
  publishedAt: string;
}

export interface AuditLog {
  id: string;
  schoolId?: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  action: string;
  resource: string;
  ipAddress?: string;
  details?: Record<string, unknown>;
  createdAt: string;
}
