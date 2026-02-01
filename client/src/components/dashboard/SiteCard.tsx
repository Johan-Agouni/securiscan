'use client';

import React from 'react';
import Link from 'next/link';
import { Globe, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatDate, truncateUrl } from '@/lib/utils';
import type { Site } from '@/types';

interface SiteCardProps {
  site: Site;
}

function MiniScoreRing({ score }: { score: number }) {
  const color =
    score >= 80
      ? 'text-green-500'
      : score >= 50
        ? 'text-yellow-500'
        : 'text-red-500';
  const dashArray = `${(score / 100) * 94} 94`;

  return (
    <div className="relative h-11 w-11 flex-shrink-0">
      <svg className="h-11 w-11 -rotate-90" viewBox="0 0 36 36">
        <circle
          cx="18" cy="18" r="15" fill="none"
          stroke="currentColor"
          className="text-gray-100 dark:text-gray-700"
          strokeWidth="3"
        />
        <circle
          cx="18" cy="18" r="15" fill="none"
          stroke="currentColor"
          className={`${color} animate-score-fill`}
          strokeWidth="3"
          strokeDasharray={dashArray}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-gray-900 dark:text-white">
        {score}
      </span>
    </div>
  );
}

export function SiteCard({ site }: SiteCardProps) {
  const latestScore = site.latestScan?.overallScore ?? null;

  const borderColor =
    latestScore != null
      ? latestScore >= 80
        ? 'border-l-green-500'
        : latestScore >= 50
          ? 'border-l-yellow-500'
          : 'border-l-red-500'
      : 'border-l-gray-300 dark:border-l-gray-600';

  return (
    <Link
      href={`/dashboard/sites/${site.id}`}
      className={`group block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 border-l-4 ${borderColor} p-5 hover:shadow-lg hover:-translate-y-0.5 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg group-hover:bg-brand-50 dark:group-hover:bg-brand-900/30 transition-colors">
            <Globe className="h-5 w-5 text-gray-400 group-hover:text-brand-600 transition-colors" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-brand-600 transition-colors">
              {site.name}
            </h3>
            <p className="text-xs text-gray-500 truncate">
              {truncateUrl(site.url)}
            </p>
          </div>
        </div>
        {latestScore != null ? (
          <MiniScoreRing score={latestScore} />
        ) : (
          <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-brand-500 transition-colors flex-shrink-0 mt-1" />
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          {latestScore == null && (
            <Badge variant="default">Pas de scan</Badge>
          )}
          {site.latestScan?.createdAt && (
            <span className="text-xs text-gray-400">
              {formatDate(site.latestScan.createdAt)}
            </span>
          )}
        </div>

        <Badge variant={site.isActive ? 'success' : 'default'}>
          {site.isActive ? 'Actif' : 'Inactif'}
        </Badge>
      </div>
    </Link>
  );
}
