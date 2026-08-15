import { buildTaskFilters, buildDashboardFilters } from '../../src/utils/query-builder.js';
import { TaskStatus, TaskPriority } from '@prisma/client';

describe('Query Builder Utility', () => {
  it('should build where filters for status and priority', () => {
    const filters = {
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
    };

    const where = buildTaskFilters(filters);
    expect(where.status).toBe(TaskStatus.IN_PROGRESS);
    expect(where.priority).toBe(TaskPriority.HIGH);
  });

  it('should build assignee relation filter', () => {
    const filters = {
      assignee: 'user-uuid-123',
    };

    const where = buildTaskFilters(filters);
    expect(where.assignees).toEqual({
      some: {
        userId: 'user-uuid-123',
      },
    });
  });

  it('should build case-insensitive search filter across title and description', () => {
    const filters = {
      search: 'shopify migration',
    };

    const where = buildTaskFilters(filters);
    expect(where.OR).toEqual([
      { title: { contains: 'shopify migration', mode: 'insensitive' } },
      { description: { contains: 'shopify migration', mode: 'insensitive' } },
    ]);
  });

  it('should build dashboard filters with date range', () => {
    const filters = {
      board_id: 'board-123',
      date_from: '2026-01-01',
      date_to: '2026-01-31',
    };

    const where = buildDashboardFilters(filters);
    expect(where.boardId).toBe('board-123');
    expect(where.createdAt).toBeDefined();
  });
});
