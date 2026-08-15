import { Prisma, Role } from '@prisma/client';
import { userRepository, UserSafe } from '../repositories/user.repository.js';
import { hashPassword } from '../utils/password.js';
import { ConflictError, NotFoundError, ForbiddenError } from '../utils/errors.js';
import { ERROR_CODES } from '../constants/index.js';
import { parsePagination, createPaginationMeta } from '../utils/pagination.js';
import { CreateUserInput, UpdateUserInput, UserQueryInput } from '../validators/user.validator.js';
import { AuthenticatedUser, PaginationMeta } from '../types/common.types.js';

export class UserService {
  public async getUsers(
    query: UserQueryInput
  ): Promise<{ users: UserSafe[]; meta: PaginationMeta }> {
    const { page, limit, skip } = parsePagination(query.page, query.limit);

    const where: Prisma.UserWhereInput = {};

    if (query.role) {
      where.role = query.role;
    }

    if (query.search && query.search.trim()) {
      const searchTerm = query.search.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await userRepository.findMany({
      skip,
      take: limit,
      where,
      orderBy: { createdAt: 'desc' },
    });

    const meta = createPaginationMeta(total, page, limit);

    return { users, meta };
  }

  public async getUserById(id: string): Promise<UserSafe> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found', ERROR_CODES.USER_NOT_FOUND);
    }
    return user;
  }

  public async createUser(input: CreateUserInput): Promise<UserSafe> {
    const existingUser = await userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictError(
        'User with this email already exists',
        ERROR_CODES.EMAIL_ALREADY_EXISTS
      );
    }

    const hashedPassword = await hashPassword(input.password || 'Password123!');
    return userRepository.create({
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: input.role || Role.MEMBER,
    });
  }

  public async updateUser(
    id: string,
    input: UpdateUserInput,
    requestingUser?: AuthenticatedUser
  ): Promise<UserSafe> {
    const existing = await userRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('User not found', ERROR_CODES.USER_NOT_FOUND);
    }

    // Permission check: only admin or the user themselves can update
    if (requestingUser && requestingUser.role !== Role.ADMIN && requestingUser.id !== id) {
      throw new ForbiddenError('You can only update your own profile');
    }

    // Role escalation check: only Admin can change roles
    if (input.role && requestingUser && requestingUser.role !== Role.ADMIN && input.role !== existing.role) {
      throw new ForbiddenError('Only admins can change user roles');
    }

    const updateData: Prisma.UserUpdateInput = {};

    if (input.name) updateData.name = input.name;
    if (input.role && requestingUser?.role === Role.ADMIN) updateData.role = input.role;

    if (input.email && input.email.toLowerCase() !== existing.email.toLowerCase()) {
      const emailTaken = await userRepository.findByEmail(input.email);
      if (emailTaken && emailTaken.id !== id) {
        throw new ConflictError(
          'User with this email already exists',
          ERROR_CODES.EMAIL_ALREADY_EXISTS
        );
      }
      updateData.email = input.email.toLowerCase();
    }

    if (input.password) {
      updateData.password = await hashPassword(input.password);
    }

    return userRepository.update(id, updateData);
  }

  public async deleteUser(id: string, requestingUser?: AuthenticatedUser): Promise<UserSafe> {
    const existing = await userRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('User not found', ERROR_CODES.USER_NOT_FOUND);
    }

    // Prevent deleting self if admin or enforce admin role
    if (requestingUser && requestingUser.id === id) {
      throw new ForbiddenError('You cannot delete your own admin account');
    }

    return userRepository.delete(id);
  }
}

export const userService = new UserService();
