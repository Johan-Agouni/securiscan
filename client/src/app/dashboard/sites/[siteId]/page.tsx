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
  Calendar,
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
import type { Site, Scan, ScanSchedule } from '@/types';

const POLL_INTERVAL_MS = 5000;

const SCHEDULE_OPTIONS: { value: ScanSchedule; label: string }[] = [
  { value: 'NONE', label: 'Aucun' },
  { value: 'DAILY', label: 'Quotidien' },
  { value: 'WEEKLY', label: 'Hebdomadaire' },
  { value: 'MONTHLY', label: 'Mensuel' },
];

const SCAN_STEPS = [
  { key: 'ssl', label: 'Certificat SSL', icon: Lock },
  { key: 'headers', label: 'En-tetes HTTP', icon: Shield },
  { key: 'owasp', label: 'Vulnerabilites OWASP', icon: Globe },
  { key: 'performance', label: 'Performance', icon: Zap },
];

function ScanProgressCard({ scan }: { scan: Scan }) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const startTime = scan.startedAt ? new Date(scan.startedAt).getTime() : Date.now();

  useEffect(() => {
    const timer = setInterval(() => {
      const elapsedMs = Date.now() - startTime;
      const t = elapsedMs / 1000;
      const pct = Math.min(95, 100 * (1 - Math.exp(-t / 1.2)));
      setProgress(pct);

      // Steps advance proportionally to progress
      const stepIdx = Math.min(
        Math.floor((pct / 100) * SCAN_STEPS.length),
        SCAN_STEPS.length - 1
      );
      setCurrentStep(stepIdx);
    }, 100);

    return () => clearInterval(timer);
  }, [startTime]);

  return (
    <Card className="border-brand-200 dark:border-brand-800 bg-gradient-to-r from-brand-50 to-white dark:from-brand-950/50 dark:to-gray-800">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Loader2 className="h-6 w-6 text-brand-600 animate-spin" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Scan en cours...</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Analyse de securite en cours...
              </p>
            </div>
          </div>
          <Badge variant="info">En cours</Badge>
        </div>

        {/* Overall progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Progression</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-brand-600 h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SCAN_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isComplete = index < currentStep;
            const isActive = index === currentStep;

            return (
              <div
                key={step.key}
                className={`flex items-center gap-2 p-2.5 rounded-lg text-sm transition-all duration-300 ${
                  isComplete
                    ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : isActive
                      ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 ring-1 ring-brand-300 dark:ring-brand-700'
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-400'
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const openEditModal = () => {
    if (site) {
      setEditName(site.name);
      setEditActive(site.isActive);
      setShowEditModal(true);
    }
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await api.put(`/api/sites/${siteId}`, {
        name: editName,
        isActive: editActive,
      });
      addToast('Site modifie avec succes.', 'success');
      setShowEditModal(false);
      await fetchData();
    } catch {
      addToast('Erreur lors de la modification du site.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleScheduleChange = async (schedule: ScanSchedule) => {
    try {
      await api.put(`/api/sites/${siteId}/schedule`, { scanSchedule: schedule });
      addToast('Planification mise a jour.', 'success');
      await fetchData();
    } catch {
      addToast('Erreur lors de la mise a jour de la planification.', 'error');
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
        <p className="text-gray-500 dark:text-gray-400">Site introuvable.</p>
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
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux sites
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{site.name}</h1>
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
              onClick={openEditModal}
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
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-red-900 dark:text-red-300">
                Confirmer la suppression
              </p>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">
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

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Modifier le site
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom du site
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Site actif
                </label>
                <button
                  type="button"
                  onClick={() => setEditActive(!editActive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    editActive ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      editActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                Annuler
              </Button>
              <Button onClick={handleSaveEdit} isLoading={saving}>
                Enregistrer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Score + Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Gauge */}
        <Card className="flex flex-col items-center justify-center py-8">
          {latestScore != null ? (
            <ScoreGauge score={latestScore} size="lg" />
          ) : (
            <div className="text-center">
              <div className="w-32 h-32 rounded-full border-4 border-dashed border-gray-200 dark:border-gray-600 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl text-gray-300 dark:text-gray-500">--</span>
              </div>
              <p className="text-sm text-gray-500">Aucun scan effectue</p>
            </div>
          )}
        </Card>

        {/* Site Info */}
        <Card title="Informations" className="lg:col-span-2">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">URL</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-white break-all">
                {site.url}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Statut</dt>
              <dd className="mt-1">
                <Badge variant={site.isActive ? 'success' : 'default'}>
                  {site.isActive ? 'Actif' : 'Inactif'}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Date de creation</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(site.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Nombre de scans</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                {scans.length}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-2">
                <Calendar className="h-4 w-4" />
                Scan programme
              </dt>
              <dd className="flex flex-wrap gap-2">
                {SCHEDULE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleScheduleChange(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      (site.scanSchedule || 'NONE') === opt.value
                        ? 'bg-brand-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
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
                <CartesianGrid strokeDasharray="3 3" className="[&>line]:stroke-gray-200 dark:[&>line]:stroke-gray-700" stroke="#f0f0f0" />
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
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Checks
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {scans.map((scan) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const checksCount = (scan as any)._count?.scanResults ?? null;

                  return (
                    <tr
                      key={scan.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-200">
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
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {checksCount != null ? checksCount : '--'}
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
