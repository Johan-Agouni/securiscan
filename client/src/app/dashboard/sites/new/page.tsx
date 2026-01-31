'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { Card } from '@/components/ui/Card';
import { AddSiteForm } from '@/components/dashboard/AddSiteForm';

export default function NewSitePage() {
  const router = useRouter();
  const { addToast } = useToast();

  const handleSuccess = () => {
    addToast('Site ajoute avec succes !', 'success');
    router.push('/dashboard/sites');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/sites"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux sites
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ajouter un site</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Ajoutez un nouveau site web a surveiller. Nous analyserons sa securite
          automatiquement.
        </p>
      </div>

      {/* Form */}
      <Card>
        <AddSiteForm onSuccess={handleSuccess} />
      </Card>
    </div>
  );
}
