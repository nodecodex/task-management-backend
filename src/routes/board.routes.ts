import { Router } from 'express';
import { boardController } from '../controllers/board.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import {
  createBoardSchema,
  updateBoardSchema,
  boardIdParamSchema,
  boardQuerySchema,
} from '../validators/board.validator.js';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  validateRequest({ query: boardQuerySchema }),
  boardController.getBoards
);

router.get(
  '/:id',
  validateRequest({ params: boardIdParamSchema }),
  boardController.getBoardById
);

router.post(
  '/',
  authorize(Role.ADMIN, Role.MANAGER),
  validateRequest({ body: createBoardSchema }),
  boardController.createBoard
);

router.put(
  '/:id',
  authorize(Role.ADMIN, Role.MANAGER),
  validateRequest({ params: boardIdParamSchema, body: updateBoardSchema }),
  boardController.updateBoard
);

router.delete(
  '/:id',
  authorize(Role.ADMIN),
  validateRequest({ params: boardIdParamSchema }),
  boardController.deleteBoard
);

export const boardRoutes = router;
