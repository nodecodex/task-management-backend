import { z } from 'zod';
import { TaskStatus, TaskPriority } from '@prisma/client';

const statusEnum = z.preprocess((val) => {
  if (typeof val === 'string') return val.toUpperCase();
  return val;
}, z.nativeEnum(TaskStatus));

const priorityEnum = z.preprocess((val) => {
  if (typeof val === 'string') return val.toUpperCase();
  return val;
}, z.nativeEnum(TaskPriority));

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  status: statusEnum.optional().default(TaskStatus.TODO),
  priority: priorityEnum.optional().default(TaskPriority.MEDIUM),
  board_id: z.string().uuid('Invalid board ID format'),
  category_id: z.string().uuid('Invalid category ID format').optional().nullable(),
  due_date: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .optional()
    .nullable(),
  assignee_ids: z.array(z.string().uuid('Invalid user ID in assignees')).optional().default([]),
  tag_ids: z.array(z.string().uuid('Invalid tag ID in tags')).optional().default([]),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').max(255).optional(),
  description: z.string().optional().nullable(),
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  board_id: z.string().uuid('Invalid board ID format').optional(),
  category_id: z.string().uuid('Invalid category ID format').optional().nullable(),
  due_date: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .optional()
    .nullable(),
  assignee_ids: z.array(z.string().uuid('Invalid user ID in assignees')).optional(),
  tag_ids: z.array(z.string().uuid('Invalid tag ID in tags')).optional(),
});

export const taskIdParamSchema = z.object({
  id: z.string().uuid('Invalid task ID format'),
});

export const taskQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  assignee: z.string().optional(),
  board_id: z.string().uuid().optional(),
  category_id: z.string().uuid().optional(),
  due_date: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'dueDate', 'priority', 'status']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
