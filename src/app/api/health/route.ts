import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const data = db.getRawData();
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    platform: {
      schools: data.schools.length,
      activeSchools: data.schools.filter((s) => s.status === 'ACTIVE').length,
      users: data.users.length,
      students: data.students.length,
      submissions: data.submissions.length,
    },
  });
}
