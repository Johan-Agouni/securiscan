'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { XCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Le mot de passe doit contenir une majuscule, une minuscule et un chiffre'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      addToast('Lien de reinitialisation invalide.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/api/auth/reset-password', {
        token,
        password: data.password,
      });
      addToast(
        'Mot de passe reinitialise avec succes ! Connectez-vous.',
        'success'
      );
      router.push('/login');
    } catch {
      addToast(
        'Le lien de reinitialisation est invalide ou a expire.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <div className="mx-auto w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <XCircle className="h-7 w-7 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Lien invalide
        </h1>
        <p className="text-sm text-gray-600 mb-8">
          Ce lien de reinitialisation est invalide ou a expire. Veuillez
          effectuer une nouvelle demande.
        </p>
        <Link
          href="/forgot-password"
          className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
        >
          Demander un nouveau lien
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Nouveau mot de passe
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Choisissez un nouveau mot de passe securise
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Nouveau mot de passe"
          type="password"
          placeholder="8 caracteres minimum"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirmer le mot de passe"
          type="password"
          placeholder="Repetez votre mot de passe"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isSubmitting}
        >
          Reinitialiser le mot de passe
        </Button>
      </form>

      <p className="mt-6 text-center">
        <Link
          href="/login"
          className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
        >
          Retour a la connexion
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
