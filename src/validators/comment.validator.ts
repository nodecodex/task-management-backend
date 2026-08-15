import { z } from 'zod';

export const createCommentSchema = z.object({
  comment: z.string().min(1, 'Comment text is required').max(5000),
});

export const updateCommentSchema = z.object({
  comment: z.string().min(1, 'Comment text is required').max(5000),
});

export const commentIdParamSchema = z.object({
  id: z.string().uuid('Invalid comment ID format'),
});

export const taskCommentParamsSchema = z.object({
  taskId: z.string().uuid('Invalid task ID format'),
});

export const commentQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
