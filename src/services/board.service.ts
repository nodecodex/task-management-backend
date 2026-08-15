import { Board, Prisma } from '@prisma/client';
import { boardRepository } from '../repositories/board.repository.js';
import { NotFoundError } from '../utils/errors.js';
import { ERROR_CODES } from '../constants/index.js';
import { parsePagination, createPaginationMeta } from '../utils/pagination.js';
import { CreateBoardInput, UpdateBoardInput, BoardQueryInput } from '../validators/board.validator.js';
import { PaginationMeta } from '../types/common.types.js';
import { SocketService } from '../sockets/socket.service.js';

export class BoardService {
  public async getBoards(
    query: BoardQueryInput
  ): Promise<{ boards: Board[]; meta: PaginationMeta }> {
    const { page, limit, skip } = parsePagination(query.page, query.limit);

    const where: Prisma.BoardWhereInput = {};

    if (query.search && query.search.trim()) {
      where.title = {
        contains: query.search.trim(),
        mode: 'insensitive',
      };
    }

    const [boards, total] = await boardRepository.findMany({
      skip,
      take: limit,
      where,
      orderBy: { createdAt: 'desc' },
    });

    const meta = createPaginationMeta(total, page, limit);

    return { boards, meta };
  }

  public async getBoardById(id: string, includeTasks: boolean = true) {
    const board = includeTasks
      ? await boardRepository.findByIdWithTasks(id)
      : await boardRepository.findById(id);

    if (!board) {
      throw new NotFoundError('Board not found', ERROR_CODES.BOARD_NOT_FOUND);
    }

    return board;
  }

  public async createBoard(input: CreateBoardInput): Promise<Board> {
    return boardRepository.create(input);
  }

  public async updateBoard(id: string, input: UpdateBoardInput): Promise<Board> {
    const existing = await boardRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Board not found', ERROR_CODES.BOARD_NOT_FOUND);
    }

    const updated = await boardRepository.update(id, input);
    SocketService.emitBoardUpdated(id, updated);
    return updated;
  }

  public async deleteBoard(id: string): Promise<Board> {
    const existing = await boardRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Board not found', ERROR_CODES.BOARD_NOT_FOUND);
    }

    return boardRepository.delete(id);
  }
}

export const boardService = new BoardService();
