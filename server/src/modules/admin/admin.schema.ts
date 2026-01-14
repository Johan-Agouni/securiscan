import { z } from 'zod';

export const userListSchema = {
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
    search: z.string().optional(),
  }),
};

export const userIdParamSchema = {
  params: z.object({
    userId: z.string().uuid(),
  }),
};

export const updateUserSchema = {
  params: z.object({
    userId: z.string().uuid(),
  }),
  body: z.object({
    role: z.enum(['USER', 'ADMIN']).optional(),
    plan: z.enum(['FREE', 'PRO', 'BUSINESS']).optional(),
  }),
};
