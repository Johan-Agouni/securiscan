'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';

type VerifyState = 'loading' | 'success' | 'error';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [state, setState] = useState<VerifyState>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const verifyEmail = useCallback(async () => {
    if (!token) {
      setState('error');
      setErrorMessage('Lien de verification invalide.');
      return;
    }

    try {
      await api.get(`/api/auth/verify-email/${token}`);
      setState('success');
    } catch {
      setState('error');
      setErrorMessage(
        'Le lien de verification est invalide ou a expire. Veuillez vous reconnecter et demander un nouveau lien.'
      );
    }
  }, [token]);

  useEffect(() => {
    verifyEmail();
  }, [verifyEmail]);

  if (state === 'loading') {
    return (
      <div className="text-center py-8">
        <Spinner size="lg" className="mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Verification en cours...
        </h1>
        <p className="text-sm text-gray-600">
          Veuillez patienter pendant que nous verifions votre adresse email.
        </p>
      </div>
    );
  }

  if (state === 'success') {
    return (
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Email verifie !
        </h1>
        <p className="text-sm text-gray-600 mb-8">
          Votre adresse email a ete verifiee avec succes. Vous pouvez maintenant
          acceder a toutes les fonctionnalites de SecuriScan.
        </p>
        <Link href="/login">
          <Button size="lg" className="w-full">
            Se connecter
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <XCircle className="h-8 w-8 text-red-600" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-3">
        Echec de la verification
      </h1>
      <p className="text-sm text-gray-600 mb-8">{errorMessage}</p>
      <Link href="/login">
        <Button size="lg" variant="secondary" className="w-full">
          Retour a la connexion
        </Button>
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
