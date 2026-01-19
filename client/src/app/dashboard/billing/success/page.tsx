'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

export default function BillingSuccessPage() {
  const { refreshProfile } = useAuth();

  useEffect(() => {
    // Refresh user profile to get updated plan info
    const timer = setTimeout(() => {
      refreshProfile();
    }, 1000);

    return () => clearTimeout(timer);
  }, [refreshProfile]);

  return (
    <div className="max-w-lg mx-auto text-center py-16">
      {/* Success Animation */}
      <div className="relative mb-8">
        {/* Animated circles */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-green-100 animate-ping opacity-20" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-green-100 animate-pulse opacity-40" />
        </div>
        <div className="relative flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-3">
        Paiement reussi !
      </h1>
      <p className="text-gray-600 mb-2 leading-relaxed">
        Votre abonnement a ete active avec succes. Vous pouvez maintenant
        profiter de toutes les fonctionnalites de votre nouveau plan.
      </p>
      <p className="text-sm text-gray-500 mb-8">
        Un email de confirmation a ete envoye a votre adresse email.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link href="/dashboard">
          <Button size="lg" className="gap-2">
            Aller au tableau de bord
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/dashboard/billing">
          <Button variant="secondary" size="lg">
            Voir mon abonnement
          </Button>
        </Link>
      </div>
    </div>
  );
}
