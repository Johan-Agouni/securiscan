'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle, XCircle, Bell, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const profileSchema = z.object({
  firstName: z
    .string()
    .min(2, 'Le prenom doit contenir au moins 2 caracteres'),
  lastName: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caracteres'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const { user, refreshProfile } = useAuth();
  const { addToast } = useToast();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    user?.notificationsEnabled ?? true
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      });
      setNotificationsEnabled(user.notificationsEnabled);
    }
  }, [user, reset]);

  const onSaveProfile = async (data: ProfileFormData) => {
    setSavingProfile(true);
    try {
      await api.put('/api/auth/me', {
        firstName: data.firstName,
        lastName: data.lastName,
      });
      await refreshProfile();
      addToast('Profil mis a jour avec succes.', 'success');
    } catch {
      addToast('Erreur lors de la mise a jour du profil.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const onSaveNotifications = async () => {
    setSavingNotifications(true);
    try {
      await api.put('/api/auth/me', {
        notificationsEnabled,
      });
      await refreshProfile();
      addToast('Preferences de notifications mises a jour.', 'success');
    } catch {
      addToast('Erreur lors de la mise a jour des notifications.', 'error');
    } finally {
      setSavingNotifications(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Parametres</h1>
        <p className="mt-1 text-sm text-gray-600">
          Gerez vos informations personnelles et vos preferences.
        </p>
      </div>

      {/* Profile Section */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-brand-50 rounded-lg">
            <User className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Profil</h2>
            <p className="text-sm text-gray-500">
              Vos informations personnelles.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Prenom"
              placeholder="Jean"
              error={errors.firstName?.message}
              {...register('firstName')}
            />
            <Input
              label="Nom"
              placeholder="Dupont"
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500">
                {user?.email}
              </div>
              {user?.emailVerified ? (
                <Badge variant="success" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Verifie
                </Badge>
              ) : (
                <Badge variant="warning" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  Non verifie
                </Badge>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" isLoading={savingProfile}>
              Enregistrer le profil
            </Button>
          </div>
        </form>
      </Card>

      {/* Notifications Section */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-blue-50 rounded-lg">
            <Bell className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Notifications
            </h2>
            <p className="text-sm text-gray-500">
              Configurez vos preferences de notification.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Notifications par email
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Recevez un email lorsqu&apos;un scan detecte des problemes
                critiques.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={notificationsEnabled}
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
                notificationsEnabled ? 'bg-brand-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={onSaveNotifications}
              isLoading={savingNotifications}
            >
              Enregistrer les notifications
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
