import { Request, Response, NextFunction } from 'express';
import { boardService } from '../services/board.service.js';
import { ApiResponse } from '../utils/api-response.js';
import { HTTP_STATUS } from '../constants/index.js';
import { SocketService } from '../sockets/socket.service.js';

export class BoardController {
  public async getBoards(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await boardService.getBoards(req.query);
      ApiResponse.paginated(
        res,
        'Boards fetched successfully',
        result.boards,
        result.meta,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  public async getBoardById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const board = await boardService.getBoardById(req.params.id);
      ApiResponse.success(res, 'Board fetched successfully', board, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  public async createBoard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const board = await boardService.createBoard(req.body);
      SocketService.emitBoardCreated(board);
      ApiResponse.success(
        res,
        'Board created successfully',
        board,
        HTTP_STATUS.CREATED
      );
    } catch (error) {
      next(error);
    }
  }

  public async updateBoard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const board = await boardService.updateBoard(req.params.id, req.body);
      ApiResponse.success(res, 'Board updated successfully', board, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  public async deleteBoard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await boardService.deleteBoard(req.params.id);
      SocketService.emitBoardDeleted(req.params.id);
      ApiResponse.success(res, 'Board deleted successfully', null, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

export const boardController = new BoardController();

