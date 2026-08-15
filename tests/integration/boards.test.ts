import request from 'supertest';
import { app } from '../../src/app.js';
import { prisma } from '../../src/config/database.js';
import { createTestToken } from '../helpers/auth.helper.js';

jest.mock('../../src/config/database.js', () => ({
  prisma: {
    board: {
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

describe('Boards REST API Integration Tests', () => {
  const token = createTestToken();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/v1/boards should return boards list', async () => {
    (prisma.board.findMany as jest.Mock).mockResolvedValue([
      {
        id: '00000000-0000-0000-0000-000000000001',
        title: 'Project Roadmap',
        theme: 'light',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { tasks: 5 },
      },
    ]);
    (prisma.board.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app)
      .get('/api/v1/boards')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta.total).toBe(1);
  });

  it('POST /api/v1/boards should create new board', async () => {
    (prisma.board.create as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000002',
      title: 'Sprint 24 Board',
      theme: 'dark',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await request(app)
      .post('/api/v1/boards')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Sprint 24 Board',
        theme: 'dark',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Sprint 24 Board');
  });
});
