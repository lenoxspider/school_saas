import {
  AssessmentComponent,
  GradeBand,
  GradingSystem,
  ScoreRecord,
  StudentSubjectResult,
  ResultSnapshot,
} from '@/types';

/**
 * Validates an entire grading system configuration (component weights and grade bands)
 */
export function validateGradingConfiguration(
  components: AssessmentComponent[],
  gradeBands?: GradeBand[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!components || components.length === 0) {
    errors.push('At least one assessment component is required');
    return { isValid: false, errors };
  }

  let totalWeight = 0;
  for (const comp of components) {
    if (comp.weight <= 0) {
      errors.push(`Component "${comp.name}" must have a positive weight`);
    }
    if (comp.maxScore <= 0) {
      errors.push(`Component "${comp.name}" must have a positive maximum score`);
    }
    totalWeight += comp.weight;
  }

  if (Math.abs(totalWeight - 100) > 0.001) {
    errors.push(`Total component weights must sum to exactly 100% (currently ${totalWeight}%)`);
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validates a component score against component rules
 */
export function validateComponentScore(
  score: number | null | undefined,
  component: AssessmentComponent
): { isValid: boolean; error?: string } {
  if (score === null || score === undefined) {
    return { isValid: true };
  }
  if (typeof score !== 'number' || isNaN(score)) {
    return { isValid: false, error: 'Score must be a valid number' };
  }
  if (score < 0) {
    return { isValid: false, error: 'Score cannot be negative' };
  }
  if (score > component.maxScore) {
    return {
      isValid: false,
      error: `Score cannot exceed maximum of ${component.maxScore}`,
    };
  }
  return { isValid: true };
}

/**
 * Calculates the weighted total score for a single subject from raw component scores
 * Normalized to 100% scale.
 */
export function calculateSubjectTotal(
  rawScores: Record<string, number | null>,
  components: AssessmentComponent[]
): { totalScore: number | null; isComplete: boolean } {
  let weightedSum = 0;
  let totalWeight = 0;
  let hasAnyScore = false;
  let isComplete = true;

  for (const comp of components) {
    const raw = rawScores[comp.code];
    totalWeight += comp.weight;

    if (raw !== null && raw !== undefined && !isNaN(raw)) {
      hasAnyScore = true;
      // Normalize raw score to component weight: (raw / maxScore) * weight
      const componentWeighted = (raw / comp.maxScore) * comp.weight;
      weightedSum += componentWeighted;
    } else {
      isComplete = false;
    }
  }

  if (!hasAnyScore) {
    return { totalScore: null, isComplete: false };
  }

  // Normalize to 100 base if total weights don't sum to 100
  const normalizedTotal =
    totalWeight > 0 ? (weightedSum / totalWeight) * 100 : weightedSum;

  return {
    totalScore: Math.round(normalizedTotal * 100) / 100, // 2 decimal places
    isComplete,
  };
}

/**
 * Resolves grade and remark based on the calculated total score and grade bands
 */
export function resolveGradeAndRemark(
  totalScore: number | null,
  gradeBands: GradeBand[]
): { grade: string; remark: string } {
  if (totalScore === null || isNaN(totalScore)) {
    return { grade: '-', remark: 'Pending' };
  }

  // Sort grade bands descending by minScore to ensure accurate evaluation
  const sortedBands = [...gradeBands].sort((a, b) => b.minScore - a.minScore);

  for (const band of sortedBands) {
    if (totalScore >= band.minScore && totalScore <= band.maxScore) {
      return { grade: band.grade, remark: band.remark };
    }
  }

  // Default fallback if lowest band matched
  const lowestBand = sortedBands[sortedBands.length - 1];
  return {
    grade: lowestBand ? lowestBand.grade : 'F',
    remark: lowestBand ? lowestBand.remark : 'Needs Improvement',
  };
}

/**
 * Competition Ranking Algorithm (Standard Competition 1224)
 * Handles ties properly: If two students tie for 1st, the next student is 3rd.
 */
export function computeCompetitionRanks<T extends { id: string; score: number }>(
  items: T[]
): Map<string, number> {
  const sorted = [...items].sort((a, b) => b.score - a.score);
  const ranks = new Map<string, number>();

  let currentRank = 1;
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i].score < sorted[i - 1].score) {
      currentRank = i + 1;
    }
    ranks.set(sorted[i].id, currentRank);
  }

  return ranks;
}

/**
 * Computes class statistics for a subject or overall class average
 */
export function computeClassStats(scores: number[]): {
  average: number;
  highest: number;
  lowest: number;
  passRate: number; // percentage >= 50
  count: number;
} {
  const validScores = scores.filter((s) => s !== null && !isNaN(s));
  if (validScores.length === 0) {
    return { average: 0, highest: 0, lowest: 0, passRate: 0, count: 0 };
  }

  const sum = validScores.reduce((acc, s) => acc + s, 0);
  const highest = Math.max(...validScores);
  const lowest = Math.min(...validScores);
  const average = Math.round((sum / validScores.length) * 100) / 100;
  const passed = validScores.filter((s) => s >= 50).length;
  const passRate = Math.round((passed / validScores.length) * 100);

  return {
    average,
    highest,
    lowest,
    passRate,
    count: validScores.length,
  };
}

/**
 * Standard Default Ghanaian / West African Basic School Grading System
 */
export const DEFAULT_GRADING_SYSTEM: Omit<GradingSystem, 'id' | 'schoolId' | 'createdAt' | 'updatedAt'> = {
  name: 'Standard Continuous Assessment (40%) + Exam (60%)',
  isDefault: true,
  components: [
    { code: 'CA', name: 'Continuous Assessment', maxScore: 40, weight: 40 },
    { code: 'EXAM', name: 'End of Term Exam', maxScore: 100, weight: 60 },
  ],
  gradeBands: [
    { grade: '1', label: 'A+ (Highest)', minScore: 80, maxScore: 100, remark: 'Excellent' },
    { grade: '2', label: 'A (Higher)', minScore: 70, maxScore: 79.99, remark: 'Very Good' },
    { grade: '3', label: 'B+ (High)', minScore: 65, maxScore: 69.99, remark: 'Good' },
    { grade: '4', label: 'B (High Average)', minScore: 60, maxScore: 64.99, remark: 'Credit' },
    { grade: '5', label: 'C+ (Average)', minScore: 55, maxScore: 59.99, remark: 'Credit' },
    { grade: '6', label: 'C (Low Average)', minScore: 50, maxScore: 54.99, remark: 'Pass' },
    { grade: '7', label: 'D+ (Lower)', minScore: 45, maxScore: 49.99, remark: 'Weak Pass' },
    { grade: '8', label: 'D (Lowest)', minScore: 40, maxScore: 44.99, remark: 'Very Weak' },
    { grade: '9', label: 'F (Fail)', minScore: 0, maxScore: 39.99, remark: 'Fail' },
  ],
};
