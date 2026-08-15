import { dashboardRepository } from '../repositories/dashboard.repository.js';
import { DashboardFilterOptions, DashboardStats } from '../types/task.types.js';

export class DashboardService {
  public async getDashboardStats(filters: DashboardFilterOptions): Promise<DashboardStats> {
    return dashboardRepository.getDashboardStats(filters);
  }
}

export const dashboardService = new DashboardService();
