'use client';

import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { SEVERITY_ORDER } from '@/lib/constants';
import type { ScanResult } from '@/types';

interface RecommendationListProps {
  results: ScanResult[];
}

function RecommendationItem({ result }: { result: ScanResult }) {
  const [expanded, setExpanded] = useState(false);

  const isCritical = result.severity === 'CRITICAL';

  return (
    <div
      className={`border rounded-lg transition-colors ${
        isCritical
          ? 'border-red-200 bg-red-50/50'
          : 'border-yellow-200 bg-yellow-50/50'
      }`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          {isCritical ? (
            <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {result.checkName}
            </p>
            <p className="text-xs text-gray-600 mt-0.5 truncate">
              {result.message}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          <Badge variant={isCritical ? 'danger' : 'warning'}>
            {result.severity}
          </Badge>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </button>

      {expanded && result.recommendation && (
        <div className="px-4 pb-4 pt-0">
          <div
            className={`rounded-lg p-3 ${
              isCritical ? 'bg-red-100/50' : 'bg-yellow-100/50'
            }`}
          >
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Recommandation
            </p>
            <p className="text-sm text-gray-800">{result.recommendation}</p>
          </div>

          {(result.value || result.expected) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              {result.value && (
                <div className="bg-white/80 rounded-lg p-3 border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                    Valeur actuelle
                  </p>
                  <p className="text-sm text-gray-900 font-mono break-all">
                    {result.value}
                  </p>
                </div>
              )}
              {result.expected && (
                <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                  <p className="text-xs font-medium text-green-700 uppercase mb-1">
                    Valeur attendue
                  </p>
                  <p className="text-sm text-green-900 font-mono break-all">
                    {result.expected}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function RecommendationList({ results }: RecommendationListProps) {
  const filteredResults = useMemo(() => {
    return results
      .filter(
        (r) => r.severity === 'WARNING' || r.severity === 'CRITICAL'
      )
      .sort(
        (a, b) =>
          (SEVERITY_ORDER[a.severity] ?? 99) -
          (SEVERITY_ORDER[b.severity] ?? 99)
      );
  }, [results]);

  if (filteredResults.length === 0) {
    return (
      <div className="text-center py-8">
        <ShieldAlert className="h-10 w-10 text-green-300 mx-auto mb-3" />
        <p className="text-sm font-medium text-gray-900">
          Aucun probleme detecte
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Tous les checks ont ete valides avec succes.
        </p>
      </div>
    );
  }

  const criticalCount = filteredResults.filter(
    (r) => r.severity === 'CRITICAL'
  ).length;
  const warningCount = filteredResults.filter(
    (r) => r.severity === 'WARNING'
  ).length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-4 text-sm">
        {criticalCount > 0 && (
          <div className="flex items-center gap-1.5">
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="font-medium text-red-700">
              {criticalCount} critique{criticalCount > 1 ? 's' : ''}
            </span>
          </div>
        )}
        {warningCount > 0 && (
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span className="font-medium text-yellow-700">
              {warningCount} avertissement{warningCount > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="space-y-2">
        {filteredResults.map((result) => (
          <RecommendationItem key={result.id} result={result} />
        ))}
      </div>
    </div>
  );
}
