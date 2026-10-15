import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, setSessionCookie } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const {
      schoolName,
      schoolCode,
      country = 'Ghana',
      phone,
      address,
      adminFirstName,
      adminLastName,
      adminEmail,
      adminPassword,
    } = await req.json();

    if (!schoolName || !schoolCode || !adminFirstName || !adminLastName || !adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: 'All required fields (school name, code, admin details, password) must be filled.' },
        { status: 400 }
      );
    }

    if (adminPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    // Check if email already registered
    const existingUser = db.getUserByEmail(adminEmail);
    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email address already exists.' },
        { status: 409 }
      );
    }

    // 1. Create School Tenant
    const school = db.createSchool({
      name: schoolName,
      code: schoolCode.toUpperCase(),
      email: adminEmail,
      phone,
      address,
      country,
      currency: country === 'Ghana' ? 'GHS' : 'USD',
      status: 'TRIAL',
      plan: 'basic',
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    // 2. Create Initial Academic Year & Term
    const currentYear = new Date().getFullYear();
    const ay = db.createAcademicYear(school.id, {
      name: `${currentYear}/${currentYear + 1} Academic Year`,
      startDate: `${currentYear}-09-01`,
      endDate: `${currentYear + 1}-07-31`,
      isCurrent: true,
    });

    db.createTerm(school.id, {
      academicYearId: ay.id,
      name: 'Term 1',
      termNumber: 1,
      startDate: `${currentYear}-09-01`,
      endDate: `${currentYear}-12-15`,
      isCurrent: true,
    });

    // 3. Create Sample Classes
    db.createClass(school.id, { name: 'Basic 7 (JHS 1)', level: 7, capacity: 40 });
    db.createClass(school.id, { name: 'Basic 8 (JHS 2)', level: 8, capacity: 40 });
    db.createClass(school.id, { name: 'Basic 9 (JHS 3)', level: 9, capacity: 40 });

    // 4. Create Core Subjects
    db.createSubject(school.id, { name: 'Mathematics', code: 'MATH', isCore: true });
    db.createSubject(school.id, { name: 'Integrated Science', code: 'SCI', isCore: true });
    db.createSubject(school.id, { name: 'English Language', code: 'ENG', isCore: true });
    db.createSubject(school.id, { name: 'Social Studies', code: 'SOC', isCore: true });

    // 5. Create School Administrator User
    const passwordHash = await hashPassword(adminPassword);
    const user = db.createUser({
      schoolId: school.id,
      email: adminEmail,
      passwordHash,
      firstName: adminFirstName,
      lastName: adminLastName,
      phone,
      role: 'SCHOOL_ADMIN',
      isActive: true,
      lastLoginAt: new Date().toISOString(),
    });

    // 6. Log Audit Trail
    db.logAudit({
      schoolId: school.id,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userRole: user.role,
      action: 'SCHOOL_ONBOARDED',
      resource: `School:${school.id}`,
      details: { schoolName: school.name, plan: school.plan },
    });

    // 7. Establish Session
    await setSessionCookie({
      id: user.id,
      schoolId: school.id,
      schoolName: school.name,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    });

    return NextResponse.json({ success: true, redirectUrl: '/app' });
  } catch (err: unknown) {
    return NextResponse.json({ error: `Registration failed: ${String(err)}` }, { status: 500 });
  }
}
