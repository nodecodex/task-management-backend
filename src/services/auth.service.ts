import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { userRepository } from '../repositories/user.repository.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors.js';
import { ERROR_CODES } from '../constants/index.js';
import { RegisterInput, LoginInput } from '../validators/auth.validator.js';
import { AuthResponse, JwtPayload, UserResponse } from '../types/auth.types.js';

export class AuthService {
  private generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  }

  public async register(input: RegisterInput): Promise<AuthResponse> {
    const existingUser = await userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictError(
        'User with this email already exists',
        ERROR_CODES.EMAIL_ALREADY_EXISTS
      );
    }

    const hashedPassword = await hashPassword(input.password);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: input.role,
    });

    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return {
      user,
      token,
    };
  }

  public async login(input: LoginInput): Promise<AuthResponse> {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError(
        'Invalid email or password',
        ERROR_CODES.INVALID_CREDENTIALS
      );
    }

    const isPasswordValid = await comparePassword(input.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError(
        'Invalid email or password',
        ERROR_CODES.INVALID_CREDENTIALS
      );
    }

    const safeUser: UserResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return {
      user: safeUser,
      token,
    };
  }

  public async getMe(userId: string): Promise<UserResponse> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found', ERROR_CODES.USER_NOT_FOUND);
    }
    return user;
  }
}

export const authService = new AuthService();
