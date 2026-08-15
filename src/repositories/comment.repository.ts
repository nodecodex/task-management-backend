import { Comment, Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';

export const commentIncludeStandard = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
} satisfies Prisma.CommentInclude;

export type CommentWithUser = Prisma.CommentGetPayload<{
  include: typeof commentIncludeStandard;
}>;

export class CommentRepository {
  public async findById(id: string): Promise<CommentWithUser | null> {
    return prisma.comment.findUnique({
      where: { id },
      include: commentIncludeStandard,
    });
  }

  public async findByTaskId(params: {
    taskId: string;
    skip?: number;
    take?: number;
  }): Promise<[CommentWithUser[], number]> {
    const { taskId, skip, take } = params;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { taskId },
        include: commentIncludeStandard,
        skip,
        take,
        orderBy: { createdAt: 'asc' },
      }),
      prisma.comment.count({ where: { taskId } }),
    ]);

    return [comments, total];
  }

  public async create(data: {
    taskId: string;
    userId: string;
    comment: string;
  }): Promise<CommentWithUser> {
    return prisma.comment.create({
      data,
      include: commentIncludeStandard,
    });
  }

  public async update(id: string, comment: string): Promise<CommentWithUser> {
    return prisma.comment.update({
      where: { id },
      data: { comment },
      include: commentIncludeStandard,
    });
  }

  public async delete(id: string): Promise<Comment> {
    return prisma.comment.delete({
      where: { id },
    });
  }
}

export const commentRepository = new CommentRepository();
