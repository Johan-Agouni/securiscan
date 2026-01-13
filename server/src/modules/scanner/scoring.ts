import { CheckResult } from './scanner.types';

/**
 * Category weights used to compute the overall security score.
 */
const CATEGORY_WEIGHTS: Record<string, number> = {
  headers: 30,
  ssl: 30,
  owasp: 25,
  performance: 15,
};

/**
 * Numeric value assigned to each severity level.
 */
const SEVERITY_SCORES: Record<CheckResult['severity'], number> = {
  PASS: 100,
  INFO: 80,
  WARNING: 40,
  CRITICAL: 0,
};

/**
 * Calculate a weighted overall security score from a collection of check
 * results.
 *
 * Each category receives an internal score equal to the arithmetic mean of
 * its individual check severity scores. The overall score is the weighted
 * sum of category scores divided by the total weight, rounded to the
 * nearest integer.
 *
 * @returns An integer between 0 and 100 inclusive.
 */
export function calculateScore(results: CheckResult[]): number {
  if (results.length === 0) return 0;

  // Group results by category.
  const grouped = new Map<string, CheckResult[]>();
  for (const result of results) {
    const existing = grouped.get(result.category) ?? [];
    existing.push(result);
    grouped.set(result.category, existing);
  }

  let weightedSum = 0;
  let totalWeight = 0;

  for (const [category, checks] of grouped) {
    const weight = CATEGORY_WEIGHTS[category] ?? 10; // fallback weight
    const categoryScore =
      checks.reduce((sum, c) => sum + SEVERITY_SCORES[c.severity], 0) /
      checks.length;

    weightedSum += categoryScore * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return 0;

  return Math.round(weightedSum / totalWeight);
}

/**
 * Map a numeric score (0-100) to a letter grade.
 *
 * | Score range | Grade |
 * |------------|-------|
 * | 90 - 100   | A     |
 * | 80 - 89    | B     |
 * | 65 - 79    | C     |
 * | 50 - 64    | D     |
 * | 0 - 49     | F     |
 */
export function getScoreGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 65) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}
