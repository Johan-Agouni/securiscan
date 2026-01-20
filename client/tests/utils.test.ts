import { describe, it, expect } from 'vitest';
import { getScoreColor, getScoreGrade, truncateUrl } from '@/lib/utils';

describe('getScoreColor', () => {
  it('returns green for scores >= 80', () => {
    expect(getScoreColor(80)).toBe('text-green-600');
    expect(getScoreColor(100)).toBe('text-green-600');
  });

  it('returns yellow for scores >= 50 and < 80', () => {
    expect(getScoreColor(50)).toBe('text-yellow-600');
    expect(getScoreColor(79)).toBe('text-yellow-600');
  });

  it('returns red for scores < 50', () => {
    expect(getScoreColor(0)).toBe('text-red-600');
    expect(getScoreColor(49)).toBe('text-red-600');
  });
});

describe('getScoreGrade', () => {
  it('returns correct letter grades', () => {
    expect(getScoreGrade(95)).toBe('A');
    expect(getScoreGrade(85)).toBe('B');
    expect(getScoreGrade(70)).toBe('C');
    expect(getScoreGrade(45)).toBe('D');
    expect(getScoreGrade(20)).toBe('F');
  });
});

describe('truncateUrl', () => {
  it('strips protocol and trailing slash', () => {
    expect(truncateUrl('https://example.com/')).toBe('example.com');
  });

  it('truncates long URLs', () => {
    const longUrl = 'https://www.example.com/very/long/path/that/exceeds/the/limit';
    const result = truncateUrl(longUrl, 20);
    expect(result).toHaveLength(23); // 20 + '...'
    expect(result.endsWith('...')).toBe(true);
  });

  it('does not truncate short URLs', () => {
    expect(truncateUrl('https://example.com')).toBe('example.com');
  });
});
