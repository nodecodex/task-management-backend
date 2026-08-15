import { z } from 'zod';

export const createTagSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  theme: z.string().max(50).optional().default('info'),
});

export const updateTagSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').max(100).optional(),
  theme: z.string().max(50).optional(),
});

export const tagIdParamSchema = z.object({
  id: z.string().uuid('Invalid tag ID format'),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
