import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').max(100),
});

export const categoryIdParamSchema = z.object({
  id: z.string().uuid('Invalid category ID format'),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
