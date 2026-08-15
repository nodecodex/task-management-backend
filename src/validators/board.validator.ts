import { z } from 'zod';

export const createBoardSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150),
  theme: z.string().max(50).optional().default('light'),
});

export const updateBoardSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').max(150).optional(),
  theme: z.string().max(50).optional(),
});

export const boardIdParamSchema = z.object({
  id: z.string().uuid('Invalid board ID format'),
});

export const boardQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  search: z.string().optional(),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;
export type BoardQueryInput = z.infer<typeof boardQuerySchema>;
