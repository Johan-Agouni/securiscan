import React from 'react';
import Link from 'next/link';
import { Shield, Github } from 'lucide-react';

const footerLinks = [
  { href: '/#features', label: 'Fonctionnalites' },
  { href: '/#pricing', label: 'Tarifs' },
  { href: '/privacy', label: 'Confidentialite' },
  { href: '/terms', label: 'Conditions' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo and copyright */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-white font-bold text-lg"
            >
              <Shield className="h-6 w-6 text-brand-400" />
              <span>SecuriScan</span>
            </Link>
            <p className="text-sm">
              &copy; {currentYear} SecuriScan. Tous droits reserves.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Social */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Johan-Agouni/securiscan"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-gray-800 hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
