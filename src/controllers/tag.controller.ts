import { Request, Response, NextFunction } from 'express';
import { tagService } from '../services/tag.service.js';
import { ApiResponse } from '../utils/api-response.js';
import { HTTP_STATUS } from '../constants/index.js';

export class TagController {
  public async getTags(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tags = await tagService.getTags();
      ApiResponse.success(res, 'Tags fetched successfully', tags, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  public async getTagById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tag = await tagService.getTagById(req.params.id);
      ApiResponse.success(res, 'Tag fetched successfully', tag, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  public async createTag(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tag = await tagService.createTag(req.body);
      ApiResponse.success(
        res,
        'Tag created successfully',
        tag,
        HTTP_STATUS.CREATED
      );
    } catch (error) {
      next(error);
    }
  }

  public async updateTag(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tag = await tagService.updateTag(req.params.id, req.body);
      ApiResponse.success(res, 'Tag updated successfully', tag, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  public async deleteTag(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await tagService.deleteTag(req.params.id);
      ApiResponse.success(res, 'Tag deleted successfully', null, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

export const tagController = new TagController();
