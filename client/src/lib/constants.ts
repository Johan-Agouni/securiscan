export const APP_NAME = 'SecuriScan';

export const PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    maxSites: 2,
    maxScansPerDay: 5,
    features: ['2 sites', '5 scans/day', '7 days history', 'Basic checks'],
  },
  PRO: {
    name: 'Pro',
    price: 9.99,
    maxSites: 10,
    maxScansPerDay: 50,
    features: [
      '10 sites',
      '50 scans/day',
      '90 days history',
      'All checks',
      'Email alerts',
    ],
  },
  BUSINESS: {
    name: 'Business',
    price: 29.99,
    maxSites: 50,
    maxScansPerDay: Infinity,
    features: [
      '50 sites',
      'Unlimited scans',
      '1 year history',
      'All checks',
      'Email alerts',
      'Priority support',
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export const SCAN_CATEGORIES = [
  'headers',
  'ssl',
  'owasp',
  'performance',
] as const;

export type ScanCategory = (typeof SCAN_CATEGORIES)[number];

export const SEVERITY_ORDER: Record<string, number> = {
  CRITICAL: 0,
  WARNING: 1,
  INFO: 2,
  PASS: 3,
};

export const SCAN_STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  RUNNING: 'En cours',
  COMPLETED: 'Terminé',
  FAILED: 'Échoué',
};

export const CATEGORY_LABELS: Record<string, string> = {
  headers: 'En-têtes HTTP',
  ssl: 'Certificat SSL',
  owasp: 'OWASP Top 10',
  performance: 'Performance',
};
