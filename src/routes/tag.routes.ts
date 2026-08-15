import { Router } from 'express';
import { tagController } from '../controllers/tag.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import {
  createTagSchema,
  updateTagSchema,
  tagIdParamSchema,
} from '../validators/tag.validator.js';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/', tagController.getTags);

router.get(
  '/:id',
  validateRequest({ params: tagIdParamSchema }),
  tagController.getTagById
);

router.post(
  '/',
  authorize(Role.ADMIN, Role.MANAGER),
  validateRequest({ body: createTagSchema }),
  tagController.createTag
);

router.put(
  '/:id',
  authorize(Role.ADMIN, Role.MANAGER),
  validateRequest({ params: tagIdParamSchema, body: updateTagSchema }),
  tagController.updateTag
);

router.delete(
  '/:id',
  authorize(Role.ADMIN),
  validateRequest({ params: tagIdParamSchema }),
  tagController.deleteTag
);

export const tagRoutes = router;
