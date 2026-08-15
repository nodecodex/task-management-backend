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
    it('should allow member to move status of an assigned task', async () => {
      (taskRepository.findById as jest.Mock).mockResolvedValue({
        id: 'task-uuid-1',
        title: 'Design Task',
        status: TaskStatus.TODO,
        boardId: 'board-uuid',
        createdById: 'another-user',
        assignees: [{ userId: mockMemberUser.id }],
      });

      (taskRepository.update as jest.Mock).mockResolvedValue({
        id: 'task-uuid-1',
        title: 'Design Task',
        status: TaskStatus.IN_PROGRESS,
        boardId: 'board-uuid',
        createdById: 'another-user',
        assignees: [{ userId: mockMemberUser.id }],
      });

      const result = await taskService.updateTask(
        'task-uuid-1',
        { status: TaskStatus.IN_PROGRESS },
        mockMemberUser
      );

      expect(result.status).toBe(TaskStatus.IN_PROGRESS);
    });

    it('should throw ForbiddenError when member tries to update an unassigned task not created by them', async () => {
      (taskRepository.findById as jest.Mock).mockResolvedValue({
        id: 'task-uuid-1',
        title: 'Protected Task',
        status: TaskStatus.TODO,
        boardId: 'board-uuid',
        createdById: 'another-user',
        assignees: [{ userId: 'someone-else' }],
      });

      await expect(
        taskService.updateTask(
          'task-uuid-1',
          { status: TaskStatus.IN_PROGRESS },
          mockMemberUser
        )
      ).rejects.toThrow(ForbiddenError);
    });
  });
});
