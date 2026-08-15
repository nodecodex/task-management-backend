import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service.js';
import { ApiResponse } from '../utils/api-response.js';
import { HTTP_STATUS } from '../constants/index.js';

export class UserController {
  public async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await userService.getUsers(req.query);
      ApiResponse.paginated(
        res,
        'Users fetched successfully',
        result.users,
        result.meta,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  public async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getUserById(req.params.id);
      ApiResponse.success(res, 'User fetched successfully', user, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  public async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.createUser(req.body);
      ApiResponse.success(
        res,
        'User created successfully',
        user,
        HTTP_STATUS.CREATED
      );
    } catch (error) {
      next(error);
    }
  }

  public async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.updateUser(req.params.id, req.body, req.user);
      ApiResponse.success(res, 'User updated successfully', user, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  public async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await userService.deleteUser(req.params.id, req.user);
      ApiResponse.success(res, 'User deleted successfully', null, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
