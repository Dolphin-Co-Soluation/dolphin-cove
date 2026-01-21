// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
  coverImage?: string;
  bio?: string;
  location?: string;
  website?: string;
  skills: string[];
  joinedAt: Date;
  isFreelancer: boolean;
  hourlyRate?: number;
  portfolio?: string;
  connections?: string[]; // User IDs
  followers?: string[]; // User IDs
  following?: string[]; // User IDs
  projects?: string[]; // Project IDs
  rating?: number;
  reviewCount?: number;
  savedPosts?: string[]; // Post IDs
  isOnline?: boolean;
  lastSeen?: Date;
}

// Project Types
export interface Project {
  id: string;
  title: string;
  description: string;
  image?: string;
  technologies: string[];
  link?: string;
  userId: string;
  createdAt: Date;
}

// Job Types
export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  description: string;
  location: string;
  locationType: 'remote' | 'hybrid' | 'onsite';
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  skills: string[];
  jobType: 'fulltime' | 'parttime' | 'contract' | 'freelance';
  postedBy: User;
  postedAt: Date;
  deadline?: Date;
  applicants?: string[]; // User IDs
  isActive: boolean;
}

// Message Types
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date;
  read: boolean;
  attachments?: string[];
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: Date;
}

// Post Types
export interface Post {
  id: string;
  author: User;
  content: string;
  image?: string;
  createdAt: Date;
  likes: string[]; // User IDs who liked
  comments: Comment[];
  isFreelancePost: boolean;
  freelanceDetails?: FreelanceDetails;
}

export interface FreelanceDetails {
  title: string;
  budget: string;
  deadline: string;
  skills: string[];
  projectType: 'fixed' | 'hourly';
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  createdAt: Date;
  likes: string[];
}

// Auth Types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'job';
  message: string;
  read: boolean;
  createdAt: Date;
  fromUser: User;
}
