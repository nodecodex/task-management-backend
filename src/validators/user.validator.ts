import { z } from 'zod';
import { Role } from '@prisma/client';

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(150),
  email: z.string().email('Invalid email address').max(255),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .optional()
    .default('Password123!'),
  role: z.nativeEnum(Role).optional().default(Role.MEMBER),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(150).optional(),
  email: z.string().email('Invalid email address').max(255).optional(),
  password: z.string().min(6).optional(),
  role: z.nativeEnum(Role).optional(),
});

export const userQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  search: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
});

export const userIdParamSchema = z.object({
  id: z.string().uuid('Invalid user ID format'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserQueryInput = z.infer<typeof userQuerySchema>;
