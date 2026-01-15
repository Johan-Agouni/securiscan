import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'SecuriScan - Surveillance de Securite Web',
  description:
    'Surveillez et analysez la sécurité de vos sites web. Détectez les vulnérabilités, vérifiez les en-têtes HTTP, les certificats SSL et les failles OWASP.',
  keywords: [
    'sécurité web',
    'scan sécurité',
    'OWASP',
    'SSL',
    'en-têtes HTTP',
    'vulnérabilités',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className={inter.className}>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
