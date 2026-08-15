import { Router } from 'express';
import { authRoutes } from './auth.routes.js';
import { userRoutes } from './user.routes.js';
import { boardRoutes } from './board.routes.js';
import { categoryRoutes } from './category.routes.js';
import { tagRoutes } from './tag.routes.js';
import { taskRoutes } from './task.routes.js';
import { commentRoutes } from './comment.routes.js';
import { dashboardRoutes } from './dashboard.routes.js';

const router = Router();

router.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Kanban Task Manager REST API v1 is active and running',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      boards: '/api/v1/boards',
      categories: '/api/v1/categories',
      tags: '/api/v1/tags',
      tasks: '/api/v1/tasks',
      comments: '/api/v1/comments',
      dashboard: '/api/v1/dashboard',
    },
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/boards', boardRoutes);
router.use('/categories', categoryRoutes);
router.use('/tags', tagRoutes);
router.use('/tasks', taskRoutes);
router.use('/comments', commentRoutes);
router.use('/dashboard', dashboardRoutes);

export const apiRouter = router;
