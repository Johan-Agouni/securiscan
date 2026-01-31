'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle, XCircle, Bell, User, Lock } from 'lucide-react';
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

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Veuillez entrer votre mot de passe actuel'),
    newPassword: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caracteres')
      .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
      .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
      .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { user, refreshProfile } = useAuth();
  const { addToast } = useToast();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
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

  const {
    register: registerPwd,
    handleSubmit: handleSubmitPwd,
    reset: resetPwd,
    formState: { errors: errorsPwd },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
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

  const onChangePassword = async (data: PasswordFormData) => {
    setSavingPassword(true);
    try {
      await api.put('/api/auth/me/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      resetPwd();
      addToast('Mot de passe modifie avec succes.', 'success');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Erreur lors du changement de mot de passe.';
      addToast(message, 'error');
    } finally {
      setSavingPassword(false);
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Parametres</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profil</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Email
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-500 dark:text-gray-400">
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

      {/* Password Section */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-yellow-50 rounded-lg">
            <Lock className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Mot de passe
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Modifiez votre mot de passe.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmitPwd(onChangePassword)} className="space-y-5">
          <Input
            label="Mot de passe actuel"
            type="password"
            placeholder="••••••••"
            error={errorsPwd.currentPassword?.message}
            {...registerPwd('currentPassword')}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nouveau mot de passe"
              type="password"
              placeholder="••••••••"
              error={errorsPwd.newPassword?.message}
              {...registerPwd('newPassword')}
            />
            <Input
              label="Confirmer le mot de passe"
              type="password"
              placeholder="••••••••"
              error={errorsPwd.confirmPassword?.message}
              {...registerPwd('confirmPassword')}
            />
          </div>
          <p className="text-xs text-gray-400">
            Min. 8 caracteres, 1 majuscule, 1 minuscule, 1 chiffre.
          </p>
          <div className="flex justify-end pt-2">
            <Button type="submit" isLoading={savingPassword}>
              Changer le mot de passe
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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notifications
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Configurez vos preferences de notification.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
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
                notificationsEnabled ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-600'
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
