import { TaskService } from '../../src/services/task.service.js';
import { taskRepository } from '../../src/repositories/task.repository.js';
import { boardRepository } from '../../src/repositories/board.repository.js';
import { NotFoundError, ForbiddenError } from '../../src/utils/errors.js';
import { Role, TaskStatus, TaskPriority } from '@prisma/client';
import { AuthenticatedUser } from '../../src/types/common.types.js';

jest.mock('../../src/repositories/task.repository.js');
jest.mock('../../src/repositories/board.repository.js');
jest.mock('../../src/repositories/category.repository.js');
jest.mock('../../src/sockets/socket.service.js');

describe('TaskService Unit Tests', () => {
  let taskService: TaskService;

  const mockAdminUser: AuthenticatedUser = {
    id: 'admin-uuid',
    email: 'admin@example.com',
    name: 'Admin',
    role: Role.ADMIN,
  };

  const mockMemberUser: AuthenticatedUser = {
    id: 'member-uuid',
    email: 'member@example.com',
    name: 'Member',
    role: Role.MEMBER,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    taskService = new TaskService();
  });

  describe('createTask', () => {
    it('should create a task successfully when board exists', async () => {
      (boardRepository.findById as jest.Mock).mockResolvedValue({
        id: 'board-uuid',
        title: 'Project Board',
      });

      const mockTask = {
        id: 'task-uuid',
        title: 'Implement Kanban',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        boardId: 'board-uuid',
        createdById: mockAdminUser.id,
        assignees: [],
        tags: [],
      };

      (taskRepository.create as jest.Mock).mockResolvedValue(mockTask);

      const result = await taskService.createTask(
        {
          title: 'Implement Kanban',
          board_id: 'board-uuid',
          status: TaskStatus.TODO,
          priority: TaskPriority.HIGH,
        },
        mockAdminUser
      );

      expect(result.id).toBe('task-uuid');
      expect(taskRepository.create).toHaveBeenCalled();
    });

    it('should throw NotFoundError if target board does not exist', async () => {
      (boardRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        taskService.createTask(
          {
            title: 'Task on nonexistent board',
            board_id: 'nonexistent-board-uuid',
          },
          mockAdminUser
        )
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateTask & status movement', () => {
    it('should allow member to update status of an unassigned task created by another user', async () => {
      (taskRepository.findById as jest.Mock).mockResolvedValue({
        id: 'task-uuid-1',
        title: 'Design Task',
        status: TaskStatus.TODO,
        boardId: 'board-uuid',
        createdById: 'another-user',
        assignees: [{ userId: 'someone-else' }],
      });

      (taskRepository.update as jest.Mock).mockResolvedValue({
        id: 'task-uuid-1',
        title: 'Design Task',
        status: TaskStatus.IN_PROGRESS,
        boardId: 'board-uuid',
        createdById: 'another-user',
        assignees: [{ userId: 'someone-else' }],
      });

      const result = await taskService.updateTask(
        'task-uuid-1',
        { status: TaskStatus.IN_PROGRESS },
        mockMemberUser
      );

      expect(result.status).toBe(TaskStatus.IN_PROGRESS);
      expect(taskRepository.update).toHaveBeenCalledWith('task-uuid-1', {
        status: TaskStatus.IN_PROGRESS,
      });
    });

    it('should allow member to update non-status fields on a task they created', async () => {
      (taskRepository.findById as jest.Mock).mockResolvedValue({
        id: 'task-uuid-1',
        title: 'Original Title',
        description: 'Original Desc',
        status: TaskStatus.TODO,
        boardId: 'board-uuid',
        createdById: mockMemberUser.id,
        assignees: [],
      });

      (taskRepository.update as jest.Mock).mockResolvedValue({
        id: 'task-uuid-1',
        title: 'Updated Title',
        description: 'Updated Desc',
        status: TaskStatus.TODO,
        boardId: 'board-uuid',
        createdById: mockMemberUser.id,
        assignees: [],
      });

      const result = await taskService.updateTask(
        'task-uuid-1',
        { title: 'Updated Title', description: 'Updated Desc' },
        mockMemberUser
      );

      expect(result.title).toBe('Updated Title');
      expect(taskRepository.update).toHaveBeenCalled();
    });

    it('should throw ForbiddenError when member tries to update non-status fields on a task created by another user', async () => {
      (taskRepository.findById as jest.Mock).mockResolvedValue({
        id: 'task-uuid-1',
        title: 'Protected Task',
        status: TaskStatus.TODO,
        boardId: 'board-uuid',
        createdById: 'another-user',
        assignees: [{ userId: mockMemberUser.id }],
      });

      await expect(
        taskService.updateTask(
          'task-uuid-1',
          { title: 'Hacked Title' },
          mockMemberUser
        )
      ).rejects.toThrow(ForbiddenError);
    });

    it('should allow admin to update non-status fields on any task', async () => {
      (taskRepository.findById as jest.Mock).mockResolvedValue({
        id: 'task-uuid-1',
        title: 'Original Task',
        status: TaskStatus.TODO,
        boardId: 'board-uuid',
        createdById: 'another-user',
        assignees: [],
      });

      (taskRepository.update as jest.Mock).mockResolvedValue({
        id: 'task-uuid-1',
        title: 'Admin Updated Title',
        status: TaskStatus.TODO,
        boardId: 'board-uuid',
        createdById: 'another-user',
        assignees: [],
      });

      const result = await taskService.updateTask(
        'task-uuid-1',
        { title: 'Admin Updated Title' },
        mockAdminUser
      );

      expect(result.title).toBe('Admin Updated Title');
    });
  });

  describe('deleteTask', () => {
    it('should allow member to delete a task they created', async () => {
      (taskRepository.findById as jest.Mock).mockResolvedValue({
        id: 'task-uuid-1',
        title: 'My Task',
        boardId: 'board-uuid',
        createdById: mockMemberUser.id,
      });

      (taskRepository.delete as jest.Mock).mockResolvedValue({
        id: 'task-uuid-1',
        title: 'My Task',
        boardId: 'board-uuid',
        createdById: mockMemberUser.id,
      });

      const result = await taskService.deleteTask('task-uuid-1', mockMemberUser);

      expect(result.id).toBe('task-uuid-1');
      expect(taskRepository.delete).toHaveBeenCalledWith('task-uuid-1');
    });

    it('should throw ForbiddenError when member tries to delete a task created by another user', async () => {
      (taskRepository.findById as jest.Mock).mockResolvedValue({
        id: 'task-uuid-1',
        title: 'Others Task',
        boardId: 'board-uuid',
        createdById: 'another-user-uuid',
      });

      await expect(
        taskService.deleteTask('task-uuid-1', mockMemberUser)
      ).rejects.toThrow(ForbiddenError);
    });

    it('should allow admin to delete a task created by another user', async () => {
      (taskRepository.findById as jest.Mock).mockResolvedValue({
        id: 'task-uuid-1',
        title: 'Others Task',
        boardId: 'board-uuid',
        createdById: 'another-user-uuid',
      });

      (taskRepository.delete as jest.Mock).mockResolvedValue({
        id: 'task-uuid-1',
        title: 'Others Task',
        boardId: 'board-uuid',
        createdById: 'another-user-uuid',
      });

      const result = await taskService.deleteTask('task-uuid-1', mockAdminUser);

      expect(result.id).toBe('task-uuid-1');
      expect(taskRepository.delete).toHaveBeenCalledWith('task-uuid-1');
    });
  });
});
