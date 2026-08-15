import { registerSchema, loginSchema } from '../../src/validators/auth.validator.js';
import { createTaskSchema, updateTaskSchema } from '../../src/validators/task.validator.js';
import { TaskStatus, TaskPriority, Role } from '@prisma/client';

describe('Validation Schemas', () => {
  describe('registerSchema', () => {
    it('should validate valid user registration payload', () => {
      const valid = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
        role: Role.MEMBER,
      };

      const result = registerSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const invalid = {
        name: 'John Doe',
        email: 'not-an-email',
        password: 'Password123!',
      };

      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject short passwords', () => {
      const invalid = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123',
      };

      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should validate valid login payload', () => {
      const valid = {
        email: 'john@example.com',
        password: 'Password123!',
      };
      const result = loginSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject missing password', () => {
      const invalid = {
        email: 'john@example.com',
        password: '',
      };
      const result = loginSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('updateTaskSchema', () => {
    it('should validate partial task updates', () => {
      const valid = {
        title: 'Updated Task Title',
        status: 'completed',
      };
      const result = updateTaskSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe(TaskStatus.COMPLETED);
      }
    });
  });

  describe('createTaskSchema', () => {
    it('should accept valid task payload with UUID board_id', () => {
      const valid = {
        title: 'Complete Kanban Module',
        board_id: '00000000-0000-0000-0000-000000000001',
        status: 'in_progress',
        priority: 'high',
      };

      const result = createTaskSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe(TaskStatus.IN_PROGRESS);
        expect(result.data.priority).toBe(TaskPriority.HIGH);
      }
    });

    it('should reject missing title', () => {
      const invalid = {
        board_id: '00000000-0000-0000-0000-000000000001',
      };

      const result = createTaskSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject invalid board UUID format', () => {
      const invalid = {
        title: 'Task Title',
        board_id: 'not-a-uuid',
      };

      const result = createTaskSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });
});
