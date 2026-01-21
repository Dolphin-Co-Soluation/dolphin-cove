import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  displayName: string;
  isFreelancer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for demo
const mockUser: User = {
  id: '1',
  username: 'oceandev',
  email: 'ocean@dolphincove.dev',
  displayName: 'Ocean Developer',
  avatar: undefined,
  bio: '🌊 Full-stack developer riding the waves of code. React, Node.js, and TypeScript enthusiast.',
  skills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS'],
  joinedAt: new Date('2024-01-15'),
  isFreelancer: true,
  hourlyRate: 75,
  portfolio: 'https://oceandev.io'
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: false,
  });

  const login = async (email: string, _password: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email) {
      setAuthState({
        isAuthenticated: true,
        user: mockUser,
        loading: false,
      });
      return true;
    }
    
    setAuthState(prev => ({ ...prev, loading: false }));
    return false;
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: Date.now().toString(),
      username: userData.username,
      email: userData.email,
      displayName: userData.displayName,
      skills: [],
      joinedAt: new Date(),
      isFreelancer: userData.isFreelancer,
    };
    
    setAuthState({
      isAuthenticated: true,
      user: newUser,
      loading: false,
    });
    
    return true;
  };

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
