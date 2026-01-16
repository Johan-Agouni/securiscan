import React from 'react';
import Link from 'next/link';
import { Shield, Lock, ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-brand-950">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg
          className="absolute inset-0 h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="hero-grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-brand-400"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
      </div>

      {/* Decorative glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/20 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Text content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-sm font-medium mb-6">
              <Shield className="h-4 w-4" />
              Protection en temps reel
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
              Protegez vos sites web{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-blue-400">
                en temps reel
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-gray-300 max-w-2xl leading-relaxed">
              Analysez automatiquement la securite de vos sites web. Detectez
              les vulnerabilites, verifiez les en-tetes HTTP, les certificats
              SSL et les failles OWASP en quelques secondes.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-500 transition-colors shadow-lg shadow-brand-600/25 text-base"
              >
                Commencer gratuitement
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/features"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors border border-white/10 text-base"
              >
                Voir les fonctionnalites
              </Link>
            </div>

            <p className="mt-5 text-sm text-gray-400">
              Aucune carte de credit requise. Commencez avec le plan gratuit.
            </p>
          </div>

          {/* Decorative illustration */}
          <div className="flex-shrink-0 hidden lg:block">
            <div className="relative w-80 h-80">
              {/* Shield outline */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 rounded-full border-2 border-brand-500/20 animate-pulse" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 rounded-full border border-brand-400/30" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-brand-600/20 flex items-center justify-center">
                  <Shield className="h-16 w-16 text-brand-400" />
                </div>
              </div>
              {/* Floating icons */}
              <div className="absolute top-4 right-8 p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10 animate-bounce [animation-duration:3s]">
                <Lock className="h-6 w-6 text-green-400" />
              </div>
              <div className="absolute bottom-8 left-4 p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10 animate-bounce [animation-duration:4s] [animation-delay:0.5s]">
                <svg
                  className="h-6 w-6 text-brand-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
