import { clsx, type ClassValue } from 'clsx';

/**
 * Merge class names using clsx, filtering out falsy values.
 */
export function cn(...classes: ClassValue[]): string {
  return clsx(classes);
}

/**
 * Format an ISO date string to a locale date (e.g. "27 janv. 2026").
 */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format an ISO date string to a locale date and time (e.g. "27 janv. 2026, 14:30").
 */
export function formatDateTime(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Return a Tailwind text color class based on a security score (0-100).
 * Green for >= 80, yellow for >= 50, red for < 50.
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 50) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Return a Tailwind background color class based on a security score (0-100).
 */
export function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-100';
  if (score >= 50) return 'bg-yellow-100';
  return 'bg-red-100';
}

/**
 * Convert a numeric score (0-100) to a letter grade.
 */
export function getScoreGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 65) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

/**
 * Return a Tailwind color class for a scan result severity level.
 */
export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'PASS':
      return 'text-green-600';
    case 'INFO':
      return 'text-blue-600';
    case 'WARNING':
      return 'text-yellow-600';
    case 'CRITICAL':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * Return a Tailwind background color class for a severity badge.
 */
export function getSeverityBgColor(severity: string): string {
  switch (severity) {
    case 'PASS':
      return 'bg-green-100 text-green-800';
    case 'INFO':
      return 'bg-blue-100 text-blue-800';
    case 'WARNING':
      return 'bg-yellow-100 text-yellow-800';
    case 'CRITICAL':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Truncate a URL for display purposes.
 * Strips the protocol, then truncates to maxLength with an ellipsis.
 */
export function truncateUrl(url: string, maxLength: number = 40): string {
  const stripped = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (stripped.length <= maxLength) return stripped;
  return stripped.substring(0, maxLength) + '...';
}
