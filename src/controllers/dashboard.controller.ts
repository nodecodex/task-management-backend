import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service.js';
import { ApiResponse } from '../utils/api-response.js';
import { HTTP_STATUS } from '../constants/index.js';

export class DashboardController {
  public async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await dashboardService.getDashboardStats(req.query);
      ApiResponse.success(
        res,
        'Dashboard statistics fetched successfully',
        stats,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
