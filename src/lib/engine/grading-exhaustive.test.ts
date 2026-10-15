import {
  calculateSubjectTotal,
  resolveGradeAndRemark,
  computeCompetitionRanks,
  validateComponentScore,
  validateGradingConfiguration,
  DEFAULT_GRADING_SYSTEM,
} from './grading';
import { AssessmentComponent, GradeBand } from '@/types';

export function runExhaustiveGradingTests() {
  const results: { category: string; test: string; passed: boolean; details?: string }[] = [];

  function assert(category: string, name: string, condition: boolean, details?: string) {
    results.push({ category, test: name, passed: condition, details });
    if (!condition) {
      console.error(`❌ [${category}] FAILED: ${name}`, details);
    } else {
      console.log(`✅ [${category}] PASSED: ${name}`);
    }
  }

  // =========================================================================
  // 1. ASSESSMENT COMPONENT WEIGHTING VALIDITY
  // =========================================================================
  console.log('\n--- 1. Assessment Component Weighting Configuration Tests ---');

  // Valid 40 + 60 = 100
  const valid4060: AssessmentComponent[] = [
    { code: 'CA', name: 'Continuous Assessment', maxScore: 40, weight: 40 },
    { code: 'EXAM', name: 'Exam', maxScore: 100, weight: 60 },
  ];
  assert(
    'Weighting',
    'Valid configuration: 40% CA + 60% Exam sums to 100%',
    validateGradingConfiguration(valid4060).isValid === true
  );

  // Valid 30 + 20 + 50 = 100
  const valid302050: AssessmentComponent[] = [
    { code: 'HW', name: 'Homework', maxScore: 20, weight: 30 },
    { code: 'TEST', name: 'Midterm Test', maxScore: 50, weight: 20 },
    { code: 'EXAM', name: 'Final Exam', maxScore: 100, weight: 50 },
  ];
  assert(
    'Weighting',
    'Valid configuration: 30% HW + 20% Test + 50% Exam sums to 100%',
    validateGradingConfiguration(valid302050).isValid === true
  );

  // Invalid: 40 + 50 = 90
  const invalid90: AssessmentComponent[] = [
    { code: 'CA', name: 'CA', maxScore: 40, weight: 40 },
    { code: 'EXAM', name: 'Exam', maxScore: 100, weight: 50 },
  ];
  assert(
    'Weighting',
    'Invalid configuration rejected: 40% + 50% = 90% (under 100%)',
    validateGradingConfiguration(invalid90).isValid === false
  );

  // Invalid: 60 + 60 = 120
  const invalid120: AssessmentComponent[] = [
    { code: 'CA', name: 'CA', maxScore: 60, weight: 60 },
    { code: 'EXAM', name: 'Exam', maxScore: 100, weight: 60 },
  ];
  assert(
    'Weighting',
    'Invalid configuration rejected: 60% + 60% = 120% (over 100%)',
    validateGradingConfiguration(invalid120).isValid === false
  );

  // Invalid: -20 + 120 = 100 (Negative weight)
  const invalidNegativeWeight: AssessmentComponent[] = [
    { code: 'PENALTY', name: 'Penalty', maxScore: 20, weight: -20 },
    { code: 'EXAM', name: 'Exam', maxScore: 100, weight: 120 },
  ];
  assert(
    'Weighting',
    'Invalid configuration rejected: -20% + 120% = 100% contains negative weight',
    validateGradingConfiguration(invalidNegativeWeight).isValid === false
  );

  // =========================================================================
  // 2. SCORE BOUNDARIES & DECIMAL PRECISION
  // =========================================================================
  console.log('\n--- 2. Score Boundary & Numerical Precision Tests ---');

  const compCA: AssessmentComponent = { code: 'CA', name: 'CA', maxScore: 40, weight: 40 };

  assert('Boundary', 'Score of exactly 0 is valid', validateComponentScore(0, compCA).isValid === true);
  assert(
    'Boundary',
    'Score of exact maximum (40) is valid',
    validateComponentScore(40, compCA).isValid === true
  );
  assert(
    'Boundary',
    'Score of maximum + 0.01 (40.01) is rejected',
    validateComponentScore(40.01, compCA).isValid === false
  );
  assert(
    'Boundary',
    'Score of negative -0.01 is rejected',
    validateComponentScore(-0.01, compCA).isValid === false
  );
  assert(
    'Boundary',
    'Decimal score 34.75 is valid',
    validateComponentScore(34.75, compCA).isValid === true
  );

  // Normalization calculation with decimal raw marks
  // CA: 34.75/40 * 40 = 34.75. Exam: 87.5/100 * 60 = 52.5. Total = 87.25
  const decimalCalc = calculateSubjectTotal({ CA: 34.75, EXAM: 87.5 }, valid4060);
  assert(
    'Calculation',
    'Decimal precision: CA 34.75 + Exam 87.5 = 87.25%',
    decimalCalc.totalScore === 87.25 && decimalCalc.isComplete === true
  );

  // =========================================================================
  // 3. EXACT GRADE BOUNDARY RESOLUTION
  // =========================================================================
  console.log('\n--- 3. Exact Grade Boundary Precision Tests ---');

  // Standard Ghanaian 9-band scale
  // Band 1: 80 - 100
  // Band 2: 70 - 79.99
  // Band 3: 65 - 69.99
  const gradeBands = DEFAULT_GRADING_SYSTEM.gradeBands;

  assert(
    'Grade-Boundary',
    'Score 79.99 resolves to Grade 2 (Very Good)',
    resolveGradeAndRemark(79.99, gradeBands).grade === '2'
  );
  assert(
    'Grade-Boundary',
    'Score 80.00 resolves to Grade 1 (Excellent)',
    resolveGradeAndRemark(80.0, gradeBands).grade === '1'
  );
  assert(
    'Grade-Boundary',
    'Score 80.01 resolves to Grade 1 (Excellent)',
    resolveGradeAndRemark(80.01, gradeBands).grade === '1'
  );
  assert(
    'Grade-Boundary',
    'Score 69.99 resolves to Grade 3 (Good)',
    resolveGradeAndRemark(69.99, gradeBands).grade === '3'
  );
  assert(
    'Grade-Boundary',
    'Score 70.00 resolves to Grade 2 (Very Good)',
    resolveGradeAndRemark(70.0, gradeBands).grade === '2'
  );

  // =========================================================================
  // 4. RANKING WITH MULTIPLE TIES (1, 2, 2, 4, 4, 4, 7)
  // =========================================================================
  console.log('\n--- 4. Competition Ranking with Ties Tests ---');

  const multiTieStudents = [
    { id: 'S1', score: 100 }, // Rank 1
    { id: 'S2', score: 90 },  // Rank 2 (Tie)
    { id: 'S3', score: 90 },  // Rank 2 (Tie)
    { id: 'S4', score: 80 },  // Rank 4 (Tie)
    { id: 'S5', score: 80 },  // Rank 4 (Tie)
    { id: 'S6', score: 80 },  // Rank 4 (Tie)
    { id: 'S7', score: 70 },  // Rank 7
  ];

  const multiTieRanks = computeCompetitionRanks(multiTieStudents);

  assert('Ranking-Ties', 'S1 (100) is Rank 1', multiTieRanks.get('S1') === 1);
  assert('Ranking-Ties', 'S2 (90) is Rank 2', multiTieRanks.get('S2') === 2);
  assert('Ranking-Ties', 'S3 (90) is Rank 2', multiTieRanks.get('S3') === 2);
  assert('Ranking-Ties', 'S4 (80) is Rank 4 (skips 3 due to 2 ties)', multiTieRanks.get('S4') === 4);
  assert('Ranking-Ties', 'S5 (80) is Rank 4', multiTieRanks.get('S5') === 4);
  assert('Ranking-Ties', 'S6 (80) is Rank 4', multiTieRanks.get('S6') === 4);
  assert('Ranking-Ties', 'S7 (70) is Rank 7 (skips 5 & 6 due to 3 ties)', multiTieRanks.get('S7') === 7);

  // =========================================================================
  // 5. MISSING SCORE INTEGRITY (CA = 30, EXAM = NULL)
  // =========================================================================
  console.log('\n--- 5. Missing & Incomplete Score Tests ---');

  const incompleteEntry = calculateSubjectTotal({ CA: 30, EXAM: null }, valid4060);

  assert(
    'Missing-Scores',
    'Incomplete score (CA=30, Exam=null) flags isComplete === false',
    incompleteEntry.isComplete === false
  );
  assert(
    'Missing-Scores',
    'Incomplete score does not silently award a 0 for Exam without flagging incomplete status',
    incompleteEntry.totalScore !== null && incompleteEntry.isComplete === false
  );

  const entirelyEmptyEntry = calculateSubjectTotal({ CA: null, EXAM: null }, valid4060);
  assert(
    'Missing-Scores',
    'Entirely empty score (CA=null, Exam=null) returns totalScore === null',
    entirelyEmptyEntry.totalScore === null && entirelyEmptyEntry.isComplete === false
  );

  // =========================================================================
  // SUMMARY
  // =========================================================================
  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;
  const allPassed = passedCount === totalCount;

  console.log(`\n======================================================`);
  console.log(`Exhaustive Math Summary: ${passedCount}/${totalCount} Tests Passed.`);
  console.log(`Status: ${allPassed ? 'ALL MATHEMATICAL INTEGRITY GATES PASSED ✅' : 'FAILURES DETECTED ❌'}`);
  console.log(`======================================================\n`);

  return { allPassed, results };
}

if (typeof require !== 'undefined' && require.main === module) {
  runExhaustiveGradingTests();
}
