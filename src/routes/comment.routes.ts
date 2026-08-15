import { Router } from 'express';
import { commentController } from '../controllers/comment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import {
  createCommentSchema,
  updateCommentSchema,
  commentIdParamSchema,
  taskCommentParamsSchema,
  commentQuerySchema,
} from '../validators/comment.validator.js';

const router = Router();

router.use(authenticate);

// Direct comment operations
router.put(
  '/:id',
  validateRequest({ params: commentIdParamSchema, body: updateCommentSchema }),
  commentController.updateComment
);

router.delete(
  '/:id',
  validateRequest({ params: commentIdParamSchema }),
  commentController.deleteComment
);

export const commentRoutes = router;

// Task sub-routes for comments
const taskCommentRouter = Router({ mergeParams: true });

taskCommentRouter.use(authenticate);

taskCommentRouter.get(
  '/',
  validateRequest({ params: taskCommentParamsSchema, query: commentQuerySchema }),
  commentController.getTaskComments
);

taskCommentRouter.post(
  '/',
  validateRequest({ params: taskCommentParamsSchema, body: createCommentSchema }),
  commentController.addComment
);

export const taskCommentRoutes = taskCommentRouter;
