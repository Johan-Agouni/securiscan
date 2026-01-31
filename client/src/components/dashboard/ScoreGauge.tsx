'use client';

import React from 'react';
import { getScoreGrade } from '@/lib/utils';

interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

const sizeConfig = {
  sm: {
    width: 80,
    strokeWidth: 6,
    fontSize: 'text-xl',
    gradeSize: 'text-xs',
    radius: 34,
  },
  md: {
    width: 120,
    strokeWidth: 8,
    fontSize: 'text-3xl',
    gradeSize: 'text-sm',
    radius: 50,
  },
  lg: {
    width: 160,
    strokeWidth: 10,
    fontSize: 'text-4xl',
    gradeSize: 'text-base',
    radius: 66,
  },
};

function getStrokeColor(score: number): string {
  if (score >= 80) return '#16a34a'; // green-600
  if (score >= 50) return '#ca8a04'; // yellow-600
  return '#dc2626'; // red-600
}

function getTrackColor(score: number): string {
  if (score >= 80) return '#dcfce7'; // green-100
  if (score >= 50) return '#fef9c3'; // yellow-100
  return '#fee2e2'; // red-100
}

function getTextColorClass(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 50) return 'text-yellow-600';
  return 'text-red-600';
}

export function ScoreGauge({ score, size = 'md' }: ScoreGaugeProps) {
  const config = sizeConfig[size];
  const { width, strokeWidth, radius } = config;
  const center = width / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(score, 0), 100);
  const dashOffset = circumference - (progress / 100) * circumference;
  const grade = getScoreGrade(score);
  const strokeColor = getStrokeColor(score);
  const trackColor = getTrackColor(score);
  const textColor = getTextColorClass(score);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width, height: width }}>
        <svg
          width={width}
          height={width}
          viewBox={`0 0 ${width} ${width}`}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${config.fontSize} font-bold ${textColor}`}>
            {score}
          </span>
          <span
            className={`${config.gradeSize} font-semibold ${textColor} opacity-70 -mt-1`}
          >
            {grade}
          </span>
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Score de securite</p>
    </div>
  );
}
