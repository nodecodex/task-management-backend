import { Request, Response, NextFunction } from 'express';
import { taskService } from '../services/task.service.js';
import { ApiResponse } from '../utils/api-response.js';
import { HTTP_STATUS } from '../constants/index.js';

export class TaskController {
  public async getTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await taskService.getTasks(req.query);
      ApiResponse.paginated(
        res,
        'Tasks fetched successfully',
        result.tasks,
        result.meta,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  public async getTaskById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await taskService.getTaskById(req.params.id);
      ApiResponse.success(res, 'Task fetched successfully', task, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  public async createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User context missing');
      }
      const task = await taskService.createTask(req.body, req.user);
      ApiResponse.success(
        res,
        'Task created successfully',
        task,
        HTTP_STATUS.CREATED
      );
    } catch (error) {
      next(error);
    }
  }

  public async updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User context missing');
      }
      const task = await taskService.updateTask(req.params.id, req.body, req.user);
      ApiResponse.success(res, 'Task updated successfully', task, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  public async deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User context missing');
      }
      await taskService.deleteTask(req.params.id, req.user);
      ApiResponse.success(res, 'Task deleted successfully', null, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

export const taskController = new TaskController();
