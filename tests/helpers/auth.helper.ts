import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { env } from '../../src/config/env.js';
import { JwtPayload } from '../../src/types/auth.types.js';

export function createTestToken(overrides?: Partial<JwtPayload>): string {
  const payload: JwtPayload = {
    userId: '00000000-0000-0000-0000-000000000001',
    email: 'admin@example.com',
    name: 'Admin User',
    role: Role.ADMIN,
    ...overrides,
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '1h',
  });
}
