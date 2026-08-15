import request from 'supertest';
import { app } from '../../src/app.js';
import { prisma } from '../../src/config/database.js';
import { createTestToken } from '../helpers/auth.helper.js';

jest.mock('../../src/config/database.js', () => ({
  prisma: {
    task: {
      findUnique: jest.fn(),
    },
    comment: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  },
  connectDatabase: jest.fn(),
  disconnectDatabase: jest.fn(),
}));

describe('Comments REST API Integration Tests', () => {
  const token = createTestToken();
  const sampleTaskId = '00000000-0000-0000-0000-000000000010';
  const sampleCommentId = '00000000-0000-0000-0000-000000000020';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/v1/tasks/:taskId/comments should return task comments', async () => {
    (prisma.task.findUnique as jest.Mock).mockResolvedValue({
      id: sampleTaskId,
      boardId: '00000000-0000-0000-0000-000000000001',
    });

    (prisma.comment.findMany as jest.Mock).mockResolvedValue([
      {
        id: sampleCommentId,
        taskId: sampleTaskId,
        userId: '00000000-0000-0000-0000-000000000001',
        comment: 'Initial design draft completed',
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { id: '00000000-0000-0000-0000-000000000001', name: 'Sara', email: 'sara@example.com', role: 'MEMBER' },
      },
    ]);
    (prisma.comment.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app)
      .get(`/api/v1/tasks/${sampleTaskId}/comments`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('POST /api/v1/tasks/:taskId/comments should add a comment', async () => {
    (prisma.task.findUnique as jest.Mock).mockResolvedValue({
      id: sampleTaskId,
      boardId: '00000000-0000-0000-0000-000000000001',
    });

    (prisma.comment.create as jest.Mock).mockResolvedValue({
      id: sampleCommentId,
      taskId: sampleTaskId,
      userId: '00000000-0000-0000-0000-000000000001',
      comment: 'Reviewing PR today',
      createdAt: new Date(),
      updatedAt: new Date(),
      user: { id: '00000000-0000-0000-0000-000000000001', name: 'Admin', email: 'admin@example.com', role: 'ADMIN' },
    });

    const res = await request(app)
      .post(`/api/v1/tasks/${sampleTaskId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        comment: 'Reviewing PR today',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.comment).toBe('Reviewing PR today');
  });
});
