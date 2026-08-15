import { Router } from 'express';
import { taskController } from '../controllers/task.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdParamSchema,
  taskQuerySchema,
} from '../validators/task.validator.js';
import { taskCommentRoutes } from './comment.routes.js';

const router = Router();

router.use(authenticate);

// Mount task comment sub-router
router.use('/:taskId/comments', taskCommentRoutes);

router.get(
  '/',
  validateRequest({ query: taskQuerySchema }),
  taskController.getTasks
);

router.get(
  '/:id',
  validateRequest({ params: taskIdParamSchema }),
  taskController.getTaskById
);

router.post(
  '/',
  validateRequest({ body: createTaskSchema }),
  taskController.createTask
);

router.put(
  '/:id',
  validateRequest({ params: taskIdParamSchema, body: updateTaskSchema }),
  taskController.updateTask
);

router.delete(
  '/:id',
  validateRequest({ params: taskIdParamSchema }),
  taskController.deleteTask
);

export const taskRoutes = router;
