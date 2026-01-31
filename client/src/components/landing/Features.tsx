import React from 'react';
import { Shield, Zap, BarChart3, Bell, Lock, Globe } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Scan de securite complet',
    description:
      'Analysez les en-tetes HTTP, les certificats SSL et les vulnerabilites OWASP de vos sites web en profondeur.',
    color: 'text-brand-600',
    bgColor: 'bg-brand-50',
  },
  {
    icon: Zap,
    title: 'Analyse en temps reel',
    description:
      'Lancez des scans automatises en arriere-plan et recevez des resultats instantanes sur la securite de vos sites.',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  {
    icon: BarChart3,
    title: 'Score de securite',
    description:
      'Obtenez une note de 0 a 100 avec un grade de A a F pour evaluer rapidement le niveau de securite de chaque site.',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    icon: Bell,
    title: 'Alertes instantanees',
    description:
      'Recevez des notifications par email des qu\'une vulnerabilite critique est detectee sur l\'un de vos sites.',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  {
    icon: Lock,
    title: 'Bonnes pratiques OWASP',
    description:
      'Verifiez les bonnes pratiques de securite inspirees du referentiel OWASP : cookies securises, divulgation d\'informations et methodes HTTP.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    icon: Globe,
    title: 'Multi-sites',
    description:
      'Surveillez tous vos sites web depuis un seul dashboard. Gerez facilement la securite de votre infrastructure.',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
  },
];

export function Features() {
  return (
    <section className="py-20 sm:py-28 bg-white" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-sm font-semibold text-brand-600 uppercase tracking-wide mb-3">
            Fonctionnalites
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Tout ce dont vous avez besoin pour securiser vos sites
          </h2>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed">
            SecuriScan analyse en profondeur la securite de vos sites web et
            vous fournit des recommandations claires pour corriger les
            vulnerabilites detectees.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative p-6 rounded-2xl border border-gray-200 hover:border-brand-200 hover:shadow-lg transition-all duration-300"
              >
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.bgColor} ${feature.color} mb-4`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
