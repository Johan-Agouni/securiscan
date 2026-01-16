import React from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { PLANS } from '@/lib/constants';
import { cn } from '@/lib/utils';

const planConfig = [
  {
    key: 'FREE' as const,
    cta: 'Commencer',
    highlighted: false,
  },
  {
    key: 'PRO' as const,
    cta: 'Essayer Pro',
    highlighted: true,
    badge: 'Populaire',
  },
  {
    key: 'BUSINESS' as const,
    cta: 'Contacter',
    highlighted: false,
  },
];

export function PricingCards() {
  return (
    <section className="py-20 sm:py-28 bg-gray-50" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-sm font-semibold text-brand-600 uppercase tracking-wide mb-3">
            Tarifs
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Un plan adapte a chaque besoin
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Commencez gratuitement et evoluez selon vos besoins. Aucun
            engagement, annulez a tout moment.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {planConfig.map((config) => {
            const plan = PLANS[config.key];

            return (
              <div
                key={config.key}
                className={cn(
                  'relative flex flex-col rounded-2xl border bg-white p-8 shadow-sm transition-shadow hover:shadow-md',
                  config.highlighted
                    ? 'border-brand-600 ring-2 ring-brand-600'
                    : 'border-gray-200'
                )}
              >
                {/* Popular badge */}
                {config.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-semibold bg-brand-600 text-white shadow-sm">
                      {config.badge}
                    </span>
                  </div>
                )}

                {/* Plan name */}
                <h3 className="text-lg font-semibold text-gray-900">
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-gray-900">
                    {plan.price === 0 ? 'Gratuit' : `${plan.price}\u00A0\u20AC`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-sm text-gray-500">/mois</span>
                  )}
                </div>

                {/* Features list */}
                <ul className="mt-8 space-y-3 flex-1">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm text-gray-700"
                    >
                      <Check
                        className={cn(
                          'h-5 w-5 flex-shrink-0 mt-0.5',
                          config.highlighted
                            ? 'text-brand-600'
                            : 'text-green-500'
                        )}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href="/register"
                  className={cn(
                    'mt-8 block text-center py-3 px-6 rounded-lg font-semibold text-sm transition-colors',
                    config.highlighted
                      ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-md shadow-brand-600/25'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  )}
                >
                  {config.cta}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
