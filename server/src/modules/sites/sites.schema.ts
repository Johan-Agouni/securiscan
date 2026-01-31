import { z } from 'zod';

export const createSiteSchema = {
  body: z.object({
    url: z
      .string()
      .url('Must be a valid URL')
      .refine(
        (val) => val.startsWith('http://') || val.startsWith('https://'),
        { message: 'URL must start with http:// or https://' }
      ),
    name: z
      .string()
      .min(1, 'Name is required')
      .max(100, 'Name must be 100 characters or fewer'),
  }),
};

export const updateSiteSchema = {
  body: z.object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(100, 'Name must be 100 characters or fewer')
      .optional(),
    isActive: z.boolean().optional(),
  }),
};

export const updateScheduleSchema = {
  params: z.object({
    siteId: z.string().uuid('Invalid site ID'),
  }),
  body: z.object({
    scanSchedule: z.enum(['NONE', 'DAILY', 'WEEKLY', 'MONTHLY']),
  }),
};

export const siteIdParamSchema = {
  params: z.object({
    siteId: z.string().uuid('Invalid site ID'),
  }),
};
