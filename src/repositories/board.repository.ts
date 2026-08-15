import { Board, Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';

export class BoardRepository {
  public async findById(id: string): Promise<Board | null> {
    return prisma.board.findUnique({
      where: { id },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });
  }

  public async findByIdWithTasks(id: string) {
    return prisma.board.findUnique({
      where: { id },
      include: {
        tasks: {
          include: {
            category: true,
            assignees: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, role: true },
                },
              },
            },
            tags: {
              include: {
                tag: true,
              },
            },
            _count: {
              select: { comments: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  public async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.BoardWhereInput;
    orderBy?: Prisma.BoardOrderByWithRelationInput;
  }): Promise<[Board[], number]> {
    const { skip, take, where, orderBy } = params;

    const [boards, total] = await Promise.all([
      prisma.board.findMany({
        skip,
        take,
        where,
        include: {
          _count: {
            select: { tasks: true },
          },
        },
        orderBy: orderBy || { createdAt: 'desc' },
      }),
      prisma.board.count({ where }),
    ]);

    return [boards, total];
  }

  public async create(data: { title: string; theme?: string }): Promise<Board> {
    return prisma.board.create({
      data: {
        title: data.title,
        theme: data.theme || 'light',
      },
    });
  }

  public async update(id: string, data: Prisma.BoardUpdateInput): Promise<Board> {
    return prisma.board.update({
      where: { id },
      data,
    });
  }

  public async delete(id: string): Promise<Board> {
    return prisma.board.delete({
      where: { id },
    });
  }
}

export const boardRepository = new BoardRepository();
