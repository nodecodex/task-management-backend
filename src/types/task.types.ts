import { TaskStatus, TaskPriority } from '@prisma/client';

export interface TaskFilterOptions {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee?: string;
  board_id?: string;
  category_id?: string;
  due_date?: string;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CreateTaskDTO {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  board_id: string;
  category_id?: string;
  due_date?: string | Date;
  assignee_ids?: string[];
  tag_ids?: string[];
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  board_id?: string;
  category_id?: string | null;
  due_date?: string | Date | null;
  assignee_ids?: string[];
  tag_ids?: string[];
}

export interface DashboardStats {
  total_tasks: number;
  todo: number;
  in_progress: number;
  review: number;
  completed: number;
  blocked: number;
  high_priority: number;
  urgent: number;
  overdue: number;
  total_users: number;
}

export interface DashboardFilterOptions {
  board_id?: string;
  assignee?: string;
  date_from?: string;
  date_to?: string;
}
