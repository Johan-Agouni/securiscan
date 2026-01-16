import React from 'react';
import Link from 'next/link';
import { ArrowRight, Shield } from 'lucide-react';

export function CallToAction() {
  return (
    <section className="relative overflow-hidden bg-slate-900 py-20 sm:py-28">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600/20 mb-8">
          <Shield className="h-8 w-8 text-brand-400" />
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
          Pret a securiser vos sites web ?
        </h2>

        <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
          Rejoignez des centaines de developpeurs et entreprises qui font
          confiance a SecuriScan pour proteger leurs sites web.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-500 transition-colors shadow-lg shadow-brand-600/25 text-base"
          >
            Commencez gratuitement
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        <p className="mt-5 text-sm text-gray-400">
          Aucune carte de credit requise. Configuration en 2 minutes.
        </p>
      </div>
    </section>
  );
}
