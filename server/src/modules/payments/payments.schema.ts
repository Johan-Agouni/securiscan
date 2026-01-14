import { z } from 'zod';

export const checkoutSchema = {
  body: z.object({
    plan: z.enum(['PRO', 'BUSINESS']),
  }),
};

export const paymentHistorySchema = {
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
  }),
};
