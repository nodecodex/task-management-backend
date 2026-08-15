import { Role } from '@prisma/client';
import { commentRepository, CommentWithUser } from '../repositories/comment.repository.js';
import { taskRepository } from '../repositories/task.repository.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { ERROR_CODES } from '../constants/index.js';
import { parsePagination, createPaginationMeta } from '../utils/pagination.js';
import { AuthenticatedUser, PaginationMeta } from '../types/common.types.js';
import { SocketService } from '../sockets/socket.service.js';

export class CommentService {
  public async getTaskComments(
    taskId: string,
    rawPage?: unknown,
    rawLimit?: unknown
  ): Promise<{ comments: CommentWithUser[]; meta: PaginationMeta }> {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError('Task not found', ERROR_CODES.TASK_NOT_FOUND);
    }

    const { page, limit, skip } = parsePagination(rawPage, rawLimit);
    const [comments, total] = await commentRepository.findByTaskId({
      taskId,
      skip,
      take: limit,
    });

    const meta = createPaginationMeta(total, page, limit);

    return { comments, meta };
  }

  public async addComment(
    taskId: string,
    commentText: string,
    user: AuthenticatedUser
  ): Promise<CommentWithUser> {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError('Task not found', ERROR_CODES.TASK_NOT_FOUND);
    }

    const newComment = await commentRepository.create({
      taskId,
      userId: user.id,
      comment: commentText,
    });

    // Emit Socket.IO event to the board room
    SocketService.emitTaskCommented(task.boardId, {
      taskId,
      comment: newComment,
    });

    return newComment;
  }

  public async updateComment(
    commentId: string,
    commentText: string,
    user: AuthenticatedUser
  ): Promise<CommentWithUser> {
    const existing = await commentRepository.findById(commentId);
    if (!existing) {
      throw new NotFoundError('Comment not found', ERROR_CODES.COMMENT_NOT_FOUND);
    }

    if (user.role !== Role.ADMIN && existing.userId !== user.id) {
      throw new ForbiddenError('You can only edit your own comments');
    }

    return commentRepository.update(commentId, commentText);
  }

  public async deleteComment(
    commentId: string,
    user: AuthenticatedUser
  ): Promise<void> {
    const existing = await commentRepository.findById(commentId);
    if (!existing) {
      throw new NotFoundError('Comment not found', ERROR_CODES.COMMENT_NOT_FOUND);
    }

    if (user.role !== Role.ADMIN && existing.userId !== user.id) {
      throw new ForbiddenError('You can only delete your own comments');
    }

    await commentRepository.delete(commentId);
  }
}

export const commentService = new CommentService();
