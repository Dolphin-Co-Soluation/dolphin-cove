import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  displayName: string;
  isFreelancer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: false,
  });

  // TODO: Replace with actual API call to backend
  const login = async (_email: string, _password: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    // Placeholder for backend API integration
    // const response = await fetch('/api/auth/login', { ... });
    
    setAuthState(prev => ({ ...prev, loading: false }));
    return false; // Will return true when backend is connected
  };

  // TODO: Replace with actual API call to backend
  const register = async (userData: RegisterData): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    // Placeholder for backend API integration
    // const response = await fetch('/api/auth/register', { ... });
    
    // Temporary: Create user locally (remove when backend is ready)
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
    // TODO: Call backend logout endpoint
    // await fetch('/api/auth/logout', { ... });
    
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
    });
  };

  const updateUser = (userData: Partial<User>) => {
    setAuthState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...userData } : null,
    }));
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, register, logout, updateUser }}>
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
