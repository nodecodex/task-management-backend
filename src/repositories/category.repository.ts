import { Category } from '@prisma/client';
import { prisma } from '../config/database.js';

export class CategoryRepository {
  public async findById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { id },
    });
  }

  public async findByName(name: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { name },
    });
  }

  public async findAll(): Promise<Category[]> {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  public async create(data: { name: string }): Promise<Category> {
    return prisma.category.create({
      data,
    });
  }

  public async update(id: string, data: { name: string }): Promise<Category> {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  public async delete(id: string): Promise<Category> {
    return prisma.category.delete({
      where: { id },
    });
  }
}

export const categoryRepository = new CategoryRepository();
