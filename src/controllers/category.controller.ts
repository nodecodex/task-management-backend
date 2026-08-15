import { Request, Response, NextFunction } from 'express';
import { categoryService } from '../services/category.service.js';
import { ApiResponse } from '../utils/api-response.js';
import { HTTP_STATUS } from '../constants/index.js';

export class CategoryController {
  public async getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await categoryService.getCategories();
      ApiResponse.success(res, 'Categories fetched successfully', categories, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  public async getCategoryById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await categoryService.getCategoryById(req.params.id);
      ApiResponse.success(res, 'Category fetched successfully', category, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  public async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await categoryService.createCategory(req.body);
      ApiResponse.success(
        res,
        'Category created successfully',
        category,
        HTTP_STATUS.CREATED
      );
    } catch (error) {
      next(error);
    }
  }

  public async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await categoryService.updateCategory(req.params.id, req.body);
      ApiResponse.success(res, 'Category updated successfully', category, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  public async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await categoryService.deleteCategory(req.params.id);
      ApiResponse.success(res, 'Category deleted successfully', null, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

export const categoryController = new CategoryController();
