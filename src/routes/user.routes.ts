import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
  userQuerySchema,
} from '../validators/user.validator.js';
import { Role } from '@prisma/client';

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.get(
  '/',
  validateRequest({ query: userQuerySchema }),
  userController.getUsers
);

router.get(
  '/:id',
  validateRequest({ params: userIdParamSchema }),
  userController.getUserById
);

router.post(
  '/',
  authorize(Role.ADMIN),
  validateRequest({ body: createUserSchema }),
  userController.createUser
);

router.put(
  '/:id',
  validateRequest({ params: userIdParamSchema, body: updateUserSchema }),
  userController.updateUser
);

router.delete(
  '/:id',
  authorize(Role.ADMIN),
  validateRequest({ params: userIdParamSchema }),
  userController.deleteUser
);

export const userRoutes = router;
