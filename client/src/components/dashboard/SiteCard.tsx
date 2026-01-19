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

export function SiteCard({ site }: SiteCardProps) {
  const latestScore = site.latestScan?.overallScore ?? null;

  const scoreBadgeVariant =
    latestScore != null
      ? latestScore >= 80
        ? ('success' as const)
        : latestScore >= 50
          ? ('warning' as const)
          : ('danger' as const)
      : ('default' as const);

  return (
    <Link
      href={`/dashboard/sites/${site.id}`}
      className="group block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-brand-50 transition-colors">
            <Globe className="h-5 w-5 text-gray-400 group-hover:text-brand-600 transition-colors" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-brand-600 transition-colors">
              {site.name}
            </h3>
            <p className="text-xs text-gray-500 truncate">
              {truncateUrl(site.url)}
            </p>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-brand-500 transition-colors flex-shrink-0 mt-1" />
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          {/* Score */}
          {latestScore != null ? (
            <Badge variant={scoreBadgeVariant}>
              Score: {latestScore}/100
            </Badge>
          ) : (
            <Badge variant="default">Pas de scan</Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Status */}
          <Badge variant={site.isActive ? 'success' : 'default'}>
            {site.isActive ? 'Actif' : 'Inactif'}
          </Badge>
        </div>
      </div>

      {/* Last scan date */}
      {site.latestScan?.createdAt && (
        <p className="text-xs text-gray-400 mt-3">
          Dernier scan : {formatDate(site.latestScan.createdAt)}
        </p>
      )}
    </Link>
  );
}
