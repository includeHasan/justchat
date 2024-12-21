import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/lib/types';
import api from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (userData: User) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface UserResponse {
  user: User;
  success: boolean;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get<UserResponse>('/user/profile', { 
          withCredentials: true,
          headers: {
            'Cache-Control': 'no-cache',
          }
        });
        
        if (response.data?.success && response.data?.user) {
          setUser(response.data.user);
        } else {
          setUser(null);
        }
      } catch (error: any) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout', {}, { withCredentials: true });
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const updateUser = async (userData: User) => {
    try {
      const response = await api.put<UserResponse>('/user/profile', userData, { 
        withCredentials: true 
      });
      
      if (response.data?.success && response.data?.user) {
        setUser(response.data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('User update failed:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
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