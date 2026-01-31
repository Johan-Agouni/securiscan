'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PLANS } from '@/lib/constants';
import type { PlanKey } from '@/lib/constants';

const addSiteSchema = z.object({
  url: z
    .string()
    .url('Veuillez entrer une URL valide (ex: https://example.com)')
    .refine(
      (url) => url.startsWith('http://') || url.startsWith('https://'),
      'L\'URL doit commencer par http:// ou https://'
    ),
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caracteres')
    .max(100, 'Le nom ne peut pas depasser 100 caracteres'),
});

type AddSiteFormData = z.infer<typeof addSiteSchema>;

interface AddSiteFormProps {
  onSuccess: () => void;
}

export function AddSiteForm({ onSuccess }: AddSiteFormProps) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentPlan = (user?.plan || 'FREE') as PlanKey;
  const planInfo = PLANS[currentPlan];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddSiteFormData>({
    resolver: zodResolver(addSiteSchema),
    defaultValues: {
      url: '',
      name: '',
    },
  });

  const onSubmit = async (data: AddSiteFormData) => {
    setIsSubmitting(true);
    try {
      await api.post('/api/sites', {
        url: data.url,
        name: data.name,
      });
      onSuccess();
    } catch (error: unknown) {
      addToast(getErrorMessage(error, 'Erreur lors de l\'ajout du site. Veuillez reessayer.'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input
        label="URL du site"
        type="url"
        placeholder="https://example.com"
        error={errors.url?.message}
        {...register('url')}
      />

      <Input
        label="Nom du site"
        placeholder="Mon site web"
        error={errors.name?.message}
        {...register('name')}
      />

      {/* Plan limit warning */}
      <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
            Limite du plan {planInfo.name}
          </p>
          <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-0.5">
            Votre plan vous permet de surveiller jusqu&apos;a{' '}
            {planInfo.maxSites} site{planInfo.maxSites > 1 ? 's' : ''}.
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" isLoading={isSubmitting}>
          Ajouter le site
        </Button>
      </div>
    </form>
  );
}
