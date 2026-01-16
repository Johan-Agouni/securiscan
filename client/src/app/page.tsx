import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { PricingCards } from '@/components/landing/PricingCards';
import { CallToAction } from '@/components/landing/CallToAction';

export const metadata: Metadata = {
  title: 'SecuriScan - Protegez vos sites web en temps reel',
  description:
    'Analysez automatiquement la securite de vos sites web. Detectez les vulnerabilites, verifiez les en-tetes HTTP, les certificats SSL et les failles OWASP.',
  openGraph: {
    title: 'SecuriScan - Protegez vos sites web en temps reel',
    description:
      'Analysez automatiquement la securite de vos sites web. Detectez les vulnerabilites, verifiez les en-tetes HTTP, les certificats SSL et les failles OWASP.',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <PricingCards />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}
