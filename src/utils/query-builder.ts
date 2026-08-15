import { Prisma } from '@prisma/client';
import { TaskFilterOptions, DashboardFilterOptions } from '../types/task.types.js';

export function buildTaskFilters(filters: TaskFilterOptions): Prisma.TaskWhereInput {
  const where: Prisma.TaskWhereInput = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.priority) {
    where.priority = filters.priority;
  }

  if (filters.board_id) {
    where.boardId = filters.board_id;
  }

  if (filters.category_id) {
    where.categoryId = filters.category_id;
  }

  if (filters.assignee) {
    where.assignees = {
      some: {
        userId: filters.assignee,
      },
    };
  }

  if (filters.due_date) {
    const targetDate = new Date(filters.due_date);
    if (!isNaN(targetDate.getTime())) {
      // Find tasks due on or before target date end-of-day
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      where.dueDate = {
        lte: endOfDay,
      };
    }
  }

  if (filters.search && filters.search.trim() !== '') {
    const searchTerm = filters.search.trim();
    where.OR = [
      {
        title: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
      {
        description: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
    ];
  }

  return where;
}

export function buildDashboardFilters(filters: DashboardFilterOptions): Prisma.TaskWhereInput {
  const where: Prisma.TaskWhereInput = {};

  if (filters.board_id) {
    where.boardId = filters.board_id;
  }

  if (filters.assignee) {
    where.assignees = {
      some: {
        userId: filters.assignee,
      },
    };
  }

  if (filters.date_from || filters.date_to) {
    where.createdAt = {};
    if (filters.date_from) {
      const from = new Date(filters.date_from);
      if (!isNaN(from.getTime())) {
        where.createdAt.gte = from;
      }
    }
    if (filters.date_to) {
      const to = new Date(filters.date_to);
      if (!isNaN(to.getTime())) {
        where.createdAt.lte = to;
      }
    }
  }

  return where;
}
