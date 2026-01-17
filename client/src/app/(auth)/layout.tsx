import React from 'react';
import { Shield } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-2.5 bg-brand-600 rounded-xl shadow-lg shadow-brand-200 group-hover:shadow-brand-300 transition-shadow">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              SecuriScan
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
