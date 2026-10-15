import {
  calculateSubjectTotal,
  resolveGradeAndRemark,
  computeCompetitionRanks,
  computeClassStats,
  validateComponentScore,
  DEFAULT_GRADING_SYSTEM,
} from './grading';

export function runGradingTests() {
  const results: { test: string; passed: boolean; details?: string }[] = [];

  function assert(name: string, condition: boolean, details?: string) {
    results.push({ test: name, passed: condition, details });
    if (!condition) {
      console.error(`❌ TEST FAILED: ${name}`, details);
    } else {
      console.log(`✅ TEST PASSED: ${name}`);
    }
  }

  // 1. Validation Tests
  const caComp = { code: 'CA', name: 'CA', maxScore: 40, weight: 40 };
  assert(
    'Validation: Rejects score above maximum',
    validateComponentScore(45, caComp).isValid === false
  );
  assert(
    'Validation: Rejects negative score',
    validateComponentScore(-5, caComp).isValid === false
  );
  assert(
    'Validation: Accepts valid score at boundary',
    validateComponentScore(40, caComp).isValid === true &&
    validateComponentScore(0, caComp).isValid === true
  );

  // 2. Score Calculation Tests (40/60 Model)
  const calc1 = calculateSubjectTotal(
    { CA: 35, EXAM: 80 },
    DEFAULT_GRADING_SYSTEM.components
  );
  // CA: 35 / 40 * 40 = 35. Exam: 80 / 100 * 60 = 48. Total = 83
  assert(
    'Calculation: Correct 40/60 weighting (35 CA + 80 Exam = 83.0)',
    calc1.totalScore === 83 && calc1.isComplete === true,
    `Calculated total: ${calc1.totalScore}`
  );

  // Custom 3-component test: HW (10), Test (20), Exam (70)
  const customComponents = [
    { code: 'HW', name: 'Homework', maxScore: 20, weight: 10 },
    { code: 'TEST', name: 'Midterm Test', maxScore: 50, weight: 20 },
    { code: 'EXAM', name: 'Final Exam', maxScore: 100, weight: 70 },
  ];
  // HW: 15/20 * 10 = 7.5. Test: 40/50 * 20 = 16. Exam: 90/100 * 70 = 63. Total = 86.5
  const calcCustom = calculateSubjectTotal(
    { HW: 15, TEST: 40, EXAM: 90 },
    customComponents
  );
  assert(
    'Calculation: Custom 3-component weighting (HW 15/20 + Test 40/50 + Exam 90/100 = 86.5)',
    calcCustom.totalScore === 86.5 && calcCustom.isComplete === true,
    `Calculated total: ${calcCustom.totalScore}`
  );

  // 3. Grade Band Resolution
  const grade1 = resolveGradeAndRemark(85, DEFAULT_GRADING_SYSTEM.gradeBands);
  assert('Grade: 85 maps to Grade 1 (Excellent)', grade1.grade === '1' && grade1.remark === 'Excellent');

  const grade2 = resolveGradeAndRemark(72, DEFAULT_GRADING_SYSTEM.gradeBands);
  assert('Grade: 72 maps to Grade 2 (Very Good)', grade2.grade === '2' && grade2.remark === 'Very Good');

  const gradeFail = resolveGradeAndRemark(32, DEFAULT_GRADING_SYSTEM.gradeBands);
  assert('Grade: 32 maps to Grade 9 (Fail)', gradeFail.grade === '9');

  // 4. Ranking Algorithm (Standard Competition 1224)
  const students = [
    { id: 'std_A', score: 95 },
    { id: 'std_B', score: 88 },
    { id: 'std_C', score: 88 }, // Tied for 2nd
    { id: 'std_D', score: 75 }, // Should be 4th
    { id: 'std_E', score: 60 }, // Should be 5th
  ];
  const ranks = computeCompetitionRanks(students);
  assert('Ranking: 1st place assigned correctly', ranks.get('std_A') === 1);
  assert('Ranking: Tied 2nd place for student B', ranks.get('std_B') === 2);
  assert('Ranking: Tied 2nd place for student C', ranks.get('std_C') === 2);
  assert('Ranking: Next student gets 4th place (1, 2, 2, 4 rule)', ranks.get('std_D') === 4);
  assert('Ranking: 5th place assigned correctly', ranks.get('std_E') === 5);

  // 5. Statistics Calculation
  const stats = computeClassStats([90, 80, 70, 60, 40]);
  // Sum: 340, Count: 5, Avg: 68, Highest: 90, Lowest: 40, Passed (>=50): 4 (80%)
  assert('Statistics: Class Average is 68', stats.average === 68);
  assert('Statistics: Highest is 90, Lowest is 40', stats.highest === 90 && stats.lowest === 40);
  assert('Statistics: Pass rate is 80%', stats.passRate === 80);

  const allPassed = results.every((r) => r.passed);
  console.log(`\n========================================`);
  console.log(`Summary: ${results.filter((r) => r.passed).length}/${results.length} tests passed.`);
  console.log(`========================================\n`);

  return { allPassed, results };
}

// Execute if run directly via node/ts-node
if (typeof require !== 'undefined' && require.main === module) {
  runGradingTests();
}
