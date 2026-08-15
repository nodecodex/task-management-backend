import request from 'supertest';
import { app } from '../../src/app.js';
import { prisma } from '../../src/config/database.js';
import { createTestToken } from '../helpers/auth.helper.js';
import { TaskStatus, TaskPriority } from '@prisma/client';

jest.mock('../../src/config/database.js', () => ({
  prisma: {
    task: {
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    user: {
      count: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  },
  connectDatabase: jest.fn(),
  disconnectDatabase: jest.fn(),
}));

describe('Dashboard REST API Integration Tests', () => {
  const token = createTestToken();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/v1/dashboard should return aggregated stats', async () => {
    // 1st count: total tasks
    (prisma.task.count as jest.Mock)
      .mockResolvedValueOnce(50) // total tasks
      .mockResolvedValueOnce(4); // overdue tasks

    // total users
    (prisma.user.count as jest.Mock).mockResolvedValue(10);

    // groupBy status
    (prisma.task.groupBy as jest.Mock)
      .mockResolvedValueOnce([
        { status: TaskStatus.TODO, _count: { _all: 15 } },
        { status: TaskStatus.IN_PROGRESS, _count: { _all: 20 } },
        { status: TaskStatus.REVIEW, _count: { _all: 5 } },
        { status: TaskStatus.COMPLETED, _count: { _all: 8 } },
        { status: TaskStatus.BLOCKED, _count: { _all: 2 } },
      ])
      // groupBy priority
      .mockResolvedValueOnce([
        { priority: TaskPriority.HIGH, _count: { _all: 12 } },
        { priority: TaskPriority.URGENT, _count: { _all: 6 } },
      ]);

    const res = await request(app)
      .get('/api/v1/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.total_tasks).toBe(50);
    expect(res.body.data.todo).toBe(15);
    expect(res.body.data.in_progress).toBe(20);
    expect(res.body.data.review).toBe(5);
    expect(res.body.data.completed).toBe(8);
    expect(res.body.data.blocked).toBe(2);
    expect(res.body.data.high_priority).toBe(12);
    expect(res.body.data.urgent).toBe(6);
    expect(res.body.data.overdue).toBe(4);
    expect(res.body.data.total_users).toBe(10);
  });
});
