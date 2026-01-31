export interface CheckResult {
  category: string;
  checkName: string;
  severity: 'PASS' | 'INFO' | 'WARNING' | 'CRITICAL';
  value: string | null;
  expected: string | null;
  message: string;
  recommendation: string | null;
  rawData?: Record<string, unknown>;
}

export interface ScanJobData {
  scanId: string;
  siteUrl: string;
  siteId?: string;
  scheduled?: boolean;
}
