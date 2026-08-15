import { AuthService } from '../../src/services/auth.service.js';
import { userRepository } from '../../src/repositories/user.repository.js';
import { ConflictError, UnauthorizedError } from '../../src/utils/errors.js';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

jest.mock('../../src/repositories/user.repository.js');

describe('AuthService Unit Tests', () => {
  let authService: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService();
  });

  describe('register', () => {
    it('should register a new user successfully and return user with JWT token', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (userRepository.create as jest.Mock).mockResolvedValue({
        id: 'user-uuid-1',
        name: 'Sara Dervashi',
        email: 'sara@example.com',
        role: Role.MEMBER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await authService.register({
        name: 'Sara Dervashi',
        email: 'sara@example.com',
        password: 'Password123!',
      });

      expect(result.user.email).toBe('sara@example.com');
      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe('string');
    });

    it('should throw ConflictError if user with email already exists', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue({
        id: 'existing-id',
        email: 'existing@example.com',
      });

      await expect(
        authService.register({
          name: 'Sara',
          email: 'existing@example.com',
          password: 'Password123!',
        })
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('login', () => {
    it('should authenticate user with valid credentials and return JWT token', async () => {
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      (userRepository.findByEmail as jest.Mock).mockResolvedValue({
        id: 'user-uuid-1',
        name: 'Sara',
        email: 'sara@example.com',
        password: hashedPassword,
        role: Role.MEMBER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await authService.login({
        email: 'sara@example.com',
        password: 'Password123!',
      });

      expect(result.user.id).toBe('user-uuid-1');
      expect(result.token).toBeDefined();
    });

    it('should throw UnauthorizedError when user is not found', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'unknown@example.com',
          password: 'Password123!',
        })
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError when password does not match', async () => {
      const hashedPassword = await bcrypt.hash('CorrectPassword123!', 10);
      (userRepository.findByEmail as jest.Mock).mockResolvedValue({
        id: 'user-uuid-1',
        name: 'Sara',
        email: 'sara@example.com',
        password: hashedPassword,
        role: Role.MEMBER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        authService.login({
          email: 'sara@example.com',
          password: 'WrongPassword!',
        })
      ).rejects.toThrow(UnauthorizedError);
    });
  });
});
