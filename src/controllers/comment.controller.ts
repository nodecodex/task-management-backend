import { Request, Response, NextFunction } from 'express';
import { commentService } from '../services/comment.service.js';
import { ApiResponse } from '../utils/api-response.js';
import { HTTP_STATUS } from '../constants/index.js';

export class CommentController {
  public async getTaskComments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskId } = req.params;
      const { page, limit } = req.query;
      const result = await commentService.getTaskComments(taskId, page, limit);
      ApiResponse.paginated(
        res,
        'Comments fetched successfully',
        result.comments,
        result.meta,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  public async addComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User context missing');
      }
      const { taskId } = req.params;
      const { comment } = req.body;
      const result = await commentService.addComment(taskId, comment, req.user);
      ApiResponse.success(
        res,
        'Comment added successfully',
        result,
        HTTP_STATUS.CREATED
      );
    } catch (error) {
      next(error);
    }
  }

  public async updateComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User context missing');
      }
      const { id } = req.params;
      const { comment } = req.body;
      const result = await commentService.updateComment(id, comment, req.user);
      ApiResponse.success(res, 'Comment updated successfully', result, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  public async deleteComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User context missing');
      }
      const { id } = req.params;
      await commentService.deleteComment(id, req.user);
      ApiResponse.success(res, 'Comment deleted successfully', null, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

export const commentController = new CommentController();
