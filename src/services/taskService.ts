import { fetchAPI } from './api';

// Types
export interface Task {
  id: string;
  jobId: string;
  jobTitle: string;
  clientId: string;
  clientName: string;
  freelancerId: string;
  freelancerName: string;
  description: string;
  budget: number;
  status: 'pending' | 'in_progress' | 'under_review' | 'completed' | 'cancelled';
  startDate: string;
  dueDate: string;
  completedAt?: string;
  milestones: Milestone[];
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: string;
}

// Tasks API
export const taskService = {
  // Get all tasks for a user
  async getTasks(userId: string, params?: {
    role?: 'client' | 'freelancer';
    status?: string;
    page?: number;
    pageSize?: number;
  }) {
    const searchParams = new URLSearchParams({ userId });
    if (params?.role) searchParams.set('role', params.role);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString());

    return fetchAPI<{ success: boolean; data: Task[]; pagination: any }>(`/tasks?${searchParams}`);
  },

  // Get task by ID
  async getTaskById(taskId: string) {
    return fetchAPI<{ success: boolean; data: Task }>(`/tasks/${taskId}`);
  },

  // Update task status
  async updateTask(taskId: string, data: { status?: Task['status']; description?: string }) {
    return fetchAPI<{ success: boolean; data: Task }>(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Add milestone
  async addMilestone(taskId: string, milestone: Omit<Milestone, 'id' | 'status' | 'completedAt'>) {
    return fetchAPI<{ success: boolean; data: Task }>(`/tasks/${taskId}/milestones`, {
      method: 'POST',
      body: JSON.stringify(milestone),
    });
  },

  // Update milestone
  async updateMilestone(taskId: string, milestoneId: string, data: Partial<Milestone>) {
    return fetchAPI<{ success: boolean; data: Task }>(`/tasks/${taskId}/milestones/${milestoneId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Get task stats
  async getTaskStats(userId: string) {
    return fetchAPI<{
      success: boolean;
      data: {
        asClient: { total: number; pending: number; inProgress: number; completed: number };
        asFreelancer: { total: number; pending: number; inProgress: number; completed: number };
      };
    }>(`/tasks/stats?userId=${userId}`);
  },
};

export default taskService;
