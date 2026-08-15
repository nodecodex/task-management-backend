import { Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';
import { CreateTaskDTO, UpdateTaskDTO } from '../types/task.types.js';

export const taskIncludeStandard = {
  board: true,
  category: true,
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
  assignees: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  },
  tags: {
    include: {
      tag: true,
    },
  },
  _count: {
    select: {
      comments: true,
    },
  },
} satisfies Prisma.TaskInclude;

export type TaskWithDetails = Prisma.TaskGetPayload<{
  include: typeof taskIncludeStandard;
}>;

export class TaskRepository {
  public async findById(id: string): Promise<TaskWithDetails | null> {
    return prisma.task.findUnique({
      where: { id },
      include: taskIncludeStandard,
    });
  }

  public async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.TaskWhereInput;
    orderBy?: Prisma.TaskOrderByWithRelationInput;
  }): Promise<[TaskWithDetails[], number]> {
    const { skip, take, where, orderBy } = params;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        skip,
        take,
        where,
        include: taskIncludeStandard,
        orderBy: orderBy || { createdAt: 'desc' },
      }),
      prisma.task.count({ where }),
    ]);

    return [tasks, total];
  }

  public async create(
    data: CreateTaskDTO,
    createdById: string
  ): Promise<TaskWithDetails> {
    return prisma.$transaction(async (tx) => {
      const task = await tx.task.create({
        data: {
          title: data.title,
          description: data.description,
          status: data.status,
          priority: data.priority,
          boardId: data.board_id,
          categoryId: data.category_id || null,
          dueDate: data.due_date ? new Date(data.due_date) : null,
          createdById,
          assignees: data.assignee_ids && data.assignee_ids.length > 0
            ? {
                create: data.assignee_ids.map((userId) => ({ userId })),
              }
            : undefined,
          tags: data.tag_ids && data.tag_ids.length > 0
            ? {
                create: data.tag_ids.map((tagId) => ({ tagId })),
              }
            : undefined,
        },
        include: taskIncludeStandard,
      });

      return task;
    });
  }

  public async update(
    id: string,
    data: UpdateTaskDTO
  ): Promise<TaskWithDetails> {
    return prisma.$transaction(async (tx) => {
      // Sync assignees if provided
      if (data.assignee_ids !== undefined) {
        await tx.taskAssignee.deleteMany({
          where: { taskId: id },
        });

        if (data.assignee_ids.length > 0) {
          await tx.taskAssignee.createMany({
            data: data.assignee_ids.map((userId) => ({
              taskId: id,
              userId,
            })),
          });
        }
      }

      // Sync tags if provided
      if (data.tag_ids !== undefined) {
        await tx.taskTag.deleteMany({
          where: { taskId: id },
        });

        if (data.tag_ids.length > 0) {
          await tx.taskTag.createMany({
            data: data.tag_ids.map((tagId) => ({
              taskId: id,
              tagId,
            })),
          });
        }
      }

      // Update main task record
      const updateData: Prisma.TaskUpdateInput = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.priority !== undefined) updateData.priority = data.priority;
      if (data.board_id !== undefined) {
        updateData.board = { connect: { id: data.board_id } };
      }
      if (data.category_id !== undefined) {
        updateData.category = data.category_id
          ? { connect: { id: data.category_id } }
          : { disconnect: true };
      }
      if (data.due_date !== undefined) {
        updateData.dueDate = data.due_date ? new Date(data.due_date) : null;
      }

      const updatedTask = await tx.task.update({
        where: { id },
        data: updateData,
        include: taskIncludeStandard,
      });

      return updatedTask;
    });
  }

  public async delete(id: string): Promise<TaskWithDetails> {
    return prisma.task.delete({
      where: { id },
      include: taskIncludeStandard,
    });
  }
}

export const taskRepository = new TaskRepository();
