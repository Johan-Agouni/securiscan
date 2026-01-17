'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: 'Puis-je commencer gratuitement ?',
    answer:
      'Oui ! Le plan gratuit vous permet de surveiller jusqu\'a 2 sites web avec 5 scans par jour. Aucune carte de credit n\'est requise pour commencer.',
  },
  {
    question: 'Puis-je changer de plan a tout moment ?',
    answer:
      'Absolument. Vous pouvez passer a un plan superieur ou inferieur a tout moment depuis vos parametres de facturation. Le changement prend effet immediatement.',
  },
  {
    question: 'Que se passe-t-il si je depasse ma limite de scans ?',
    answer:
      'Vous recevrez une notification lorsque vous approchez de votre limite. Une fois la limite atteinte, les scans seront mis en pause jusqu\'au lendemain. Passez a un plan superieur pour augmenter votre quota.',
  },
  {
    question: 'Les donnees de mes scans sont-elles securisees ?',
    answer:
      'Oui. Toutes les donnees sont chiffrees en transit et au repos. Nous ne partageons jamais vos donnees avec des tiers. Vos rapports de scan sont accessibles uniquement par votre compte.',
  },
  {
    question: 'Quels types de vulnerabilites sont detectees ?',
    answer:
      'SecuriScan analyse les en-tetes HTTP de securite, les certificats SSL/TLS, les vulnerabilites du Top 10 OWASP, et d\'autres indicateurs de securite web. Chaque scan fournit un rapport detaille avec des recommandations.',
  },
  {
    question: 'Comment fonctionne le plan Business ?',
    answer:
      'Le plan Business offre jusqu\'a 50 sites, des scans illimites, un historique d\'un an, et un support prioritaire. Contactez-nous pour une demonstration personnalisee.',
  },
];

function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-5 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-base font-medium text-gray-900">{question}</span>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-gray-500 transition-transform duration-200 flex-shrink-0 ml-4',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          isOpen ? 'max-h-96 pb-5' : 'max-h-0'
        )}
      >
        <p className="text-sm text-gray-600 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

export function PricingFAQ() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Questions frequentes
          </h2>
          <p className="mt-3 text-gray-600">
            Tout ce que vous devez savoir sur nos plans et tarifs.
          </p>
        </div>

        <div className="divide-y divide-gray-200 border-t border-gray-200">
          {faqs.map((faq) => (
            <FAQItem
              key={faq.question}
              question={faq.question}
              answer={faq.answer}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
