'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Globe,
  TrendingUp,
  ScanLine,
  AlertTriangle,
  Plus,
  Play,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { formatDate, getScoreColor } from '@/lib/utils';
import { SCAN_STATUS_LABELS } from '@/lib/constants';
import type { Site, Scan } from '@/types';

interface DashboardStats {
  totalSites: number;
  averageScore: number;
  scansToday: number;
  activeAlerts: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [sites, setSites] = useState<Site[]>([]);
  const [allScans, setAllScans] = useState<(Scan & { siteName: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/api/sites');
        const sitesData = data.data?.sites || data.data || data;
        const sitesList: Site[] = Array.isArray(sitesData) ? sitesData : [];
        setSites(sitesList);

        // Fetch scans for each site in parallel
        if (sitesList.length > 0) {
          const scansResults = await Promise.allSettled(
            sitesList.map((site) =>
              api.get(`/api/scans/site/${site.id}`).then((res) => {
                const scansData = res.data.data?.scans || res.data.data || res.data;
                const scans: Scan[] = Array.isArray(scansData) ? scansData : [];
                return scans.map((scan) => ({ ...scan, siteName: site.name }));
              })
            )
          );
          const merged = scansResults
            .filter((r): r is PromiseFulfilledResult<(Scan & { siteName: string })[]> => r.status === 'fulfilled')
            .flatMap((r) => r.value);
          setAllScans(merged);
        }
      } catch {
        // Silently handle fetch error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats: DashboardStats = React.useMemo(() => {
    const completedScans = allScans.filter((s) => s.status === 'COMPLETED' && s.overallScore != null);

    // Latest completed scan per site for average score
    const latestPerSite = new Map<string, number>();
    for (const scan of completedScans) {
      if (!latestPerSite.has(scan.siteId)) {
        latestPerSite.set(scan.siteId, scan.overallScore!);
      }
    }
    const scores = Array.from(latestPerSite.values());
    const averageScore =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

    const today = new Date().toDateString();
    const scansToday = allScans.filter(
      (s) => new Date(s.createdAt).toDateString() === today
    ).length;

    const activeAlerts = scores.filter((s) => s < 50).length;

    return {
      totalSites: sites.length,
      averageScore,
      scansToday,
      activeAlerts,
    };
  }, [sites, allScans]);

  const recentScans = React.useMemo(() => {
    return [...allScans]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  }, [allScans]);

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

  const statCards = [
    {
      label: 'Total sites',
      value: stats.totalSites,
      icon: Globe,
      color: 'text-brand-600',
      bg: 'bg-brand-50',
    },
    {
      label: 'Score moyen',
      value: stats.averageScore > 0 ? `${stats.averageScore}/100` : '--',
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: "Scans aujourd'hui",
      value: stats.scansToday,
      icon: ScanLine,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Alertes actives',
      value: stats.activeAlerts,
      icon: AlertTriangle,
      color: stats.activeAlerts > 0 ? 'text-red-600' : 'text-gray-400',
      bg: stats.activeAlerts > 0 ? 'bg-red-50' : 'bg-gray-50',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Bonjour{user?.firstName ? `, ${user.firstName}` : ''} !
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Voici un apercu de la securite de vos sites web.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="flex items-center gap-4">
              <div
                className={`p-3 rounded-xl ${stat.bg}`}
              >
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions + Recent Scans */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Scans */}
        <div className="lg:col-span-2">
          <Card title="Scans recents">
            {recentScans.length === 0 ? (
              <div className="text-center py-8">
                <ScanLine className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  Aucun scan effectue pour le moment.
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Utilisez les actions rapides pour commencer.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {recentScans.map((scan) => (
                  <div
                    key={scan.id}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {scan.siteName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(scan.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge variant={getStatusBadgeVariant(scan.status)}>
                        {SCAN_STATUS_LABELS[scan.status] || scan.status}
                      </Badge>
                      {scan.overallScore != null && (
                        <span
                          className={`text-lg font-bold ${getScoreColor(scan.overallScore)}`}
                        >
                          {scan.overallScore}
                        </span>
                      )}
                      <Link
                        href={`/dashboard/sites/${scan.siteId}/scans/${scan.id}`}
                      >
                        <ArrowRight className="h-4 w-4 text-gray-400 hover:text-brand-600 transition-colors" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <Card title="Actions rapides">
          <div className="space-y-3">
            <Link href="/dashboard/sites/new" className="block">
              <Button variant="primary" className="w-full justify-start gap-3">
                <Plus className="h-4 w-4" />
                Ajouter un site
              </Button>
            </Link>
            {sites.length > 0 && (
              <Link
                href={`/dashboard/sites/${sites[0].id}`}
                className="block"
              >
                <Button
                  variant="secondary"
                  className="w-full justify-start gap-3"
                >
                  <Play className="h-4 w-4" />
                  Lancer un scan
                </Button>
              </Link>
            )}
            <Link href="/dashboard/sites" className="block">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3"
              >
                <Globe className="h-4 w-4" />
                Voir tous les sites
              </Button>
            </Link>
          </div>

          {/* Plan Info */}
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Plan actuel</span>
              <Badge variant="info">{user?.plan || 'FREE'}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-500">Sites utilises</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {stats.totalSites}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
