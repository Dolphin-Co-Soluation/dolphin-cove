import { fetchAPI } from './api';

// Types
export interface FreelancerProfile {
  title: string;
  hourlyRate?: number;
  availability: 'available' | 'busy' | 'not_available';
  completedJobs: number;
  rating: number;
  totalReviews: number;
}

export interface BankInfo {
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
}

// Freelancer API
export const freelancerService = {
  // Get freelancer mode status
  async getFreelancerMode(userId: string) {
    return fetchAPI<{
      success: boolean;
      data: {
        isFreelancer: boolean;
        profile?: FreelancerProfile;
        hasBankInfo: boolean;
      };
    }>(`/freelancer/mode?userId=${userId}`);
  },

  // Toggle freelancer mode
  async updateFreelancerMode(userId: string, isFreelancer: boolean, profile?: Partial<FreelancerProfile>) {
    return fetchAPI<{ success: boolean; data: any }>('/freelancer/mode', {
      method: 'PUT',
      body: JSON.stringify({ userId, isFreelancer, profile }),
    });
  },

  // Get freelancer profile
  async getFreelancerProfile(userId: string) {
    return fetchAPI<{ success: boolean; data: any }>(`/freelancer/profile/${userId}`);
  },

  // Update freelancer profile
  async updateFreelancerProfile(userId: string, profile: Partial<FreelancerProfile>) {
    return fetchAPI<{ success: boolean; data: any }>('/freelancer/profile', {
      method: 'PUT',
      body: JSON.stringify({ userId, ...profile }),
    });
  },

  // Update bank info
  async updateBankInfo(userId: string, bankInfo: BankInfo) {
    return fetchAPI<{ success: boolean }>('/freelancer/bank-info', {
      method: 'PUT',
      body: JSON.stringify({ userId, bankInfo }),
    });
  },

  // Search freelancers
  async searchFreelancers(params?: {
    skills?: string[];
    minRating?: number;
    availability?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.skills?.length) searchParams.set('skills', params.skills.join(','));
    if (params?.minRating) searchParams.set('minRating', params.minRating.toString());
    if (params?.availability) searchParams.set('availability', params.availability);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString());

    const query = searchParams.toString();
    return fetchAPI<{ success: boolean; data: any[]; pagination: any }>(
      `/freelancer/search${query ? `?${query}` : ''}`
    );
  },
};

export default freelancerService;
