'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Play,
  Settings,
  Trash2,
  ExternalLink,
  Clock,
  ArrowRight,
  Shield,
  Lock,
  Globe,
  Zap,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ScoreGauge } from '@/components/dashboard/ScoreGauge';
import { formatDate, formatDateTime, truncateUrl } from '@/lib/utils';
import { SCAN_STATUS_LABELS } from '@/lib/constants';
import type { Site, Scan } from '@/types';

const POLL_INTERVAL_MS = 5000;

const SCAN_STEPS = [
  { key: 'ssl', label: 'Certificat SSL', icon: Lock },
  { key: 'headers', label: 'En-tetes HTTP', icon: Shield },
  { key: 'owasp', label: 'Vulnerabilites OWASP', icon: Globe },
  { key: 'performance', label: 'Performance', icon: Zap },
];

function ScanProgressCard({ scan }: { scan: Scan }) {
  const [elapsed, setElapsed] = useState(0);
  const startTime = scan.startedAt ? new Date(scan.startedAt).getTime() : Date.now();

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  // Simulate progress based on elapsed time (each step ~10-15s)
  const estimatedStepDuration = 12;
  const currentStepIndex = Math.min(
    Math.floor(elapsed / estimatedStepDuration),
    SCAN_STEPS.length - 1
  );
  const stepProgress = Math.min(
    ((elapsed % estimatedStepDuration) / estimatedStepDuration) * 100,
    100
  );
  const overallProgress = Math.min(
    ((currentStepIndex * 100 + stepProgress) / SCAN_STEPS.length),
    95
  );

  return (
    <Card className="border-brand-200 bg-gradient-to-r from-brand-50 to-white">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Loader2 className="h-6 w-6 text-brand-600 animate-spin" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Scan en cours...</h3>
              <p className="text-sm text-gray-500">
                Analyse de securite en cours depuis {elapsed}s
              </p>
            </div>
          </div>
          <Badge variant="info">En cours</Badge>
        </div>

        {/* Overall progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Progression</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-brand-600 h-2.5 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SCAN_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isComplete = index < currentStepIndex;
            const isActive = index === currentStepIndex;

            return (
              <div
                key={step.key}
                className={`flex items-center gap-2 p-2.5 rounded-lg text-sm transition-all ${
                  isComplete
                    ? 'bg-green-50 text-green-700'
                    : isActive
                      ? 'bg-brand-100 text-brand-700 ring-1 ring-brand-300'
                      : 'bg-gray-50 text-gray-400'
                }`}
              >
                {isComplete ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                ) : isActive ? (
                  <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                ) : (
                  <Icon className="h-4 w-4 flex-shrink-0" />
                )}
                <span className="truncate font-medium">{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

export default function SiteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const siteId = params.siteId as string;

  const [site, setSite] = useState<Site | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [siteRes, scansRes] = await Promise.all([
        api.get(`/api/sites/${siteId}`),
        api.get(`/api/scans/site/${siteId}`),
      ]);
      setSite(siteRes.data.data || siteRes.data);
      const scansData = scansRes.data.data?.scans || scansRes.data.data || scansRes.data;
      setScans(Array.isArray(scansData) ? scansData : []);
    } catch {
      addToast('Erreur lors du chargement du site.', 'error');
    } finally {
      setLoading(false);
    }
  }, [siteId, addToast]);

  // Check if any scan is in progress
  const hasActiveScan = scans.some(
    (s) => s.status === 'PENDING' || s.status === 'RUNNING'
  );

  // Polling: auto-refresh while a scan is running
  useEffect(() => {
    if (hasActiveScan) {
      pollRef.current = setInterval(() => {
        fetchData();
      }, POLL_INTERVAL_MS);
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [hasActiveScan, fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStartScan = async () => {
    setScanning(true);
    try {
      await api.post(`/api/scans/trigger/${siteId}`);
      addToast('Scan lance avec succes !', 'success');
      await fetchData();
    } catch {
      addToast('Erreur lors du lancement du scan.', 'error');
    } finally {
      setScanning(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/api/sites/${siteId}`);
      addToast('Site supprime avec succes.', 'success');
      router.push('/dashboard/sites');
    } catch {
      addToast('Erreur lors de la suppression du site.', 'error');
      setDeleting(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'success' as const;
      case 'RUNNING':
        return 'info' as const;
      case 'FAILED':
        return 'danger' as const;
      default:
        return 'default' as const;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!site) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Site introuvable.</p>
        <Link href="/dashboard/sites" className="mt-4 inline-block">
          <Button variant="secondary">Retour aux sites</Button>
        </Link>
      </div>
    );
  }

  // Compute latest score from scans (most recent completed scan)
  const completedScans = scans
    .filter((s) => s.status === 'COMPLETED' && s.overallScore != null)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  const latestScore = completedScans[0]?.overallScore ?? null;

  // Chart data: score history (chronological order)
  const chartData = [...completedScans]
    .reverse()
    .map((s) => ({
      date: formatDate(s.createdAt),
      score: s.overallScore,
    }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/sites"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux sites
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{site.name}</h1>
              <Badge variant={site.isActive ? 'success' : 'default'}>
                {site.isActive ? 'Actif' : 'Inactif'}
              </Badge>
            </div>
            <a
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600 transition-colors"
            >
              {truncateUrl(site.url)}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleStartScan}
              isLoading={scanning}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              Lancer un scan
            </Button>
            <Button
              variant="secondary"
              className="gap-2"
              onClick={() => addToast('Fonctionnalite bientot disponible.', 'info')}
            >
              <Settings className="h-4 w-4" />
              Modifier
            </Button>
            <Button
              variant="danger"
              className="gap-2"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <Card className="border-red-200 bg-red-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-red-900">
                Confirmer la suppression
              </p>
              <p className="text-sm text-red-700 mt-1">
                Cette action est irreversible. Toutes les donnees et l&apos;historique
                des scans seront supprimes.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Annuler
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={deleting}
                onClick={handleDelete}
              >
                Confirmer la suppression
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Score + Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Gauge */}
        <Card className="flex flex-col items-center justify-center py-8">
          {latestScore != null ? (
            <ScoreGauge score={latestScore} size="lg" />
          ) : (
            <div className="text-center">
              <div className="w-32 h-32 rounded-full border-4 border-dashed border-gray-200 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl text-gray-300">--</span>
              </div>
              <p className="text-sm text-gray-500">Aucun scan effectue</p>
            </div>
          )}
        </Card>

        {/* Site Info */}
        <Card title="Informations" className="lg:col-span-2">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-gray-500">URL</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900 break-all">
                {site.url}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Statut</dt>
              <dd className="mt-1">
                <Badge variant={site.isActive ? 'success' : 'default'}>
                  {site.isActive ? 'Actif' : 'Inactif'}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Date de creation</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900">
                {formatDate(site.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Nombre de scans</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900">
                {scans.length}
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      {/* Active Scan Progress */}
      {scans
        .filter((s) => s.status === 'PENDING' || s.status === 'RUNNING')
        .map((scan) => (
          <ScanProgressCard key={scan.id} scan={scan} />
        ))}

      {/* Score History Chart */}
      {chartData.length > 1 && (
        <Card title="Evolution du score">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#4f46e5' }}
                  activeDot={{ r: 6 }}
                  name="Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Scan History */}
      <Card title="Historique des scans">
        {scans.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              Aucun scan effectue. Lancez votre premier scan pour analyser la
              securite de ce site.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Duree
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {scans.map((scan) => {
                  const duration =
                    scan.startedAt && scan.completedAt
                      ? Math.round(
                          (new Date(scan.completedAt).getTime() -
                            new Date(scan.startedAt).getTime()) /
                            1000
                        )
                      : null;

                  return (
                    <tr
                      key={scan.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {formatDateTime(scan.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        {scan.overallScore != null ? (
                          <Badge
                            variant={getStatusBadgeVariant(
                              scan.overallScore >= 80
                                ? 'COMPLETED'
                                : scan.overallScore >= 50
                                  ? 'RUNNING'
                                  : 'FAILED'
                            )}
                          >
                            {scan.overallScore}/100
                          </Badge>
                        ) : (
                          <span className="text-sm text-gray-400">--</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={getStatusBadgeVariant(scan.status)}>
                          {SCAN_STATUS_LABELS[scan.status] || scan.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {duration != null ? `${duration}s` : '--'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {scan.status === 'COMPLETED' && (
                          <Link
                            href={`/dashboard/sites/${siteId}/scans/${scan.id}`}
                            className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
                          >
                            Voir le detail
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
