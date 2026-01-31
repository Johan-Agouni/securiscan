'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Globe } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { SiteCard } from '@/components/dashboard/SiteCard';
import type { Site } from '@/types';

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const { data } = await api.get('/api/sites');
        const sitesData = data.data?.sites || data.data || data;
        setSites(Array.isArray(sitesData) ? sitesData : []);
      } catch {
        // Handle error silently
      } finally {
        setLoading(false);
      }
    };

    fetchSites();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mes sites</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Gerez et surveillez la securite de vos sites web.
          </p>
        </div>
        <Link href="/dashboard/sites/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter un site
          </Button>
        </Link>
      </div>

      {/* Sites Grid */}
      {sites.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Globe className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Aucun site ajoute
          </h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Ajoutez votre premier site web pour commencer a analyser sa
            securite.
          </p>
          <Link href="/dashboard/sites/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Ajouter mon premier site
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sites.map((site) => (
            <SiteCard key={site.id} site={site} />
          ))}
        </div>
      )}
    </div>
  );
}
