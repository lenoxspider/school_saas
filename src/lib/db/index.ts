import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  School,
  User,
  AcademicYear,
  Term,
  Class,
  Subject,
  TeacherAssignment,
  Student,
  ClassEnrollment,
  GradingSystem,
  AssessmentSubmission,
  ScoreRecord,
  ResultSnapshot,
  AuditLog,
} from '@/types';
import { DEFAULT_GRADING_SYSTEM, calculateSubjectTotal, resolveGradeAndRemark } from '../engine/grading';

interface DatabaseSchema {
  schools: School[];
  users: User[];
  academicYears: AcademicYear[];
  terms: Term[];
  classes: Class[];
  subjects: Subject[];
  teacherAssignments: TeacherAssignment[];
  students: Student[];
  enrollments: ClassEnrollment[];
  gradingSystems: GradingSystem[];
  submissions: AssessmentSubmission[];
  scoreRecords: ScoreRecord[];
  resultSnapshots: ResultSnapshot[];
  auditLogs: AuditLog[];
}

const DATA_FILE = path.join(process.cwd(), '.saas_db.json');

function initializeSeedData(): DatabaseSchema {
  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('Password123!', salt);
  const teacherPasswordHash = bcrypt.hashSync('Teacher123!', salt);

  const school1: School = {
    id: 'sch_accra_acad',
    name: 'Accra Academy Junior High',
    code: 'AAJHS',
    logoUrl: '/logo.png',
    motto: 'Esse Quam Videri',
    email: 'admin@accraacademy.edu.gh',
    phone: '+233 24 123 4567',
    address: 'Bubuashie, Winneba Road, Accra, Ghana',
    country: 'Ghana',
    currency: 'GHS',
    status: 'ACTIVE',
    plan: 'premium',
    trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const school2: School = {
    id: 'sch_star_intl',
    name: 'Star International School',
    code: 'STAR',
    motto: 'Excellence and Integrity',
    email: 'contact@starschool.edu.gh',
    phone: '+233 20 987 6543',
    address: 'East Legon, Accra, Ghana',
    country: 'Ghana',
    currency: 'GHS',
    status: 'ACTIVE',
    plan: 'standard',
    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const users: User[] = [
    {
      id: 'usr_superadmin',
      email: 'superadmin@schoolplatform.com',
      passwordHash: adminPasswordHash,
      firstName: 'Platform',
      lastName: 'SuperAdmin',
      role: 'SUPER_ADMIN',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'usr_admin_accra',
      schoolId: school1.id,
      email: 'admin@accraacademy.edu.gh',
      passwordHash: adminPasswordHash,
      firstName: 'Kofi',
      lastName: 'Mensah',
      phone: '+233 24 000 0001',
      role: 'SCHOOL_ADMIN',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'usr_teacher_kwame',
      schoolId: school1.id,
      email: 'kwame.asante@accraacademy.edu.gh',
      passwordHash: teacherPasswordHash,
      firstName: 'Kwame',
      lastName: 'Asante',
      phone: '+233 24 000 0002',
      role: 'TEACHER',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'usr_teacher_ama',
      schoolId: school1.id,
      email: 'ama.boateng@accraacademy.edu.gh',
      passwordHash: teacherPasswordHash,
      firstName: 'Ama',
      lastName: 'Boateng',
      phone: '+233 24 000 0003',
      role: 'TEACHER',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'usr_admin_star',
      schoolId: school2.id,
      email: 'admin@starschool.edu.gh',
      passwordHash: adminPasswordHash,
      firstName: 'Abena',
      lastName: 'Osei',
      phone: '+233 20 000 0001',
      role: 'SCHOOL_ADMIN',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const academicYears: AcademicYear[] = [
    {
      id: 'ay_2025_2026',
      schoolId: school1.id,
      name: '2025/2026 Academic Year',
      startDate: '2025-09-01',
      endDate: '2026-07-31',
      isCurrent: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const terms: Term[] = [
    {
      id: 'term_1_2025_2026',
      schoolId: school1.id,
      academicYearId: academicYears[0].id,
      name: 'Term 1',
      termNumber: 1,
      startDate: '2025-09-01',
      endDate: '2025-12-15',
      isCurrent: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'term_2_2025_2026',
      schoolId: school1.id,
      academicYearId: academicYears[0].id,
      name: 'Term 2',
      termNumber: 2,
      startDate: '2026-01-10',
      endDate: '2026-04-12',
      isCurrent: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const classes: Class[] = [
    {
      id: 'cls_jhs_1a',
      schoolId: school1.id,
      name: 'Basic 7A (JHS 1A)',
      level: 7,
      capacity: 40,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'cls_jhs_2a',
      schoolId: school1.id,
      name: 'Basic 8A (JHS 2A)',
      level: 8,
      capacity: 40,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'cls_jhs_3a',
      schoolId: school1.id,
      name: 'Basic 9A (JHS 3A)',
      level: 9,
      capacity: 40,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const subjects: Subject[] = [
    {
      id: 'subj_math',
      schoolId: school1.id,
      name: 'Mathematics',
      code: 'MATH',
      isCore: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'subj_sci',
      schoolId: school1.id,
      name: 'Integrated Science',
      code: 'SCI',
      isCore: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'subj_eng',
      schoolId: school1.id,
      name: 'English Language',
      code: 'ENG',
      isCore: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'subj_soc',
      schoolId: school1.id,
      name: 'Social Studies',
      code: 'SOC',
      isCore: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'subj_ict',
      schoolId: school1.id,
      name: 'Information & Comm. Tech (ICT)',
      code: 'ICT',
      isCore: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const teacherAssignments: TeacherAssignment[] = [
    {
      id: 'ta_kwame_math_jhs1',
      schoolId: school1.id,
      userId: 'usr_teacher_kwame',
      classId: 'cls_jhs_1a',
      subjectId: 'subj_math',
      isClassTeacher: true,
    },
    {
      id: 'ta_kwame_sci_jhs1',
      schoolId: school1.id,
      userId: 'usr_teacher_kwame',
      classId: 'cls_jhs_1a',
      subjectId: 'subj_sci',
      isClassTeacher: false,
    },
    {
      id: 'ta_ama_eng_jhs1',
      schoolId: school1.id,
      userId: 'usr_teacher_ama',
      classId: 'cls_jhs_1a',
      subjectId: 'subj_eng',
      isClassTeacher: false,
    },
    {
      id: 'ta_ama_soc_jhs1',
      schoolId: school1.id,
      userId: 'usr_teacher_ama',
      classId: 'cls_jhs_1a',
      subjectId: 'subj_soc',
      isClassTeacher: false,
    },
  ];

  const gradingSystems: GradingSystem[] = [
    {
      id: 'gs_standard_accra',
      schoolId: school1.id,
      ...DEFAULT_GRADING_SYSTEM,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const studentsList = [
    { adm: 'ACC-2025-001', fn: 'Emmanuel', ln: 'Mensah', gender: 'MALE' as const, guardian: 'Samuel Mensah', phone: '+233 24 111 2222' },
    { adm: 'ACC-2025-002', fn: 'Akosua', ln: 'Agyapong', gender: 'FEMALE' as const, guardian: 'Grace Agyapong', phone: '+233 24 111 3333' },
    { adm: 'ACC-2025-003', fn: 'Kwadwo', ln: 'Appiah', gender: 'MALE' as const, guardian: 'Daniel Appiah', phone: '+233 24 111 4444' },
    { adm: 'ACC-2025-004', fn: 'Efua', ln: 'Osei-Tutu', gender: 'FEMALE' as const, guardian: 'Mary Osei-Tutu', phone: '+233 24 111 5555' },
    { adm: 'ACC-2025-005', fn: 'Yaw', ln: 'Frimpong', gender: 'MALE' as const, guardian: 'Isaac Frimpong', phone: '+233 24 111 6666' },
    { adm: 'ACC-2025-006', fn: 'Adwoa', ln: 'Sarpong', gender: 'FEMALE' as const, guardian: 'Rita Sarpong', phone: '+233 24 111 7777' },
    { adm: 'ACC-2025-007', fn: 'Kwabena', ln: 'Donkor', gender: 'MALE' as const, guardian: 'Peter Donkor', phone: '+233 24 111 8888' },
    { adm: 'ACC-2025-008', fn: 'Abena', ln: 'Kwarteng', gender: 'FEMALE' as const, guardian: 'Hannah Kwarteng', phone: '+233 24 111 9999' },
  ];

  const students: Student[] = [];
  const enrollments: ClassEnrollment[] = [];

  studentsList.forEach((s, idx) => {
    const studentId = `std_acc_${idx + 1}`;
    students.push({
      id: studentId,
      schoolId: school1.id,
      admissionNumber: s.adm,
      firstName: s.fn,
      lastName: s.ln,
      gender: s.gender,
      guardianName: s.guardian,
      guardianPhone: s.phone,
      guardianEmail: `${s.fn.toLowerCase()}@guardian.example.com`,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    enrollments.push({
      id: `enr_jhs1_${idx + 1}`,
      schoolId: school1.id,
      studentId: studentId,
      academicYearId: academicYears[0].id,
      classId: classes[0].id,
      rollNumber: String(idx + 1).padStart(2, '0'),
      createdAt: new Date().toISOString(),
    });
  });

  // Seed initial score submission for Mathematics (Term 2)
  const submission1: AssessmentSubmission = {
    id: 'sub_jhs1_math_t2',
    schoolId: school1.id,
    termId: terms[1].id,
    classId: classes[0].id,
    subjectId: subjects[0].id,
    status: 'SUBMITTED',
    submittedById: 'usr_teacher_kwame',
    submittedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const sampleScores: Record<string, { ca: number; exam: number }> = {
    enr_jhs1_1: { ca: 38, exam: 92 },
    enr_jhs1_2: { ca: 35, exam: 85 },
    enr_jhs1_3: { ca: 30, exam: 74 },
    enr_jhs1_4: { ca: 39, exam: 95 },
    enr_jhs1_5: { ca: 25, exam: 58 },
    enr_jhs1_6: { ca: 32, exam: 78 },
    enr_jhs1_7: { ca: 28, exam: 65 },
    enr_jhs1_8: { ca: 36, exam: 88 },
  };

  const scoreRecords: ScoreRecord[] = [];
  enrollments.forEach((enr) => {
    const raw = sampleScores[enr.id] || { ca: 30, exam: 70 };
    const { totalScore } = calculateSubjectTotal(
      { CA: raw.ca, EXAM: raw.exam },
      DEFAULT_GRADING_SYSTEM.components
    );
    const { grade, remark } = resolveGradeAndRemark(totalScore, DEFAULT_GRADING_SYSTEM.gradeBands);

    scoreRecords.push({
      id: `scr_${enr.id}_math`,
      schoolId: school1.id,
      submissionId: submission1.id,
      enrollmentId: enr.id,
      rawScores: { CA: raw.ca, EXAM: raw.exam },
      totalScore,
      grade,
      remark,
      updatedAt: new Date().toISOString(),
    });
  });

  const auditLogs: AuditLog[] = [
    {
      id: 'aud_seed_1',
      schoolId: school1.id,
      userId: 'usr_admin_accra',
      userName: 'Kofi Mensah',
      userRole: 'SCHOOL_ADMIN',
      action: 'SCHOOL_CONFIGURED',
      resource: 'School:sch_accra_acad',
      details: { description: 'Initialized academic structure and classes' },
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'aud_seed_2',
      schoolId: school1.id,
      userId: 'usr_teacher_kwame',
      userName: 'Kwame Asante',
      userRole: 'TEACHER',
      action: 'SCORE_SUBMITTED',
      resource: 'AssessmentSubmission:sub_jhs1_math_t2',
      details: { subject: 'Mathematics', class: 'Basic 7A' },
      createdAt: new Date().toISOString(),
    },
  ];

  return {
    schools: [school1, school2],
    users,
    academicYears,
    terms,
    classes,
    subjects,
    teacherAssignments,
    students,
    enrollments,
    gradingSystems,
    submissions: [submission1],
    scoreRecords,
    resultSnapshots: [],
    auditLogs,
  };
}

class DatabaseStore {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch {
      // ignore
    }
    const seed = initializeSeedData();
    this.saveData(seed);
    return seed;
  }

  private saveData(dataToSave?: DatabaseSchema) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch {
      // ignore
    }
  }

  public getRawData(): DatabaseSchema {
    return this.data;
  }

  // --- SCHOOLS ---
  public getSchools(): School[] {
    return this.data.schools;
  }

  public getSchoolById(id: string): School | undefined {
    return this.data.schools.find((s) => s.id === id);
  }

  public createSchool(school: Omit<School, 'id' | 'createdAt' | 'updatedAt'>): School {
    const newSchool: School = {
      ...school,
      id: `sch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.schools.push(newSchool);

    // Create default grading system for new school
    this.createGradingSystem(newSchool.id, {
      ...DEFAULT_GRADING_SYSTEM,
    });

    this.saveData();
    return newSchool;
  }

  public updateSchool(id: string, updates: Partial<School>): School | undefined {
    const index = this.data.schools.findIndex((s) => s.id === id);
    if (index === -1) return undefined;
    this.data.schools[index] = {
      ...this.data.schools[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveData();
    return this.data.schools[index];
  }

  // --- USERS ---
  public getUsers(schoolId?: string): User[] {
    if (schoolId) {
      return this.data.users.filter((u) => u.schoolId === schoolId);
    }
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
    const newUser: User = {
      ...user,
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.saveData();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const index = this.data.users.findIndex((u) => u.id === id);
    if (index === -1) return undefined;
    this.data.users[index] = {
      ...this.data.users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveData();
    return this.data.users[index];
  }

  // --- ACADEMIC YEARS & TERMS ---
  public getAcademicYears(schoolId: string): AcademicYear[] {
    return this.data.academicYears.filter((ay) => ay.schoolId === schoolId);
  }

  public getCurrentAcademicYear(schoolId: string): AcademicYear | undefined {
    return (
      this.data.academicYears.find((ay) => ay.schoolId === schoolId && ay.isCurrent) ||
      this.data.academicYears.find((ay) => ay.schoolId === schoolId)
    );
  }

  public createAcademicYear(
    schoolId: string,
    ay: Omit<AcademicYear, 'id' | 'schoolId' | 'createdAt' | 'updatedAt'>
  ): AcademicYear {
    const newAy: AcademicYear = {
      ...ay,
      id: `ay_${Date.now()}`,
      schoolId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (newAy.isCurrent) {
      this.data.academicYears
        .filter((y) => y.schoolId === schoolId)
        .forEach((y) => (y.isCurrent = false));
    }
    this.data.academicYears.push(newAy);
    this.saveData();
    return newAy;
  }

  public getTerms(schoolId: string, academicYearId?: string): Term[] {
    return this.data.terms.filter(
      (t) => t.schoolId === schoolId && (!academicYearId || t.academicYearId === academicYearId)
    );
  }

  public getCurrentTerm(schoolId: string): Term | undefined {
    return (
      this.data.terms.find((t) => t.schoolId === schoolId && t.isCurrent) ||
      this.data.terms.find((t) => t.schoolId === schoolId)
    );
  }

  public createTerm(
    schoolId: string,
    term: Omit<Term, 'id' | 'schoolId' | 'createdAt' | 'updatedAt'>
  ): Term {
    const newTerm: Term = {
      ...term,
      id: `trm_${Date.now()}`,
      schoolId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (newTerm.isCurrent) {
      this.data.terms
        .filter((t) => t.schoolId === schoolId)
        .forEach((t) => (t.isCurrent = false));
    }
    this.data.terms.push(newTerm);
    this.saveData();
    return newTerm;
  }

  // --- CLASSES & SUBJECTS ---
  public getClasses(schoolId: string): Class[] {
    return this.data.classes.filter((c) => c.schoolId === schoolId);
  }

  public getClassById(schoolId: string, classId: string): Class | undefined {
    return this.data.classes.find((c) => c.schoolId === schoolId && c.id === classId);
  }

  public createClass(schoolId: string, cls: Omit<Class, 'id' | 'schoolId' | 'createdAt' | 'updatedAt'>): Class {
    const newClass: Class = {
      ...cls,
      id: `cls_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      schoolId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.classes.push(newClass);
    this.saveData();
    return newClass;
  }

  public getSubjects(schoolId: string): Subject[] {
    return this.data.subjects.filter((s) => s.schoolId === schoolId);
  }

  public getSubjectById(schoolId: string, subjectId: string): Subject | undefined {
    return this.data.subjects.find((s) => s.schoolId === schoolId && s.id === subjectId);
  }

  public createSubject(
    schoolId: string,
    subj: Omit<Subject, 'id' | 'schoolId' | 'createdAt' | 'updatedAt'>
  ): Subject {
    const newSubj: Subject = {
      ...subj,
      id: `subj_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      schoolId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.subjects.push(newSubj);
    this.saveData();
    return newSubj;
  }

  // --- TEACHER ASSIGNMENTS ---
  public getTeacherAssignments(schoolId: string, teacherId?: string): TeacherAssignment[] {
    return this.data.teacherAssignments.filter(
      (ta) => ta.schoolId === schoolId && (!teacherId || ta.userId === teacherId)
    );
  }

  public assignTeacher(assignment: Omit<TeacherAssignment, 'id'>): TeacherAssignment {
    const newTa: TeacherAssignment = {
      ...assignment,
      id: `ta_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
    };
    this.data.teacherAssignments.push(newTa);
    this.saveData();
    return newTa;
  }

  // --- STUDENTS & ENROLLMENTS ---
  public getStudents(schoolId: string): Student[] {
    return this.data.students.filter((s) => s.schoolId === schoolId);
  }

  public getStudentById(schoolId: string, studentId: string): Student | undefined {
    return this.data.students.find((s) => s.schoolId === schoolId && s.id === studentId);
  }

  public createStudent(
    schoolId: string,
    student: Omit<Student, 'id' | 'schoolId' | 'createdAt' | 'updatedAt'>,
    classId?: string,
    academicYearId?: string
  ): { student: Student; enrollment?: ClassEnrollment } {
    const newStudent: Student = {
      ...student,
      id: `std_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      schoolId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.students.push(newStudent);

    let enrollment: ClassEnrollment | undefined;
    if (classId && academicYearId) {
      enrollment = {
        id: `enr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        schoolId,
        studentId: newStudent.id,
        academicYearId,
        classId,
        createdAt: new Date().toISOString(),
      };
      this.data.enrollments.push(enrollment);
    }

    this.saveData();
    return { student: newStudent, enrollment };
  }

  public getEnrollmentsByClass(
    schoolId: string,
    classId: string,
    academicYearId?: string
  ): (ClassEnrollment & { student: Student })[] {
    return this.data.enrollments
      .filter(
        (e) =>
          e.schoolId === schoolId &&
          e.classId === classId &&
          (!academicYearId || e.academicYearId === academicYearId)
      )
      .map((e) => {
        const student = this.data.students.find((s) => s.id === e.studentId)!;
        return { ...e, student };
      })
      .filter((e) => e.student !== undefined);
  }

  // --- GRADING SYSTEM ---
  public getGradingSystems(schoolId: string): GradingSystem[] {
    return this.data.gradingSystems.filter((gs) => gs.schoolId === schoolId);
  }

  public getDefaultGradingSystem(schoolId: string): GradingSystem {
    return (
      this.data.gradingSystems.find((gs) => gs.schoolId === schoolId && gs.isDefault) ||
      this.data.gradingSystems.find((gs) => gs.schoolId === schoolId) || {
        id: `gs_${schoolId}`,
        schoolId,
        ...DEFAULT_GRADING_SYSTEM,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );
  }

  public createGradingSystem(
    schoolId: string,
    gs: Omit<GradingSystem, 'id' | 'schoolId' | 'createdAt' | 'updatedAt'>
  ): GradingSystem {
    const newGs: GradingSystem = {
      ...gs,
      id: `gs_${Date.now()}`,
      schoolId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (newGs.isDefault) {
      this.data.gradingSystems
        .filter((g) => g.schoolId === schoolId)
        .forEach((g) => (g.isDefault = false));
    }
    this.data.gradingSystems.push(newGs);
    this.saveData();
    return newGs;
  }

  // --- SUBMISSIONS & SCORES ---
  public getOrCreateSubmission(
    schoolId: string,
    termId: string,
    classId: string,
    subjectId: string,
    userId?: string
  ): AssessmentSubmission {
    let sub = this.data.submissions.find(
      (s) =>
        s.schoolId === schoolId &&
        s.termId === termId &&
        s.classId === classId &&
        s.subjectId === subjectId
    );

    if (!sub) {
      sub = {
        id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        schoolId,
        termId,
        classId,
        subjectId,
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.data.submissions.push(sub);
      this.saveData();
    }
    return sub;
  }

  public getSubmissions(
    schoolId: string,
    filters?: { termId?: string; classId?: string; status?: string }
  ): (AssessmentSubmission & { class: Class; subject: Subject; term: Term })[] {
    return this.data.submissions
      .filter((s) => {
        if (s.schoolId !== schoolId) return false;
        if (filters?.termId && s.termId !== filters.termId) return false;
        if (filters?.classId && s.classId !== filters.classId) return false;
        if (filters?.status && s.status !== filters.status) return false;
        return true;
      })
      .map((s) => {
        const cls = this.data.classes.find((c) => c.id === s.classId)!;
        const subj = this.data.subjects.find((sub) => sub.id === s.subjectId)!;
        const term = this.data.terms.find((t) => t.id === s.termId)!;
        return { ...s, class: cls, subject: subj, term };
      })
      .filter((s) => s.class && s.subject && s.term);
  }

  public getScoreRecords(schoolId: string, submissionId: string): ScoreRecord[] {
    return this.data.scoreRecords.filter(
      (sr) => sr.schoolId === schoolId && sr.submissionId === submissionId
    );
  }

  public saveScoreRecords(
    schoolId: string,
    submissionId: string,
    records: Array<{
      enrollmentId: string;
      rawScores: Record<string, number | null>;
      teacherNote?: string;
    }>,
    gradingSystem: GradingSystem
  ): ScoreRecord[] {
    const updatedRecords: ScoreRecord[] = [];

    for (const item of records) {
      const { totalScore } = calculateSubjectTotal(item.rawScores, gradingSystem.components);
      const { grade, remark } = resolveGradeAndRemark(totalScore, gradingSystem.gradeBands);

      let record = this.data.scoreRecords.find(
        (sr) =>
          sr.schoolId === schoolId &&
          sr.submissionId === submissionId &&
          sr.enrollmentId === item.enrollmentId
      );

      if (record) {
        record.rawScores = item.rawScores;
        record.totalScore = totalScore;
        record.grade = grade;
        record.remark = remark;
        record.teacherNote = item.teacherNote;
        record.updatedAt = new Date().toISOString();
      } else {
        record = {
          id: `scr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          schoolId,
          submissionId,
          enrollmentId: item.enrollmentId,
          rawScores: item.rawScores,
          totalScore,
          grade,
          remark,
          teacherNote: item.teacherNote,
          updatedAt: new Date().toISOString(),
        };
        this.data.scoreRecords.push(record);
      }
      updatedRecords.push(record);
    }

    // Update submission timestamp
    const sub = this.data.submissions.find((s) => s.id === submissionId);
    if (sub) {
      sub.updatedAt = new Date().toISOString();
    }

    this.saveData();
    return updatedRecords;
  }

  public updateSubmissionStatus(
    schoolId: string,
    submissionId: string,
    status: AssessmentSubmission['status'],
    userId: string,
    rejectionReason?: string
  ): AssessmentSubmission | undefined {
    const sub = this.data.submissions.find(
      (s) => s.schoolId === schoolId && s.id === submissionId
    );
    if (!sub) return undefined;

    sub.status = status;
    sub.updatedAt = new Date().toISOString();

    if (status === 'SUBMITTED') {
      sub.submittedById = userId;
      sub.submittedAt = new Date().toISOString();
    } else if (status === 'APPROVED' || status === 'PUBLISHED') {
      sub.approvedById = userId;
      sub.approvedAt = new Date().toISOString();
    } else if (status === 'DRAFT' && rejectionReason) {
      sub.rejectionReason = rejectionReason;
    }

    this.saveData();
    return sub;
  }

  // --- RESULT SNAPSHOTS ---
  public getResultSnapshots(
    schoolId: string,
    termId: string,
    classId?: string
  ): ResultSnapshot[] {
    return this.data.resultSnapshots.filter(
      (rs) =>
        rs.schoolId === schoolId &&
        rs.termId === termId &&
        (!classId || rs.className.includes(classId) || true)
    );
  }

  public saveResultSnapshots(schoolId: string, snapshots: ResultSnapshot[]) {
    // Remove existing snapshots for same term and enrollments to prevent duplicates
    const enrollmentIds = new Set(snapshots.map((s) => s.enrollmentId));
    this.data.resultSnapshots = this.data.resultSnapshots.filter(
      (rs) => !(rs.schoolId === schoolId && enrollmentIds.has(rs.enrollmentId))
    );
    this.data.resultSnapshots.push(...snapshots);
    this.saveData();
  }

  // --- AUDIT LOGS ---
  public logAudit(log: Omit<AuditLog, 'id' | 'createdAt'>): AuditLog {
    const newLog: AuditLog = {
      ...log,
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(newLog); // newest first
    this.saveData();
    return newLog;
  }

  public getAuditLogs(schoolId?: string, limit = 100): AuditLog[] {
    if (schoolId) {
      return this.data.auditLogs.filter((l) => l.schoolId === schoolId).slice(0, limit);
    }
    return this.data.auditLogs.slice(0, limit);
  }
}

// Global Singleton for development and runtime persistence
const globalForDb = global as unknown as { dbInstance?: DatabaseStore };
export const db = globalForDb.dbInstance || new DatabaseStore();
if (process.env.NODE_ENV !== 'production') globalForDb.dbInstance = db;
