import { Tag } from '@prisma/client';
import { prisma } from '../config/database.js';

export class TagRepository {
  public async findById(id: string): Promise<Tag | null> {
    return prisma.tag.findUnique({
      where: { id },
    });
  }

  public async findByName(name: string): Promise<Tag | null> {
    return prisma.tag.findUnique({
      where: { name },
    });
  }

  public async findAll(): Promise<Tag[]> {
    return prisma.tag.findMany({
      orderBy: { name: 'asc' },
    });
  }

  public async create(data: { name: string; theme?: string }): Promise<Tag> {
    return prisma.tag.create({
      data: {
        name: data.name,
        theme: data.theme || 'info',
      },
    });
  }

  public async update(id: string, data: { name?: string; theme?: string }): Promise<Tag> {
    return prisma.tag.update({
      where: { id },
      data,
    });
  }

  public async delete(id: string): Promise<Tag> {
    return prisma.tag.delete({
      where: { id },
    });
  }
}

export const tagRepository = new TagRepository();
