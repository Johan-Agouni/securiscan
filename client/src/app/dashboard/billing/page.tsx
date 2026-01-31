'use client';

import React, { useState, useEffect } from 'react';
import { Check, CreditCard, ExternalLink, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { cn, formatDate } from '@/lib/utils';
import { PLANS } from '@/lib/constants';
import type { PlanKey } from '@/lib/constants';

interface PaymentHistoryItem {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  description: string;
}

export default function BillingPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null);
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);

  const currentPlan = (user?.plan || 'FREE') as PlanKey;
  const currentPlanInfo = PLANS[currentPlan];

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const { data } = await api.get('/api/payments/history');
        const result = data.data || data || {};
        setPayments(Array.isArray(result) ? result : result.payments || []);
      } catch {
        // Payment history may not be available for free plans
      } finally {
        setLoadingPayments(false);
      }
    };

    fetchPayments();
  }, []);

  const handleManageSubscription = async () => {
    setLoadingPortal(true);
    try {
      const { data } = await api.post('/api/payments/portal');
      const url = data.data?.url || data.url;
      if (url) {
        window.location.href = url;
      }
    } catch {
      addToast(
        'Erreur lors de l\'ouverture du portail de facturation.',
        'error'
      );
    } finally {
      setLoadingPortal(false);
    }
  };

  const handleUpgrade = async (plan: PlanKey) => {
    setLoadingCheckout(plan);
    try {
      const { data } = await api.post('/api/payments/checkout', {
        plan: plan.toLowerCase(),
      });
      const url = data.data?.url || data.url;
      if (url) {
        window.location.href = url;
      }
    } catch {
      addToast('Erreur lors de la creation de la session de paiement.', 'error');
    } finally {
      setLoadingCheckout(null);
    }
  };

  const planOrder: PlanKey[] = ['FREE', 'PRO', 'BUSINESS'];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Facturation</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Gerez votre abonnement et consultez votre historique de paiement.
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Plan actuel
              </h2>
              <Badge variant="info">{currentPlanInfo.name}</Badge>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {currentPlan === 'FREE'
                ? 'Profitez des fonctionnalites de base gratuitement.'
                : `Votre abonnement ${currentPlanInfo.name} est actif.`}
            </p>
            <ul className="mt-3 space-y-1">
              {currentPlanInfo.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          {currentPlan !== 'FREE' && (
            <Button
              variant="secondary"
              onClick={handleManageSubscription}
              isLoading={loadingPortal}
              className="gap-2 self-start"
            >
              <ExternalLink className="h-4 w-4" />
              Gerer l&apos;abonnement
            </Button>
          )}
        </div>
      </Card>

      {/* Plan Comparison */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Comparer les plans
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {planOrder.map((planKey) => {
            const plan = PLANS[planKey];
            const isCurrent = planKey === currentPlan;
            const isUpgrade =
              planOrder.indexOf(planKey) > planOrder.indexOf(currentPlan);

            return (
              <div
                key={planKey}
                className={cn(
                  'relative bg-white dark:bg-gray-800 rounded-xl border-2 p-6 transition-shadow',
                  isCurrent
                    ? 'border-brand-500 shadow-md shadow-brand-100 dark:shadow-brand-900/30'
                    : 'border-gray-200 dark:border-gray-700 hover:shadow-md'
                )}
              >
                {isCurrent && (
                  <div className="text-center mb-2">
                    <Badge variant="info" className="shadow-sm">
                      Plan actuel
                    </Badge>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <div className="mt-2">
                    {plan.price === 0 ? (
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        Gratuit
                      </span>
                    ) : (
                      <div>
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                          {plan.price.toFixed(2)} EUR
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400"> / mois</span>
                      </div>
                    )}
                  </div>
                </div>

                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                    >
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <Button variant="secondary" className="w-full" disabled>
                    Plan actuel
                  </Button>
                ) : isUpgrade ? (
                  <Button
                    className="w-full gap-2"
                    onClick={() => handleUpgrade(planKey)}
                    isLoading={loadingCheckout === planKey}
                  >
                    <Sparkles className="h-4 w-4" />
                    Passer a {plan.name}
                  </Button>
                ) : (
                  <Button variant="ghost" className="w-full" disabled>
                    --
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment History */}
      <Card title="Historique de paiement">
        {loadingPayments ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              Aucun paiement effectue pour le moment.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-200">
                      {formatDate(payment.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {payment.description}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">
                      {(payment.amount / 100).toFixed(2)}{' '}
                      {payment.currency.toUpperCase()}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          payment.status === 'succeeded'
                            ? 'success'
                            : payment.status === 'pending'
                              ? 'warning'
                              : 'danger'
                        }
                      >
                        {payment.status === 'succeeded'
                          ? 'Paye'
                          : payment.status === 'pending'
                            ? 'En attente'
                            : 'Echoue'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
