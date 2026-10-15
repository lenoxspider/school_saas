import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, setSessionCookie } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const user = db.getUserByEmail(email);
    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    // Resolve school info if tenant user
    const school = user.schoolId ? db.getSchoolById(user.schoolId) : undefined;
    if (user.role !== 'SUPER_ADMIN' && (!school || school.status === 'SUSPENDED')) {
      return NextResponse.json(
        { error: 'School account is suspended or not found. Please contact support.' },
        { status: 403 }
      );
    }

    // Update last login
    db.updateUser(user.id, { lastLoginAt: new Date().toISOString() });

    // Log audit
    db.logAudit({
      schoolId: user.schoolId,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userRole: user.role,
      action: 'USER_LOGIN',
      resource: `User:${user.id}`,
      details: { email: user.email },
    });

    // Create session
    await setSessionCookie({
      id: user.id,
      schoolId: user.schoolId,
      schoolName: school?.name,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    });

    const redirectUrl = user.role === 'SUPER_ADMIN' ? '/admin' : '/app';
    return NextResponse.json({ success: true, redirectUrl, role: user.role });
  } catch (err: unknown) {
    return NextResponse.json({ error: `Login failed: ${String(err)}` }, { status: 500 });
  }
}
