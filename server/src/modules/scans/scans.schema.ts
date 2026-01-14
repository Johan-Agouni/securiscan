import { z } from 'zod';

export const triggerScanSchema = {
  params: z.object({
    siteId: z.string().uuid(),
  }),
};

export const scanHistorySchema = {
  params: z.object({
    siteId: z.string().uuid(),
  }),
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
  }),
};

export const scanDetailSchema = {
  params: z.object({
    scanId: z.string().uuid(),
  }),
};

export const scanResultsSchema = {
  params: z.object({
    scanId: z.string().uuid(),
  }),
  query: z.object({
    category: z.enum(['headers', 'ssl', 'owasp', 'performance']).optional(),
  }),
};
