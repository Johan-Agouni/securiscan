import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Shield,
  Zap,
  BarChart3,
  Bell,
  Lock,
  Globe,
  ArrowRight,
  ScanLine,
  FileCheck,
  Clock,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Fonctionnalites - SecuriScan',
  description:
    'Decouvrez toutes les fonctionnalites de SecuriScan : scan de securite, analyse en temps reel, score de securite, alertes, conformite OWASP et plus encore.',
};

const coreFeatures = [
  {
    icon: Shield,
    title: 'Scan de securite complet',
    description:
      'Analysez les en-tetes HTTP, les certificats SSL et les vulnerabilites OWASP de vos sites web en profondeur. Chaque scan verifie des dizaines de points de securite critiques.',
    details: [
      'En-tetes HTTP de securite (CSP, HSTS, X-Frame-Options...)',
      'Validation des certificats SSL/TLS',
      'Detection des vulnerabilites OWASP Top 10',
      'Analyse de la configuration du serveur',
    ],
    color: 'text-brand-600',
    bgColor: 'bg-brand-50',
  },
  {
    icon: Zap,
    title: 'Analyse en temps reel',
    description:
      'Lancez des scans automatises en arriere-plan et recevez des resultats instantanes. Configurez des scans planifies pour une surveillance continue.',
    details: [
      'Scans manuels a la demande',
      'Resultats en quelques secondes',
      'File d\'attente intelligente',
      'Historique complet des scans',
    ],
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  {
    icon: BarChart3,
    title: 'Score de securite',
    description:
      'Obtenez une note claire de 0 a 100 avec un grade de A a F. Suivez l\'evolution de votre securite dans le temps grace aux graphiques detailles.',
    details: [
      'Score global de 0 a 100',
      'Grade lettre de A a F',
      'Repartition par categorie',
      'Historique et tendances',
    ],
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    icon: Bell,
    title: 'Alertes instantanees',
    description:
      'Soyez informe immediatement lorsqu\'une vulnerabilite critique est detectee. Configurez vos preferences de notification selon vos besoins.',
    details: [
      'Notifications par email',
      'Alertes en temps reel',
      'Personnalisation des seuils',
      'Resume quotidien optionnel',
    ],
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  {
    icon: Lock,
    title: 'Conformite OWASP',
    description:
      'Verifiez la conformite de vos sites avec le Top 10 OWASP, le standard de reference en matiere de securite des applications web.',
    details: [
      'Verification du Top 10 OWASP',
      'Recommandations detaillees',
      'Liens vers la documentation',
      'Prioritisation des corrections',
    ],
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    icon: Globe,
    title: 'Multi-sites',
    description:
      'Surveillez tous vos sites web depuis un seul dashboard centralise. Gerez facilement la securite de toute votre infrastructure web.',
    details: [
      'Dashboard centralise',
      'Vue d\'ensemble de tous les sites',
      'Comparaison des scores',
      'Gestion par equipe',
    ],
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
  },
];

const additionalFeatures = [
  {
    icon: ScanLine,
    title: 'Rapports detailles',
    description:
      'Generez des rapports complets avec des recommandations concretes pour chaque vulnerabilite detectee.',
  },
  {
    icon: FileCheck,
    title: 'Export des donnees',
    description:
      'Exportez vos rapports de scan pour les partager avec votre equipe ou vos clients.',
  },
  {
    icon: Clock,
    title: 'Historique complet',
    description:
      'Consultez l\'historique de tous vos scans et suivez l\'evolution de la securite de vos sites dans le temps.',
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="bg-gradient-to-b from-slate-900 to-slate-800 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              Des outils puissants pour la securite de vos sites
            </h1>
            <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
              Decouvrez toutes les fonctionnalites qui font de SecuriScan la
              solution ideale pour proteger vos sites web.
            </p>
          </div>
        </section>

        {/* Core features - detailed */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-20">
              {coreFeatures.map((feature, index) => {
                const Icon = feature.icon;
                const isReversed = index % 2 === 1;

                return (
                  <div
                    key={feature.title}
                    className={`flex flex-col ${
                      isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'
                    } items-center gap-12 lg:gap-16`}
                  >
                    {/* Text */}
                    <div className="flex-1">
                      <div
                        className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.bgColor} ${feature.color} mb-4`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                        {feature.title}
                      </h2>
                      <p className="text-gray-600 leading-relaxed mb-6">
                        {feature.description}
                      </p>
                      <ul className="space-y-3">
                        {feature.details.map((detail) => (
                          <li
                            key={detail}
                            className="flex items-center gap-3 text-sm text-gray-700"
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${feature.bgColor.replace('bg-', 'bg-').replace('-50', '-500')}`}
                            />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Visual card */}
                    <div className="flex-1 w-full max-w-md">
                      <div
                        className={`rounded-2xl p-8 ${feature.bgColor} border border-gray-200`}
                      >
                        <div className="flex items-center justify-center h-48">
                          <Icon
                            className={`h-24 w-24 ${feature.color} opacity-30`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Additional features */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
              Et bien plus encore...
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {additionalFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="bg-white p-6 rounded-xl border border-gray-200 text-center"
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-50 text-brand-600 mb-4">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Pret a essayer SecuriScan ?
            </h2>
            <p className="mt-3 text-gray-600">
              Creez votre compte gratuit et lancez votre premier scan en moins
              de 2 minutes.
            </p>
            <div className="mt-8">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors shadow-md shadow-brand-600/25"
              >
                Commencer gratuitement
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
