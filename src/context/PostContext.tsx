import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Post, Comment, User } from '../types';

interface PostContextType {
  posts: Post[];
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments'>) => void;
  likePost: (postId: string, userId: string) => void;
  addComment: (postId: string, comment: Omit<Comment, 'id' | 'createdAt' | 'likes'>) => void;
  likeComment: (postId: string, commentId: string, userId: string) => void;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

// Mock users for demo posts
const mockUsers: User[] = [
  {
    id: '2',
    username: 'coralcoder',
    email: 'coral@dolphincove.dev',
    displayName: 'Coral Coder',
    bio: '🪸 Backend wizard specializing in scalable systems',
    skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Docker'],
    joinedAt: new Date('2024-02-20'),
    isFreelancer: true,
    hourlyRate: 85,
  },
  {
    id: '3',
    username: 'wavemakerweb',
    email: 'wave@dolphincove.dev',
    displayName: 'Wave Maker',
    bio: '🌊 UI/UX Designer turning ideas into beautiful interfaces',
    skills: ['Figma', 'React', 'CSS', 'Tailwind'],
    joinedAt: new Date('2024-03-10'),
    isFreelancer: true,
    hourlyRate: 65,
  },
  {
    id: '4',
    username: 'deepseastartup',
    email: 'deep@dolphincove.dev',
    displayName: 'DeepSea Startup',
    bio: '🚀 Building the future of remote work',
    skills: [],
    joinedAt: new Date('2024-01-05'),
    isFreelancer: false,
  },
];

// Mock posts
const initialPosts: Post[] = [
  {
    id: '1',
    author: mockUsers[2],
    content: '🚀 Looking for talented React developers to join our exciting project! We\'re building a revolutionary platform for underwater drone photography. Remote-friendly, competitive pay, and you get to work with cutting-edge tech!',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    likes: ['2', '3'],
    comments: [
      {
        id: 'c1',
        author: mockUsers[0],
        content: 'This sounds amazing! I\'d love to learn more about the tech stack.',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        likes: ['4'],
      }
    ],
    isFreelancePost: true,
    freelanceDetails: {
      title: 'Senior React Developer',
      budget: '$5,000 - $8,000',
      deadline: '3 months',
      skills: ['React', 'TypeScript', 'Node.js', 'WebGL'],
      projectType: 'fixed',
    }
  },
  {
    id: '2',
    author: mockUsers[0],
    content: '💡 Just shipped a new feature using the new React Server Components! The performance improvements are incredible - 40% faster initial load time. Here\'s what I learned diving deep into the ocean of RSC...\n\n1. Start with the data flow\n2. Think about the component boundaries\n3. Don\'t fight the water, flow with it 🌊',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    likes: ['1', '3', '4'],
    comments: [],
    isFreelancePost: false,
  },
  {
    id: '3',
    author: mockUsers[1],
    content: '🎨 New portfolio piece alert! Created this ocean-inspired dashboard design. The gradient transitions mimic the way light plays through water. What do you all think?',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    likes: ['1', '2'],
    comments: [
      {
        id: 'c2',
        author: mockUsers[2],
        content: 'This is stunning! Would love to collaborate on our next project.',
        createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000),
        likes: ['1', '3'],
      }
    ],
    isFreelancePost: false,
  },
  {
    id: '4',
    author: mockUsers[2],
    content: '📢 Urgent: Need a Python developer for a data pipeline project. Must have experience with pandas, Apache Kafka, and AWS. Short-term contract, high pay!',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    likes: ['1'],
    comments: [],
    isFreelancePost: true,
    freelanceDetails: {
      title: 'Python Data Engineer',
      budget: '$100/hour',
      deadline: '2 weeks',
      skills: ['Python', 'Pandas', 'Kafka', 'AWS'],
      projectType: 'hourly',
    }
  },
];

export function PostProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  const addPost = (postData: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments'>) => {
    const newPost: Post = {
      ...postData,
      id: Date.now().toString(),
      createdAt: new Date(),
      likes: [],
      comments: [],
    };
    setPosts(prev => [newPost, ...prev]);
  };

  const likePost = (postId: string, userId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const hasLiked = post.likes.includes(userId);
        return {
          ...post,
          likes: hasLiked 
            ? post.likes.filter(id => id !== userId)
            : [...post.likes, userId]
        };
      }
      return post;
    }));
  };

  const addComment = (postId: string, commentData: Omit<Comment, 'id' | 'createdAt' | 'likes'>) => {
    const newComment: Comment = {
      ...commentData,
      id: Date.now().toString(),
      createdAt: new Date(),
      likes: [],
    };
    
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, newComment]
        };
      }
      return post;
    }));
  };

  const likeComment = (postId: string, commentId: string, userId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: post.comments.map(comment => {
            if (comment.id === commentId) {
              const hasLiked = comment.likes.includes(userId);
              return {
                ...comment,
                likes: hasLiked
                  ? comment.likes.filter(id => id !== userId)
                  : [...comment.likes, userId]
              };
            }
            return comment;
          })
        };
      }
      return post;
    }));
  };

  return (
    <PostContext.Provider value={{ posts, addPost, likePost, addComment, likeComment }}>
      {children}
    </PostContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostProvider');
  }
  return context;
}
