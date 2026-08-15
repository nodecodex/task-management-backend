import { TaskStatus, TaskPriority } from '@prisma/client';
import { prisma } from '../config/database.js';
import { buildDashboardFilters } from '../utils/query-builder.js';
import { DashboardFilterOptions, DashboardStats } from '../types/task.types.js';

export class DashboardRepository {
  public async getDashboardStats(filters: DashboardFilterOptions): Promise<DashboardStats> {
    const baseWhere = buildDashboardFilters(filters);
    const now = new Date();

    const [
      totalTasks,
      totalUsers,
      statusGroups,
      priorityGroups,
      overdueTasks,
    ] = await Promise.all([
      // Total tasks matching filter
      prisma.task.count({ where: baseWhere }),

      // Total registered users
      prisma.user.count(),

      // Status breakdown via database GROUP BY
      prisma.task.groupBy({
        by: ['status'],
        where: baseWhere,
        _count: {
          _all: true,
        },
      }),

      // Priority breakdown via database GROUP BY
      prisma.task.groupBy({
        by: ['priority'],
        where: baseWhere,
        _count: {
          _all: true,
        },
      }),

      // Overdue tasks (due date past now, and not completed)
      prisma.task.count({
        where: {
          ...baseWhere,
          status: {
            not: TaskStatus.COMPLETED,
          },
          dueDate: {
            lt: now,
          },
        },
      }),
    ]);

    // Map status counts
    const statusCountMap: Record<TaskStatus, number> = {
      [TaskStatus.TODO]: 0,
      [TaskStatus.IN_PROGRESS]: 0,
      [TaskStatus.REVIEW]: 0,
      [TaskStatus.COMPLETED]: 0,
      [TaskStatus.BLOCKED]: 0,
    };

    for (const group of statusGroups) {
      statusCountMap[group.status] = group._count._all;
    }

    // Map priority counts
    const priorityCountMap: Record<TaskPriority, number> = {
      [TaskPriority.LOW]: 0,
      [TaskPriority.MEDIUM]: 0,
      [TaskPriority.HIGH]: 0,
      [TaskPriority.URGENT]: 0,
    };

    for (const group of priorityGroups) {
      priorityCountMap[group.priority] = group._count._all;
    }

    return {
      total_tasks: totalTasks,
      todo: statusCountMap[TaskStatus.TODO],
      in_progress: statusCountMap[TaskStatus.IN_PROGRESS],
      review: statusCountMap[TaskStatus.REVIEW],
      completed: statusCountMap[TaskStatus.COMPLETED],
      blocked: statusCountMap[TaskStatus.BLOCKED],
      high_priority: priorityCountMap[TaskPriority.HIGH],
      urgent: priorityCountMap[TaskPriority.URGENT],
      overdue: overdueTasks,
      total_users: totalUsers,
    };
  }
}

export const dashboardRepository = new DashboardRepository();
