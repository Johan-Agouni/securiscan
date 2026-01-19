'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ScoreGauge } from '@/components/dashboard/ScoreGauge';
import { formatDateTime } from '@/lib/utils';
import { SCAN_STATUS_LABELS, CATEGORY_LABELS, SEVERITY_ORDER } from '@/lib/constants';
import type { Scan, ScanResult } from '@/types';

type TabKey = 'all' | 'headers' | 'ssl' | 'owasp' | 'performance';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'headers', label: 'En-tetes HTTP' },
  { key: 'ssl', label: 'SSL' },
  { key: 'owasp', label: 'OWASP' },
  { key: 'performance', label: 'Performance' },
];

function SeverityIcon({ severity }: { severity: string }) {
  switch (severity) {
    case 'PASS':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'INFO':
      return <Info className="h-4 w-4 text-blue-500" />;
    case 'WARNING':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'CRITICAL':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return null;
  }
}

function getSeverityBadgeVariant(severity: string) {
  switch (severity) {
    case 'PASS':
      return 'success' as const;
    case 'INFO':
      return 'info' as const;
    case 'WARNING':
      return 'warning' as const;
    case 'CRITICAL':
      return 'danger' as const;
    default:
      return 'default' as const;
  }
}

function ResultItem({ result }: { result: ScanResult }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-100 rounded-lg hover:border-gray-200 transition-colors">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <SeverityIcon severity={result.severity} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {result.checkName}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {result.message}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
          <Badge variant={getSeverityBadgeVariant(result.severity)}>
            {result.severity}
          </Badge>
          {result.recommendation && (
            expanded ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-gray-50 space-y-3">
          <div className="mt-3">
            <p className="text-sm text-gray-700">{result.message}</p>
          </div>

          {(result.value || result.expected) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.value && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                    Valeur actuelle
                  </p>
                  <p className="text-sm text-gray-900 font-mono break-all">
                    {result.value}
                  </p>
                </div>
              )}
              {result.expected && (
                <div className="bg-green-50 rounded-lg p-3">
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

          {result.recommendation && (
            <div className="bg-brand-50 rounded-lg p-3">
              <p className="text-xs font-medium text-brand-700 uppercase mb-1">
                Recommendation
              </p>
              <p className="text-sm text-brand-900">{result.recommendation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ScanDetailPage() {
  const params = useParams();
  const { addToast } = useToast();
  const siteId = params.siteId as string;
  const scanId = params.scanId as string;

  const [scan, setScan] = useState<Scan | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('all');

  useEffect(() => {
    const fetchScan = async () => {
      try {
        const { data } = await api.get(`/api/scans/${scanId}`);
        setScan(data.data || data);
      } catch {
        addToast('Erreur lors du chargement du scan.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchScan();
  }, [scanId, addToast]);

  const filteredResults = useMemo(() => {
    if (!scan?.results) return [];

    let results = [...scan.results];
    if (activeTab !== 'all') {
      results = results.filter((r) => r.category === activeTab);
    }

    return results.sort(
      (a, b) =>
        (SEVERITY_ORDER[a.severity] ?? 99) - (SEVERITY_ORDER[b.severity] ?? 99)
    );
  }, [scan, activeTab]);

  const summaryStats = useMemo(() => {
    if (!scan?.results) return { pass: 0, info: 0, warning: 0, critical: 0 };

    return {
      pass: scan.results.filter((r) => r.severity === 'PASS').length,
      info: scan.results.filter((r) => r.severity === 'INFO').length,
      warning: scan.results.filter((r) => r.severity === 'WARNING').length,
      critical: scan.results.filter((r) => r.severity === 'CRITICAL').length,
    };
  }, [scan]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Scan introuvable.</p>
        <Link href={`/dashboard/sites/${siteId}`} className="mt-4 inline-block">
          <button className="text-sm font-medium text-brand-600 hover:text-brand-700">
            Retour au site
          </button>
        </Link>
      </div>
    );
  }

  const duration =
    scan.startedAt && scan.completedAt
      ? Math.round(
          (new Date(scan.completedAt).getTime() -
            new Date(scan.startedAt).getTime()) /
            1000
        )
      : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/dashboard/sites/${siteId}`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au site
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Detail du scan
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {formatDateTime(scan.createdAt)}
        </p>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Score */}
        <Card className="flex flex-col items-center justify-center py-6">
          {scan.overallScore != null ? (
            <ScoreGauge score={scan.overallScore} size="md" />
          ) : (
            <p className="text-gray-400 text-lg">--</p>
          )}
        </Card>

        {/* Summary Stats */}
        <Card className="lg:col-span-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-700">
                {summaryStats.pass}
              </p>
              <p className="text-xs text-green-600 font-medium">Reussi</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <Info className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-700">
                {summaryStats.info}
              </p>
              <p className="text-xs text-blue-600 font-medium">Info</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-700">
                {summaryStats.warning}
              </p>
              <p className="text-xs text-yellow-600 font-medium">
                Avertissement
              </p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-xl">
              <XCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-700">
                {summaryStats.critical}
              </p>
              <p className="text-xs text-red-600 font-medium">Critique</p>
            </div>
          </div>

          {/* Meta */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-gray-600">
            <div>
              <span className="text-gray-400">Statut : </span>
              <Badge
                variant={
                  scan.status === 'COMPLETED'
                    ? 'success'
                    : scan.status === 'FAILED'
                      ? 'danger'
                      : 'default'
                }
              >
                {SCAN_STATUS_LABELS[scan.status] || scan.status}
              </Badge>
            </div>
            {duration != null && (
              <div>
                <span className="text-gray-400">Duree : </span>
                <span className="font-medium">{duration}s</span>
              </div>
            )}
            <div>
              <span className="text-gray-400">Checks : </span>
              <span className="font-medium">{scan.results?.length || 0}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs + Results */}
      <Card>
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1 mb-6 border-b border-gray-200 -mt-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {activeTab !== tab.key && tab.key !== 'all' && (
                <span className="ml-1.5 text-xs text-gray-400">
                  (
                  {scan.results?.filter((r) => r.category === tab.key).length ||
                    0}
                  )
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Results */}
        {filteredResults.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">
              Aucun resultat pour cette categorie.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Group by category when showing all */}
            {activeTab === 'all'
              ? Object.entries(
                  filteredResults.reduce(
                    (acc, result) => {
                      const cat = result.category;
                      if (!acc[cat]) acc[cat] = [];
                      acc[cat].push(result);
                      return acc;
                    },
                    {} as Record<string, ScanResult[]>
                  )
                ).map(([category, results]) => (
                  <div key={category} className="mb-6 last:mb-0">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                      {CATEGORY_LABELS[category] || category}
                    </h3>
                    <div className="space-y-2">
                      {results.map((result) => (
                        <ResultItem key={result.id} result={result} />
                      ))}
                    </div>
                  </div>
                ))
              : filteredResults.map((result) => (
                  <ResultItem key={result.id} result={result} />
                ))}
          </div>
        )}
      </Card>
    </div>
  );
}
