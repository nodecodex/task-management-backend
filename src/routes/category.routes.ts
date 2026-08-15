import { Router } from 'express';
import { categoryController } from '../controllers/category.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema,
} from '../validators/category.validator.js';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/', categoryController.getCategories);

router.get(
  '/:id',
  validateRequest({ params: categoryIdParamSchema }),
  categoryController.getCategoryById
);

router.post(
  '/',
  authorize(Role.ADMIN, Role.MANAGER),
  validateRequest({ body: createCategorySchema }),
  categoryController.createCategory
);

router.put(
  '/:id',
  authorize(Role.ADMIN, Role.MANAGER),
  validateRequest({ params: categoryIdParamSchema, body: updateCategorySchema }),
  categoryController.updateCategory
);

router.delete(
  '/:id',
  authorize(Role.ADMIN),
  validateRequest({ params: categoryIdParamSchema }),
  categoryController.deleteCategory
);

export const categoryRoutes = router;
