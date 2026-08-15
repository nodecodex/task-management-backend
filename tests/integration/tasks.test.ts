import request from 'supertest';
import { app } from '../../src/app.js';
import { prisma } from '../../src/config/database.js';
import { createTestToken } from '../helpers/auth.helper.js';
import { TaskStatus, TaskPriority } from '@prisma/client';

jest.mock('../../src/config/database.js', () => ({
  prisma: {
    board: {
      findUnique: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
    },
    task: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    taskAssignee: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    taskTag: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(prisma)),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  },
  connectDatabase: jest.fn(),
  disconnectDatabase: jest.fn(),
}));

describe('Tasks REST API Integration Tests', () => {
  const token = createTestToken();
  const sampleBoardId = '00000000-0000-0000-0000-000000000001';
  const sampleTaskId = '00000000-0000-0000-0000-000000000010';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/tasks', () => {
    it('should fetch tasks with pagination and status filters', async () => {
      (prisma.task.findMany as jest.Mock).mockResolvedValue([
        {
          id: sampleTaskId,
          title: 'Implement Kanban Board',
          description: 'Frontend and Backend integration',
          status: TaskStatus.IN_PROGRESS,
          priority: TaskPriority.HIGH,
          boardId: sampleBoardId,
          createdAt: new Date(),
          updatedAt: new Date(),
          assignees: [],
          tags: [],
          _count: { comments: 2 },
        },
      ]);
      (prisma.task.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/tasks?status=in_progress&priority=high&page=1&limit=20')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].status).toBe('IN_PROGRESS');
      expect(res.body.meta.total).toBe(1);
    });
  });

  describe('POST /api/v1/tasks', () => {
    it('should create new task successfully', async () => {
      (prisma.board.findUnique as jest.Mock).mockResolvedValue({ id: sampleBoardId });
      (prisma.task.create as jest.Mock).mockResolvedValue({
        id: sampleTaskId,
        title: 'New Integration Task',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        boardId: sampleBoardId,
        assignees: [],
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'New Integration Task',
          board_id: sampleBoardId,
          status: 'todo',
          priority: 'medium',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('New Integration Task');
    });
  });

  describe('PUT /api/v1/tasks/:id (Kanban Movement)', () => {
    it('should update task status and return updated task data', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({
        id: sampleTaskId,
        title: 'Move Task',
        status: TaskStatus.TODO,
        boardId: sampleBoardId,
        createdById: '00000000-0000-0000-0000-000000000001',
        assignees: [],
      });

      (prisma.task.update as jest.Mock).mockResolvedValue({
        id: sampleTaskId,
        title: 'Move Task',
        status: TaskStatus.IN_PROGRESS,
        boardId: sampleBoardId,
        createdById: '00000000-0000-0000-0000-000000000001',
        assignees: [],
        tags: [],
      });

      const res = await request(app)
        .put(`/api/v1/tasks/${sampleTaskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'in_progress',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe(TaskStatus.IN_PROGRESS);
    });
  });

  describe('DELETE /api/v1/tasks/:id', () => {
    it('should delete task successfully', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({
        id: sampleTaskId,
        title: 'Delete Task',
        boardId: sampleBoardId,
        createdById: '00000000-0000-0000-0000-000000000001',
        assignees: [],
      });

      (prisma.task.delete as jest.Mock).mockResolvedValue({
        id: sampleTaskId,
        title: 'Delete Task',
        boardId: sampleBoardId,
      });

      const res = await request(app)
        .delete(`/api/v1/tasks/${sampleTaskId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
