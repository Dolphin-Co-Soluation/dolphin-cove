// ============================================================================
// USER TYPES (UPDATED)
// ============================================================================

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar?: string;
  coverPhoto?: string;
  bio?: string;
  skills: string[];
  
  // Freelancer Mode
  isFreelancer: boolean;
  freelancerProfile?: FreelancerProfile;
  
  // Social
  connections: string[];
  followers: string[];
  following: string[];
  
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FreelancerProfile {
  title?: string;
  hourlyRate?: number;
  availability: 'available' | 'busy' | 'unavailable';
  completedJobs: number;
  rating: number;
  totalReviews: number;
  
  // Bank Info - Only visible to hiring clients
  bankInfo?: BankInfo;
}

export interface BankInfo {
  bankName: string;
  accountNumber: string;  // Will be encrypted
  accountHolderName: string;
  ifscCode?: string;      // For Indian banks
  swiftCode?: string;     // For international
  routingNumber?: string; // For US banks
  isVerified: boolean;
}

// ============================================================================
// FREELANCE JOB TYPES (NEW)
// ============================================================================

export interface FreelanceJob {
  id: string;
  clientId: string;
  
  // Job Details
  title: string;
  description: string;
  skills: string[];
  experienceLevel: 'entry' | 'intermediate' | 'expert';
  
  // Budget & Timeline
  budget: {
    amount: number;
    currency: string;
    type: 'fixed' | 'hourly';
  };
  duration: {
    value: number;
    unit: 'hours' | 'days' | 'weeks' | 'months';
  };
  deadline?: string;
  
  // Attachments
  attachments: JobAttachment[];
  
  // Status
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  visibility: 'public' | 'private' | 'invite_only';
  
  // Applications
  applicants: JobApplication[];
  totalApplicants: number;
  
  // Hired Freelancer
  hiredFreelancer?: HiredFreelancer;
  
  createdAt: string;
  updatedAt: string;
}

export interface JobAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface JobApplication {
  id: string;
  freelancerId: string;
  proposal: string;
  attachments?: string[];
  proposedBudget?: number;
  proposedDuration?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  appliedAt: string;
}

export interface HiredFreelancer {
  freelancerId: string;
  agreedBudget: number;
  agreedDeadline: string;
  hiredAt: string;
  completedAt?: string;
  clientReview?: Review;
  freelancerReview?: Review;
}

export interface Review {
  rating: number;
  comment: string;
  createdAt: string;
}

// ============================================================================
// TASK TYPES (NEW)
// ============================================================================

export interface Task {
  id: string;
  jobId: string;
  clientId: string;
  freelancerId: string;
  
  title: string;
  description: string;
  status: 'in_progress' | 'completed' | 'disputed' | 'cancelled';
  
  budget: {
    amount: number;
    currency: string;
  };
  deadline: string;
  
  milestones?: Milestone[];
  
  // For client view
  isClientView?: boolean;
  // For freelancer view
  isFreelancerView?: boolean;
  
  messagesCount: number;
  lastActivity: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: string;
}

// ============================================================================
// POST TYPES
// ============================================================================

export interface Post {
  id: string;
  authorId: string;
  content: string;
  images?: string[];
  videos?: string[];
  attachments?: PostAttachment[];
  
  likes: string[];
  comments: Comment[];
  shares: number;
  
  visibility: 'public' | 'connections' | 'private';
  
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface Comment {
  id: string;
  authorId: string;
  content: string;
  likes: string[];
  replies: Reply[];
  createdAt: string;
  updatedAt: string;
}

export interface Reply {
  id: string;
  authorId: string;
  content: string;
  likes: string[];
  createdAt: string;
}

// ============================================================================
// MESSAGE TYPES
// ============================================================================

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments?: MessageAttachment[];
  readBy: string[];
  createdAt: string;
}

export interface MessageAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

// ============================================================================
// API REQUEST TYPES
// ============================================================================

export interface CreateFreelanceJobRequest {
  title: string;
  description: string;
  skills: string[];
  experienceLevel: 'entry' | 'intermediate' | 'expert';
  budget: {
    amount: number;
    currency: string;
    type: 'fixed' | 'hourly';
  };
  duration: {
    value: number;
    unit: 'hours' | 'days' | 'weeks' | 'months';
  };
  deadline?: string;
  attachments?: JobAttachment[];
}

export interface ApplyToJobRequest {
  proposal: string;
  attachments?: string[];
  proposedBudget?: number;
  proposedDuration?: string;
}

export interface UpdateFreelancerModeRequest {
  isFreelancer: boolean;
  freelancerProfile?: {
    title?: string;
    hourlyRate?: number;
    availability?: 'available' | 'busy' | 'unavailable';
    bankInfo?: Omit<BankInfo, 'isVerified'>;
  };
}

export interface HireFreelancerRequest {
  applicationId: string;
  agreedBudget: number;
  agreedDeadline: string;
}

export interface CreatePostRequest {
  content: string;
  images?: string[];
  videos?: string[];
  attachments?: PostAttachment[];
  visibility?: 'public' | 'connections' | 'private';
}

export interface CreateCommentRequest {
  content: string;
}

export interface SendMessageRequest {
  conversationId?: string;
  recipientId?: string;
  content: string;
  attachments?: MessageAttachment[];
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  requiresBankInfo?: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// For job listing - includes client info
export interface FreelanceJobWithClient extends FreelanceJob {
  client: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
    isVerified: boolean;
  } | null;
}

// For application - includes freelancer info
export interface ApplicationWithFreelancer extends JobApplication {
  freelancer: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
    isVerified: boolean;
    skills?: string[];
    freelancerProfile?: {
      title?: string;
      rating: number;
      completedJobs: number;
      availability?: 'available' | 'busy' | 'unavailable';
    };
  };
}

// Bank info visible to client after hiring
export interface FreelancerBankInfoResponse {
  bankName: string;
  accountNumber: string;       // Masked: ****4567
  accountHolderName: string;
  ifscCode?: string;
  swiftCode?: string;
  routingNumber?: string;
  fullAccountNumber?: string;  // Only after hire confirmation
}

// Post with author info
export interface PostWithAuthor extends Post {
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
    isVerified: boolean;
  } | null;
}

// Task with user info
export interface TaskWithUsers extends Task {
  client: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
    isVerified: boolean;
  } | null;
  freelancer: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
    isVerified: boolean;
    freelancerProfile?: {
      title?: string;
      rating: number;
      completedJobs: number;
    } | null;
  } | null;
  isUserClient?: boolean;
  isUserFreelancer?: boolean;
  freelancerBankInfo?: FreelancerBankInfoResponse | null;
}
