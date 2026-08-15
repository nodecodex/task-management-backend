import { Prisma, Role, User } from '@prisma/client';
import { prisma } from '../config/database.js';

export const userSelectSafe = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type UserSafe = Prisma.UserGetPayload<{ select: typeof userSelectSafe }>;

export class UserRepository {
  public async findById(id: string): Promise<UserSafe | null> {
    return prisma.user.findUnique({
      where: { id },
      select: userSelectSafe,
    });
  }

  public async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  public async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<[UserSafe[], number]> {
    const { skip, take, where, orderBy } = params;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take,
        where,
        select: userSelectSafe,
        orderBy: orderBy || { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return [users, total];
  }

  public async create(data: {
    name: string;
    email: string;
    password: string;
    role?: Role;
  }): Promise<UserSafe> {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        password: data.password,
        role: data.role || Role.MEMBER,
      },
      select: userSelectSafe,
    });
  }

  public async update(
    id: string,
    data: Prisma.UserUpdateInput
  ): Promise<UserSafe> {
    return prisma.user.update({
      where: { id },
      data,
      select: userSelectSafe,
    });
  }

  public async delete(id: string): Promise<UserSafe> {
    return prisma.user.delete({
      where: { id },
      select: userSelectSafe,
    });
  }

  public async count(where?: Prisma.UserWhereInput): Promise<number> {
    return prisma.user.count({ where });
  }
}

export const userRepository = new UserRepository();
