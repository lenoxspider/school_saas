import { db } from '../db';
import { assertTenantResource } from './guards';

export function runMultiTenantIsolationTests() {
  const results: { test: string; passed: boolean; details?: string }[] = [];

  function assert(name: string, condition: boolean, details?: string) {
    results.push({ test: name, passed: condition, details });
    if (!condition) {
      console.error(`❌ ISOLATION TEST FAILED: ${name}`, details);
    } else {
      console.log(`✅ ISOLATION TEST PASSED: ${name}`);
    }
  }

  const schools = db.getSchools();
  const schoolA = schools[0]; // Accra Academy
  const schoolB = schools[1]; // Star International School

  assert('Setup: Two distinct school tenants exist', !!schoolA && !!schoolB && schoolA.id !== schoolB.id);

  // 1. Student query isolation
  const studentsA = db.getStudents(schoolA.id);
  const studentsB = db.getStudents(schoolB.id);
  const anyCrossStudent = studentsA.some((sa) => studentsB.some((sb) => sb.id === sa.id));
  assert('Tenant Isolation: Students in School A do not leak into School B query', !anyCrossStudent);

  // 2. Direct ID Cross-Tenant Access Check (assertTenantResource guard)
  let schoolBAccessDenied = false;
  try {
    const studentOfSchoolA = studentsA[0];
    // School B attempts to access School A's student
    assertTenantResource(studentOfSchoolA, schoolB.id, 'Student');
  } catch (err: unknown) {
    schoolBAccessDenied = true;
  }
  assert(
    'Tenant Isolation: Cross-tenant access throws access denied error',
    schoolBAccessDenied
  );

  // 3. Classes Isolation
  const classesA = db.getClasses(schoolA.id);
  const classesB = db.getClasses(schoolB.id);
  const crossClasses = classesA.some((ca) => classesB.some((cb) => cb.id === ca.id));
  assert('Tenant Isolation: Classes isolated by schoolId', !crossClasses);

  // 4. Score Submissions Isolation
  const subsA = db.getSubmissions(schoolA.id);
  const subsB = db.getSubmissions(schoolB.id);
  const crossSubs = subsA.some((sa) => subsB.some((sb) => sb.id === sa.id));
  assert('Tenant Isolation: Score submissions isolated by schoolId', !crossSubs);

  // 5. Audit Log Isolation
  const logsA = db.getAuditLogs(schoolA.id);
  const allLogsFromSchoolA = logsA.every((l) => l.schoolId === schoolA.id);
  assert('Tenant Isolation: Audit trail strictly isolated to tenant', allLogsFromSchoolA);

  console.log(`\n========================================`);
  console.log(`Isolation Summary: ${results.filter((r) => r.passed).length}/${results.length} tests passed.`);
  console.log(`========================================\n`);

  return { allPassed: results.every((r) => r.passed), results };
}

if (typeof require !== 'undefined' && require.main === module) {
  runMultiTenantIsolationTests();
}
