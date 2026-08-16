import { getSocketServer } from '../config/socket.js';
import { SOCKET_EVENTS } from '../constants/index.js';
import { logger } from '../utils/logger.js';

export class SocketService {
  private static getRoom(boardId: string): string {
    return `board:${boardId}`;
  }

  public static emitTaskCreated(boardId: string, task: unknown): void {
    const io = getSocketServer();
    if (!io) return;

    const room = this.getRoom(boardId);
    io.to(room).emit(SOCKET_EVENTS.TASK_CREATED, task);
    logger.debug({ room, event: SOCKET_EVENTS.TASK_CREATED }, 'Emitted task:created event');
  }

  public static emitTaskUpdated(boardId: string, task: unknown): void {
    const io = getSocketServer();
    if (!io) return;

    const room = this.getRoom(boardId);
    io.to(room).emit(SOCKET_EVENTS.TASK_UPDATED, task);
    logger.debug({ room, event: SOCKET_EVENTS.TASK_UPDATED }, 'Emitted task:updated event');
  }

  public static emitTaskMoved(boardId: string, task: unknown): void {
    const io = getSocketServer();
    if (!io) return;

    const room = this.getRoom(boardId);
    io.to(room).emit(SOCKET_EVENTS.TASK_MOVED, task);
    logger.debug({ room, event: SOCKET_EVENTS.TASK_MOVED }, 'Emitted task:moved event');
  }

  public static emitTaskDeleted(boardId: string, taskId: string): void {
    const io = getSocketServer();
    if (!io) return;

    const room = this.getRoom(boardId);
    io.to(room).emit(SOCKET_EVENTS.TASK_DELETED, { id: taskId, boardId });
    logger.debug({ room, event: SOCKET_EVENTS.TASK_DELETED, taskId }, 'Emitted task:deleted event');
  }

  public static emitTaskAssigned(boardId: string, task: unknown): void {
    const io = getSocketServer();
    if (!io) return;

    const room = this.getRoom(boardId);
    io.to(room).emit(SOCKET_EVENTS.TASK_ASSIGNED, task);
    logger.debug({ room, event: SOCKET_EVENTS.TASK_ASSIGNED }, 'Emitted task:assigned event');
  }

  public static emitTaskCommented(boardId: string, comment: unknown): void {
    const io = getSocketServer();
    if (!io) return;

    const room = this.getRoom(boardId);
    io.to(room).emit(SOCKET_EVENTS.TASK_COMMENTED, comment);
    logger.debug({ room, event: SOCKET_EVENTS.TASK_COMMENTED }, 'Emitted task:commented event');
  }

  public static emitBoardUpdated(boardId: string, board: unknown): void {
    const io = getSocketServer();
    if (!io) return;

    const room = this.getRoom(boardId);
    io.to(room).emit(SOCKET_EVENTS.BOARD_UPDATED, board);
    logger.debug({ room, event: SOCKET_EVENTS.BOARD_UPDATED }, 'Emitted board:updated event');
  }
  public static emitBoardCreated(board: unknown): void {
    const io = getSocketServer();
    if (!io) return;

    io.emit(SOCKET_EVENTS.BOARD_CREATED, board);
    logger.debug({ event: SOCKET_EVENTS.BOARD_CREATED }, 'Emitted board:created event globally');
  }

  public static emitBoardDeleted(boardId: string): void {
    const io = getSocketServer();
    if (!io) return;

    io.emit(SOCKET_EVENTS.BOARD_DELETED, { boardId });
    logger.debug({ event: SOCKET_EVENTS.BOARD_DELETED, boardId }, 'Emitted board:deleted event globally');
  }
}
