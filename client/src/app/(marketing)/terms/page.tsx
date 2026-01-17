import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Conditions d\'utilisation - SecuriScan',
  description:
    'Conditions generales d\'utilisation de SecuriScan. Regles d\'utilisation du service de surveillance de securite web.',
};

const sections = [
  {
    title: '1. Objet',
    content: [
      'Les presentes conditions generales d\'utilisation (CGU) regissent l\'acces et l\'utilisation du service SecuriScan, plateforme SaaS de surveillance de securite web.',
      'En creant un compte ou en utilisant le service, vous acceptez les presentes conditions dans leur integralite.',
    ],
  },
  {
    title: '2. Description du service',
    content: [
      'SecuriScan permet aux utilisateurs d\'analyser la securite de leurs sites web en effectuant des scans automatises. Le service verifie les en-tetes HTTP, les certificats SSL/TLS, les vulnerabilites OWASP et les performances de securite.',
      'Les resultats des scans sont fournis a titre informatif et ne constituent pas un audit de securite complet. SecuriScan ne garantit pas la detection de toutes les vulnerabilites.',
    ],
  },
  {
    title: '3. Inscription et compte',
    content: [
      'L\'utilisation du service necessite la creation d\'un compte avec une adresse email valide. Vous etes responsable de la confidentialite de vos identifiants de connexion.',
      'Vous vous engagez a fournir des informations exactes lors de votre inscription et a les maintenir a jour.',
    ],
  },
  {
    title: '4. Utilisation autorisee',
    content: [
      'Vous ne pouvez scanner que les sites web dont vous etes proprietaire ou pour lesquels vous disposez d\'une autorisation explicite du proprietaire.',
      'Il est strictement interdit d\'utiliser SecuriScan pour : tenter de compromettre la securite de sites tiers, effectuer des attaques par deni de service, collecter des donnees personnelles sans consentement, ou toute autre activite illegale.',
      'SecuriScan se reserve le droit de suspendre ou supprimer tout compte utilise en violation de ces conditions.',
    ],
  },
  {
    title: '5. Plans et tarification',
    content: [
      'SecuriScan propose plusieurs plans (Gratuit, Pro, Business) avec des fonctionnalites et limites differentes. Les details des plans sont disponibles sur la page Tarifs.',
      'Les abonnements payants sont factures mensuellement via Stripe. Vous pouvez annuler votre abonnement a tout moment depuis votre espace client.',
      'SecuriScan se reserve le droit de modifier ses tarifs avec un preavis de 30 jours.',
    ],
  },
  {
    title: '6. Propriete intellectuelle',
    content: [
      'Le service SecuriScan, son interface, son code source et ses algorithmes sont proteges par le droit d\'auteur. Toute reproduction ou reutilisation non autorisee est interdite.',
      'Les rapports de scan generes par le service sont la propriete de l\'utilisateur.',
    ],
  },
  {
    title: '7. Limitation de responsabilite',
    content: [
      'SecuriScan est fourni "en l\'etat". Nous ne garantissons pas la disponibilite ininterrompue du service ni l\'exactitude exhaustive des resultats de scan.',
      'SecuriScan ne pourra etre tenu responsable des dommages directs ou indirects resultant de l\'utilisation ou de l\'impossibilite d\'utiliser le service.',
    ],
  },
  {
    title: '8. Modification des conditions',
    content: [
      'SecuriScan se reserve le droit de modifier les presentes conditions a tout moment. Les utilisateurs seront informes des modifications par email.',
      'L\'utilisation continue du service apres notification vaut acceptation des nouvelles conditions.',
    ],
  },
  {
    title: '9. Contact',
    content: [
      'Pour toute question relative aux presentes conditions, contactez-nous a l\'adresse : contact@securiscan.dev',
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="bg-gradient-to-b from-slate-900 to-slate-800 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Conditions d&apos;utilisation
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
              Bienvenue sur SecuriScan. Veuillez lire attentivement les
              presentes conditions generales d&apos;utilisation avant d&apos;utiliser
              notre service.
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
