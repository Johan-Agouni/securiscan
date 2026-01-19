'use client';

import React from 'react';
import Link from 'next/link';
import { XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function BillingCancelPage() {
  return (
    <div className="max-w-lg mx-auto text-center py-16">
      <div className="mb-8">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
          <XCircle className="h-10 w-10 text-gray-400" />
        </div>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-3">
        Paiement annule
      </h1>
      <p className="text-gray-600 mb-8 leading-relaxed">
        Le processus de paiement a ete annule. Aucun montant n&apos;a ete
        debite. Vous pouvez reessayer a tout moment si vous changez d&apos;avis.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link href="/dashboard/billing">
          <Button size="lg" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour a la facturation
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="secondary" size="lg">
            Aller au tableau de bord
          </Button>
        </Link>
      </div>
    </div>
  );
}
