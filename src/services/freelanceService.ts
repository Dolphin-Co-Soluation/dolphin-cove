import { fetchAPI } from './api';

// Types
export interface FreelanceJob {
  id: string;
  title: string;
  description: string;
  category: string;
  skills: string[];
  budget: number;
  duration: string;
  attachments: string[];
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  freelancerId?: string;
  freelancerName?: string;
  applicants: JobApplication[];
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  userId: string;
  userName: string;
  userAvatar?: string;
  coverLetter: string;
  proposedBudget?: number;
  proposedDuration?: string;
  appliedAt: string;
}

export interface CreateJobData {
  title: string;
  description: string;
  category: string;
  skills: string[];
  budget: number;
  duration: string;
  attachments?: string[];
}

export interface ApplyJobData {
  userId: string;
  userName: string;
  userAvatar?: string;
  coverLetter: string;
  proposedBudget?: number;
  proposedDuration?: string;
}

// Freelance Jobs API
export const freelanceService = {
  // Get all open jobs
  async getJobs(params?: {
    category?: string;
    minBudget?: number;
    maxBudget?: number;
    skills?: string[];
    search?: string;
    page?: number;
    pageSize?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.minBudget) searchParams.set('minBudget', params.minBudget.toString());
    if (params?.maxBudget) searchParams.set('maxBudget', params.maxBudget.toString());
    if (params?.skills?.length) searchParams.set('skills', params.skills.join(','));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString());

    const query = searchParams.toString();
    return fetchAPI<{ success: boolean; data: FreelanceJob[]; pagination: any }>(
      `/freelance/jobs${query ? `?${query}` : ''}`
    );
  },

  // Get job by ID
  async getJobById(jobId: string) {
    return fetchAPI<{ success: boolean; data: FreelanceJob }>(`/freelance/jobs/${jobId}`);
  },

  // Create a new job
  async createJob(data: CreateJobData, clientId: string) {
    return fetchAPI<{ success: boolean; data: FreelanceJob }>('/freelance/jobs', {
      method: 'POST',
      body: JSON.stringify({ ...data, clientId }),
    });
  },

  // Update a job
  async updateJob(jobId: string, data: Partial<CreateJobData>) {
    return fetchAPI<{ success: boolean; data: FreelanceJob }>(`/freelance/jobs/${jobId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete a job
  async deleteJob(jobId: string) {
    return fetchAPI<{ success: boolean }>(`/freelance/jobs/${jobId}`, {
      method: 'DELETE',
    });
  },

  // Apply to a job
  async applyToJob(jobId: string, data: ApplyJobData) {
    return fetchAPI<{ success: boolean }>(`/freelance/jobs/${jobId}/apply`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Hire a freelancer
  async hireFreelancer(jobId: string, applicantId: string, clientId: string) {
    return fetchAPI<{ success: boolean }>(`/freelance/jobs/${jobId}/hire/${applicantId}`, {
      method: 'POST',
      body: JSON.stringify({ clientId }),
    });
  },

  // Complete a job
  async completeJob(jobId: string, userId: string, rating?: number, review?: string) {
    return fetchAPI<{ success: boolean }>(`/freelance/jobs/${jobId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ userId, rating, review }),
    });
  },

  // Get my job postings (as client)
  async getMyJobPosts(userId: string, status?: string) {
    const params = new URLSearchParams({ userId });
    if (status) params.set('status', status);
    return fetchAPI<{ success: boolean; data: FreelanceJob[] }>(`/freelance/my-jobs?${params}`);
  },

  // Get my applications (as freelancer)
  async getMyApplications(userId: string) {
    return fetchAPI<{ success: boolean; data: FreelanceJob[] }>(`/freelance/my-applications?userId=${userId}`);
  },

  // Get jobs I'm hired for
  async getMyHiredJobs(userId: string) {
    return fetchAPI<{ success: boolean; data: FreelanceJob[] }>(`/freelance/my-hired-jobs?userId=${userId}`);
  },
};

export default freelanceService;
