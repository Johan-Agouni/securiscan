import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PricingCards } from '@/components/landing/PricingCards';
import { PricingFAQ } from './PricingFAQ';

export const metadata: Metadata = {
  title: 'Tarifs - SecuriScan',
  description:
    'Decouvrez les plans SecuriScan : gratuit, pro et business. Choisissez le plan adapte a vos besoins de securite web.',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="bg-gradient-to-b from-slate-900 to-slate-800 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              Des tarifs simples et transparents
            </h1>
            <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
              Commencez gratuitement, evoluez quand vous en avez besoin. Aucun
              frais cache, aucun engagement.
            </p>
          </div>
        </section>

        <PricingCards />
        <PricingFAQ />
      </main>
      <Footer />
    </div>
  );
}
