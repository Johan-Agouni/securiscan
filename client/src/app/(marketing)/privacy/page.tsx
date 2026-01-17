import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Politique de confidentialite - SecuriScan',
  description:
    'Politique de confidentialite de SecuriScan. Decouvrez comment nous collectons, utilisons et protegeons vos donnees personnelles.',
};

const sections = [
  {
    title: '1. Donnees collectees',
    content: [
      'Lors de votre inscription, nous collectons votre adresse email, votre nom et prenom. Ces informations sont necessaires pour creer et gerer votre compte.',
      'Lorsque vous ajoutez un site a surveiller, nous enregistrons l\'URL du site et les resultats des scans de securite effectues.',
      'Nous collectons egalement des donnees techniques telles que votre adresse IP, le type de navigateur et les pages consultees, a des fins d\'amelioration du service.',
    ],
  },
  {
    title: '2. Utilisation des donnees',
    content: [
      'Vos donnees sont utilisees pour fournir et ameliorer le service SecuriScan : gestion de votre compte, execution des scans de securite, generation des rapports et envoi des notifications.',
      'Nous ne vendons jamais vos donnees personnelles a des tiers. Vos informations ne sont partagees qu\'avec les prestataires techniques necessaires au fonctionnement du service (hebergement, envoi d\'emails).',
    ],
  },
  {
    title: '3. Securite des donnees',
    content: [
      'Les mots de passe sont hashes avec l\'algorithme bcrypt et ne sont jamais stockes en clair. Les communications sont chiffrees via HTTPS/TLS.',
      'L\'authentification repose sur des tokens JWT avec rotation automatique. Les tokens d\'acces expirent apres 15 minutes et les tokens de rafraichissement apres 7 jours.',
      'L\'acces a la base de donnees est restreint et les requetes sont parametrees pour prevenir les injections SQL.',
    ],
  },
  {
    title: '4. Conservation des donnees',
    content: [
      'Les donnees de votre compte sont conservees tant que votre compte est actif. L\'historique des scans est conserve selon votre plan : 7 jours (Gratuit), 90 jours (Pro), 1 an (Business).',
      'Vous pouvez demander la suppression de votre compte et de toutes vos donnees a tout moment en nous contactant.',
    ],
  },
  {
    title: '5. Cookies',
    content: [
      'SecuriScan utilise uniquement des cookies techniques essentiels au fonctionnement du service (authentification, preferences). Aucun cookie publicitaire ou de tracking tiers n\'est utilise.',
    ],
  },
  {
    title: '6. Vos droits',
    content: [
      'Conformement au RGPD, vous disposez d\'un droit d\'acces, de rectification, de suppression et de portabilite de vos donnees personnelles.',
      'Pour exercer ces droits, contactez-nous a l\'adresse : contact@securiscan.dev',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="bg-gradient-to-b from-slate-900 to-slate-800 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Politique de confidentialite
            </h1>
            <p className="mt-4 text-lg text-gray-300">
              Derniere mise a jour : janvier 2025
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-gray-600 leading-relaxed mb-10">
              Chez SecuriScan, la protection de vos donnees personnelles est une
              priorite. Cette politique de confidentialite explique quelles
              donnees nous collectons, comment nous les utilisons et comment nous
              les protegeons.
            </p>

            <div className="space-y-10">
              {sections.map((section) => (
                <div key={section.title}>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {section.title}
                  </h2>
                  <div className="space-y-3">
                    {section.content.map((paragraph, i) => (
                      <p
                        key={i}
                        className="text-gray-600 leading-relaxed"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour a l&apos;accueil
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
