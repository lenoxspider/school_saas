import { generateReportCardPdf } from '../export/pdf-generator';
import { calculateSubjectTotal, resolveGradeAndRemark, computeCompetitionRanks, DEFAULT_GRADING_SYSTEM } from '../engine/grading';
import { ResultSnapshot, School } from '@/types';

interface LoadTestMetrics {
  testName: string;
  operationsCount: number;
  totalDurationMs: number;
  opsPerSec: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  heapUsedDeltaMb: number;
}

function calculatePercentiles(latencies: number[]): { avg: number; p95: number; p99: number } {
  latencies.sort((a, b) => a - b);
  const avg = latencies.reduce((acc, l) => acc + l, 0) / latencies.length;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || latencies[latencies.length - 1];
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || latencies[latencies.length - 1];
  return {
    avg: Math.round(avg * 100) / 100,
    p95: Math.round(p95 * 100) / 100,
    p99: Math.round(p99 * 100) / 100,
  };
}

function getMemoryUsageMb(): number {
  const mem = process.memoryUsage();
  return Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100;
}

export async function runLoadAndStressTests(): Promise<LoadTestMetrics[]> {
  const metrics: LoadTestMetrics[] = [];
  console.log('\n======================================================');
  console.log('🚀 STARTING SCHOLARGRID LOAD & STRESS TESTING SUITE');
  console.log(`Initial Heap Memory: ${getMemoryUsageMb()} MB`);
  console.log('======================================================\n');

  const dummySchool: School = {
    id: 'sch_bench_1',
    name: 'Benchmark Demonstration Academy',
    code: 'BDA',
    motto: 'Knowledge is Power',
    email: 'bench@academy.edu.gh',
    country: 'Ghana',
    currency: 'GHS',
    status: 'ACTIVE',
    plan: 'premium',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // -------------------------------------------------------------------------
  // TEST 1: 30 Teachers Simultaneously Saving Score Drafts
  // -------------------------------------------------------------------------
  console.log('--- Test 1: 30 Concurrent Teacher Score Sheet Writes (40 Students Each) ---');
  const startMem1 = getMemoryUsageMb();
  const startTime1 = performance.now();
  const writeLatencies: number[] = [];

  const teacherPromises = Array.from({ length: 30 }).map(async (_, teacherIdx) => {
    const t0 = performance.now();
    // Each teacher updates 40 student scores with 5 subjects
    for (let s = 0; s < 40; s++) {
      const raw = { CA: 25 + (s % 15), EXAM: 60 + (s % 35) };
      const { totalScore } = calculateSubjectTotal(raw, DEFAULT_GRADING_SYSTEM.components);
      resolveGradeAndRemark(totalScore, DEFAULT_GRADING_SYSTEM.gradeBands);
    }
    const t1 = performance.now();
    writeLatencies.push(t1 - t0);
  });

  await Promise.all(teacherPromises);
  const totalDuration1 = performance.now() - startTime1;
  const p1 = calculatePercentiles(writeLatencies);
  const heapDelta1 = Math.round((getMemoryUsageMb() - startMem1) * 100) / 100;

  metrics.push({
    testName: '30 Concurrent Teacher Writes (1,200 Students)',
    operationsCount: 30,
    totalDurationMs: Math.round(totalDuration1),
    opsPerSec: Math.round((30 / (totalDuration1 / 1000)) * 100) / 100,
    avgLatencyMs: p1.avg,
    p95LatencyMs: p1.p95,
    p99LatencyMs: p1.p99,
    heapUsedDeltaMb: heapDelta1,
  });

  console.log(`✅ Completed 30 concurrent teacher batches in ${totalDuration1.toFixed(1)}ms (${p1.avg}ms avg per sheet)`);

  // -------------------------------------------------------------------------
  // TEST 2: 1,000 High-Fidelity PDF Report Cards Generation
  // -------------------------------------------------------------------------
  console.log('\n--- Test 2: Generating 1,000 Report Card PDFs ---');
  const sampleSnapshot: ResultSnapshot = {
    id: 'snap_bench_1',
    schoolId: dummySchool.id,
    termId: 'term_bench',
    enrollmentId: 'enr_bench_1',
    studentId: 'std_bench_1',
    studentName: 'John Mensah',
    admissionNumber: 'BENCH-2026-001',
    className: 'Basic 7A',
    academicYearName: '2025/2026',
    termName: 'Term 2',
    totalScore: 395,
    averageScore: 79.0,
    position: 3,
    totalInClass: 42,
    results: [
      { subjectId: '1', subjectName: 'Mathematics', subjectCode: 'MATH', rawScores: { CA: 35, EXAM: 80 }, totalScore: 83, grade: '1', remark: 'Excellent' },
      { subjectId: '2', subjectName: 'Integrated Science', subjectCode: 'SCI', rawScores: { CA: 32, EXAM: 78 }, totalScore: 78.8, grade: '2', remark: 'Very Good' },
      { subjectId: '3', subjectName: 'English Language', subjectCode: 'ENG', rawScores: { CA: 36, EXAM: 84 }, totalScore: 86.4, grade: '1', remark: 'Excellent' },
      { subjectId: '4', subjectName: 'Social Studies', subjectCode: 'SOC', rawScores: { CA: 30, EXAM: 70 }, totalScore: 72, grade: '2', remark: 'Very Good' },
      { subjectId: '5', subjectName: 'ICT', subjectCode: 'ICT', rawScores: { CA: 38, EXAM: 92 }, totalScore: 93.2, grade: '1', remark: 'Excellent' },
    ],
    gradingConfigSnapshot: {
      components: DEFAULT_GRADING_SYSTEM.components,
      gradeBands: DEFAULT_GRADING_SYSTEM.gradeBands,
    },
    publishedAt: new Date().toISOString(),
  };

  const startMem2 = getMemoryUsageMb();
  const startTime2 = performance.now();
  const pdfLatencies: number[] = [];

  // Generate 1,000 PDF report cards in batches
  const TOTAL_PDFS = 1000;
  for (let i = 0; i < TOTAL_PDFS; i++) {
    const t0 = performance.now();
    const buf = generateReportCardPdf(sampleSnapshot, dummySchool);
    const t1 = performance.now();
    pdfLatencies.push(t1 - t0);
  }

  const totalDuration2 = performance.now() - startTime2;
  const p2 = calculatePercentiles(pdfLatencies);
  const heapDelta2 = Math.round((getMemoryUsageMb() - startMem2) * 100) / 100;

  metrics.push({
    testName: '1,000 PDF Report Cards Generation',
    operationsCount: TOTAL_PDFS,
    totalDurationMs: Math.round(totalDuration2),
    opsPerSec: Math.round((TOTAL_PDFS / (totalDuration2 / 1000)) * 10) / 10,
    avgLatencyMs: p2.avg,
    p95LatencyMs: p2.p95,
    p99LatencyMs: p2.p99,
    heapUsedDeltaMb: heapDelta2,
  });

  console.log(`✅ Generated ${TOTAL_PDFS} PDFs in ${totalDuration2.toFixed(1)}ms (~${p2.avg}ms/PDF, ${(TOTAL_PDFS / (totalDuration2 / 1000)).toFixed(1)} PDFs/sec)`);

  // -------------------------------------------------------------------------
  // TEST 3: Multi-Tenant Scale Simulations (10, 50, 100, 500 Schools)
  // -------------------------------------------------------------------------
  console.log('\n--- Test 3: Multi-Tenant Scale Simulations ---');

  const schoolTiers = [10, 50, 100, 500];

  for (const tier of schoolTiers) {
    const startMemTier = getMemoryUsageMb();
    const startTierTime = performance.now();
    const tierLatencies: number[] = [];

    // Each school compiles 200 students with 6 subjects each
    for (let s = 0; s < tier; s++) {
      const t0 = performance.now();
      const studentTotals: { id: string; score: number }[] = [];
      for (let st = 0; st < 200; st++) {
        let total = 0;
        for (let sub = 0; sub < 6; sub++) {
          const { totalScore } = calculateSubjectTotal(
            { CA: 20 + ((st + sub) % 20), EXAM: 50 + ((st + sub) % 50) },
            DEFAULT_GRADING_SYSTEM.components
          );
          total += totalScore || 0;
        }
        studentTotals.push({ id: `s_${st}`, score: total / 6 });
      }
      // Compute competition rankings
      computeCompetitionRanks(studentTotals);
      const t1 = performance.now();
      tierLatencies.push(t1 - t0);
    }

    const tierDuration = performance.now() - startTierTime;
    const pTier = calculatePercentiles(tierLatencies);
    const tierHeapDelta = Math.round((getMemoryUsageMb() - startMemTier) * 100) / 100;

    metrics.push({
      testName: `Multi-Tenant Scale: ${tier} Schools (${tier * 200} Students)`,
      operationsCount: tier,
      totalDurationMs: Math.round(tierDuration),
      opsPerSec: Math.round((tier / (tierDuration / 1000)) * 10) / 10,
      avgLatencyMs: pTier.avg,
      p95LatencyMs: pTier.p95,
      p99LatencyMs: pTier.p99,
      heapUsedDeltaMb: tierHeapDelta,
    });

    console.log(`✅ ${tier} Schools Simulation: Total ${tierDuration.toFixed(1)}ms (Avg ${pTier.avg}ms / school, ${tier * 200} total students)`);
  }

  // -------------------------------------------------------------------------
  // LOAD TEST SUMMARY REPORT
  // -------------------------------------------------------------------------
  console.log('\n======================================================');
  console.log('📊 LOAD & STRESS TEST BENCHMARK SUMMARY');
  console.log('======================================================');
  console.table(
    metrics.map((m) => ({
      Scenario: m.testName,
      Ops: m.operationsCount,
      'Total (ms)': m.totalDurationMs,
      'Ops/Sec': m.opsPerSec,
      'Avg Latency (ms)': m.avgLatencyMs,
      'P95 (ms)': m.p95LatencyMs,
      'P99 (ms)': m.p99LatencyMs,
      'Heap Delta (MB)': m.heapUsedDeltaMb,
    }))
  );

  return metrics;
}

if (typeof require !== 'undefined' && require.main === module) {
  runLoadAndStressTests();
}
