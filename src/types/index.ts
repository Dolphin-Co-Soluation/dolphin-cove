// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  skills: string[];
  joinedAt: Date;
  isFreelancer: boolean;
  hourlyRate?: number;
  portfolio?: string;
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
