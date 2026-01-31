export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: 'USER' | 'ADMIN';
  plan: 'FREE' | 'PRO' | 'BUSINESS';
  emailVerified: boolean;
  notificationsEnabled: boolean;
  createdAt: string;
}

export type ScanSchedule = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface Site {
  id: string;
  url: string;
  name: string;
  isActive: boolean;
  scanSchedule?: ScanSchedule;
  nextScanAt?: string | null;
  createdAt: string;
  updatedAt: string;
  latestScan?: Scan | null;
  latestScore?: number | null;
  _count?: { scans: number };
}

export interface Scan {
  id: string;
  siteId: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  overallScore: number | null;
  startedAt: string | null;
  completedAt: string | null;
  errorMessage: string | null;
  createdAt: string;
  site?: Site;
  results?: ScanResult[];
}

export interface ScanResult {
  id: string;
  scanId: string;
  category: string;
  checkName: string;
  severity: 'PASS' | 'INFO' | 'WARNING' | 'CRITICAL';
  value: string | null;
  expected: string | null;
  message: string;
  recommendation: string | null;
  rawData?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
  errors?: Record<string, string[]>;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
