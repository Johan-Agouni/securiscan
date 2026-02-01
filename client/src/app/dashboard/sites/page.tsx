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
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 to-brand-800 dark:from-brand-700 dark:to-brand-950 p-8 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Mes sites</h1>
            <p className="mt-1 text-brand-100 text-sm">
              {sites.length} site{sites.length !== 1 ? 's' : ''} surveille{sites.length !== 1 ? 's' : ''} &middot; Gerez et surveillez la securite de vos sites web
            </p>
          </div>
          <Link href="/dashboard/sites/new">
            <Button variant="secondary" className="!bg-white !text-brand-700 hover:!bg-brand-50 gap-2 shadow-md !border-0">
              <Plus className="h-4 w-4" />
              Ajouter un site
            </Button>
          </Link>
        </div>
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
        <div className={`grid gap-5 ${sites.length <= 2 ? 'grid-cols-1 md:grid-cols-2 max-w-3xl' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
          {sites.map((site) => (
            <SiteCard key={site.id} site={site} />
          ))}
          <Link
            href="/dashboard/sites/new"
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-8 text-gray-400 hover:border-brand-400 hover:text-brand-500 dark:hover:border-brand-500 dark:hover:text-brand-400 transition-all duration-200 min-h-[160px] hover:bg-brand-50/50 dark:hover:bg-brand-950/30"
          >
            <Plus className="h-8 w-8 mb-2" />
            <span className="text-sm font-medium">Ajouter un site</span>
          </Link>
        </div>
      )}
    </div>
  );
}
