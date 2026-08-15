import { Role, TaskStatus } from '@prisma/client';
import { taskRepository, TaskWithDetails } from '../repositories/task.repository.js';
import { boardRepository } from '../repositories/board.repository.js';
import { categoryRepository } from '../repositories/category.repository.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { ERROR_CODES } from '../constants/index.js';
import { parsePagination, createPaginationMeta } from '../utils/pagination.js';
import { buildTaskFilters } from '../utils/query-builder.js';
import { CreateTaskDTO, UpdateTaskDTO, TaskFilterOptions } from '../types/task.types.js';
import { AuthenticatedUser, PaginationMeta } from '../types/common.types.js';
import { SocketService } from '../sockets/socket.service.js';

export class TaskService {
  public async getTasks(
    filters: TaskFilterOptions
  ): Promise<{ tasks: TaskWithDetails[]; meta: PaginationMeta }> {
    const { page, limit, skip } = parsePagination(filters.page, filters.limit);
    const where = buildTaskFilters(filters);

    let orderBy: Record<string, 'asc' | 'desc'> = { createdAt: 'desc' };
    if (filters.sortBy) {
      orderBy = { [filters.sortBy]: filters.order || 'asc' };
    }

    const [tasks, total] = await taskRepository.findMany({
      skip,
      take: limit,
      where,
      orderBy,
    });

    const meta = createPaginationMeta(total, page, limit);

    return { tasks, meta };
  }

  public async getTaskById(id: string): Promise<TaskWithDetails> {
    const task = await taskRepository.findById(id);
    if (!task) {
      throw new NotFoundError('Task not found', ERROR_CODES.TASK_NOT_FOUND);
    }
    return task;
  }

  public async createTask(
    input: CreateTaskDTO,
    user: AuthenticatedUser
  ): Promise<TaskWithDetails> {
    // Validate board exists
    const board = await boardRepository.findById(input.board_id);
    if (!board) {
      throw new NotFoundError('Board not found', ERROR_CODES.BOARD_NOT_FOUND);
    }

    // Validate category exists if provided
    if (input.category_id) {
      const category = await categoryRepository.findById(input.category_id);
      if (!category) {
        throw new NotFoundError('Category not found', ERROR_CODES.CATEGORY_NOT_FOUND);
      }
    }

    const createdTask = await taskRepository.create(input, user.id);

    // Emit real-time creation event to board room
    SocketService.emitTaskCreated(createdTask.boardId, createdTask);

    return createdTask;
  }

  public async updateTask(
    id: string,
    input: UpdateTaskDTO,
    user: AuthenticatedUser
  ): Promise<TaskWithDetails> {
    const existing = await taskRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Task not found', ERROR_CODES.TASK_NOT_FOUND);
    }

    // Member authorization check
    if (user.role === Role.MEMBER) {
      const isCreator = existing.createdById === user.id;
      const hasNonStatusFields = Object.entries(input).some(
        ([key, val]) => key !== 'status' && val !== undefined
      );

      // All roles (including members) can update task status.
      // Members cannot modify other fields on tasks they did not create.
      if (hasNonStatusFields && !isCreator) {
        throw new ForbiddenError(
          'Members can only update task status or edit tasks they created',
          ERROR_CODES.FORBIDDEN
        );
      }
    }

    // Validate new board if changing
    if (input.board_id && input.board_id !== existing.boardId) {
      const board = await boardRepository.findById(input.board_id);
      if (!board) {
        throw new NotFoundError('Target board not found', ERROR_CODES.BOARD_NOT_FOUND);
      }
    }

    // Validate new category if changing
    if (input.category_id) {
      const category = await categoryRepository.findById(input.category_id);
      if (!category) {
        throw new NotFoundError('Category not found', ERROR_CODES.CATEGORY_NOT_FOUND);
      }
    }

    const isStatusChanged = input.status && input.status !== existing.status;
    const isAssigneesChanged = input.assignee_ids !== undefined;

    const updatedTask = await taskRepository.update(id, input);

    // Emit specialized Socket.IO events to board room
    if (isStatusChanged) {
      SocketService.emitTaskMoved(updatedTask.boardId, updatedTask);
    } else if (isAssigneesChanged) {
      SocketService.emitTaskAssigned(updatedTask.boardId, updatedTask);
    } else {
      SocketService.emitTaskUpdated(updatedTask.boardId, updatedTask);
    }

    return updatedTask;
  }

  public async updateTaskStatus(
    id: string,
    status: TaskStatus,
    user: AuthenticatedUser
  ): Promise<TaskWithDetails> {
    return this.updateTask(id, { status }, user);
  }

  public async deleteTask(id: string, user: AuthenticatedUser): Promise<TaskWithDetails> {
    const existing = await taskRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Task not found', ERROR_CODES.TASK_NOT_FOUND);
    }

    // Admins and Managers can delete any task; Members can only delete tasks they created
    if (user.role === Role.MEMBER && existing.createdById !== user.id) {
      throw new ForbiddenError(
        'Members can only delete tasks they created',
        ERROR_CODES.FORBIDDEN
      );
    }

    const deleted = await taskRepository.delete(id);

    // Emit real-time delete event
    SocketService.emitTaskDeleted(deleted.boardId, id);

    return deleted;
  }
}

export const taskService = new TaskService();
