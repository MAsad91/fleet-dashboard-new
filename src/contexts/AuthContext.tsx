"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient } from '@/lib/api-client';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'operator' | 'viewer' | 'FLEET_USER';
  avatar?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  const isAuthenticated = !!user;

  const login = async (username: string, password: string) => {
    try {
      console.log('🔐 AuthContext: Starting login process');
      setLoading(true);
      
      // Real API authentication
      console.log('🔐 AuthContext: Calling apiClient.login');
      const { user: userData } = await apiClient.login(username, password);
      console.log('🔐 AuthContext: API response received:', userData);
      
      // Map API response to expected user format
      const mappedUser = {
        id: userData.id.toString(),
        email: userData.email || userData.username,
        name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.username,
        role: userData.profile?.role || 'FLEET_USER',
        avatar: userData.profile?.avatar || '/images/user/user-03.png',
        created_at: userData.created_at || new Date().toISOString(),
        updated_at: userData.updated_at || new Date().toISOString(),
      };
      
      console.log('🔐 AuthContext: Mapped user data:', mappedUser);
      
      // Store user data in localStorage for persistence
      localStorage.setItem('user_data', JSON.stringify(mappedUser));
      console.log('🔐 AuthContext: User data stored in localStorage');
      
      setUser(mappedUser);
      console.log('✅ AuthContext: Login successful, user set');
      return { success: true };
    } catch (error: any) {
      console.error('❌ AuthContext: Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please try again.';
      console.error('❌ AuthContext: Error message:', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all stored data
      localStorage.removeItem('access_token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      // Try to get fresh user data, but fallback to stored data if it fails
      const userData = await apiClient.getCurrentUser();
      setUser(userData);
    } catch (error: any) {
      console.error('Failed to refresh user:', error);
      // If it's a 401 error, clear tokens and redirect to login
      if (error.response?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        setUser(null);
      } else {
        // For other errors, try to use stored user data
        const storedUser = localStorage.getItem('user_data');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
          } catch (parseError) {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    }
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.role === role;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  // Hydration effect
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Check if user is authenticated on mount (only after hydration)
  useEffect(() => {
    if (!isHydrated) return;

    const checkAuth = async () => {
      try {
        // Check if we have a token in localStorage first
        const token = localStorage.getItem('access_token') || localStorage.getItem('authToken');
        if (token) {
          // Check if we have user data in localStorage
          const storedUser = localStorage.getItem('user_data');
          if (storedUser) {
            try {
              const userData = JSON.parse(storedUser);
              setUser(userData);
              console.log('✅ AuthContext: User loaded from localStorage:', userData);
            } catch (error) {
              console.error('Failed to parse stored user data:', error);
              localStorage.removeItem('access_token');
              localStorage.removeItem('authToken');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('user_data');
              setUser(null);
            }
          } else {
            // If no stored user data, clear tokens
            localStorage.removeItem('access_token');
            localStorage.removeItem('authToken');
            localStorage.removeItem('refresh_token');
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [isHydrated]);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
    hasRole,
    hasAnyRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
