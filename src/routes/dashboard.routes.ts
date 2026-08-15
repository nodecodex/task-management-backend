import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { dashboardQuerySchema } from '../validators/dashboard.validator.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  validateRequest({ query: dashboardQuerySchema }),
  dashboardController.getDashboard
);

export const dashboardRoutes = router;
