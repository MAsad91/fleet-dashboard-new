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
  login: (username: string, password: string, companyName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  clearAuthData: () => void;
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

  const login = async (username: string, password: string, companyName?: string) => {
    try {
      console.log('🔐 AuthContext: Starting login process');
      setLoading(true);
      
      // Use company-based login if company name is provided
      let userData;
      if (companyName && companyName.trim()) {
        console.log('🔐 AuthContext: Using company-based login for:', companyName);
        const result = await apiClient.loginWithCompany(companyName, username, password);
        userData = result.user;
        // Store company name for future use
        localStorage.setItem('company_name', companyName);
      } else {
        console.log('🔐 AuthContext: Using standard login');
        const result = await apiClient.login(username, password);
        userData = result.user;
      }
      
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
      
      // Set user immediately to prevent double login page
      setUser(mappedUser);
      console.log('✅ AuthContext: Login successful, user set');
      
      // Set loading to false after successful login
      setLoading(false);
      console.log('✅ AuthContext: Loading set to false, isAuthenticated:', !!mappedUser);
      
      return { success: true };
    } catch (error: any) {
      console.error('❌ AuthContext: Login error:', error);
      const errorMessage = error.message || 'Login failed. Please try again.';
      console.error('❌ AuthContext: Error message:', errorMessage);
      setLoading(false); // Only set loading false on error
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      console.log('🔓 AuthContext: Starting logout process');
      setLoading(true);
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all stored data
      clearAuthData();
      setUser(null);
      setLoading(false);
      console.log('🔓 AuthContext: Logout completed, user cleared');
    }
  };

  const clearAuthData = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('company_name');
    console.log('🧹 AuthContext: All auth data cleared');
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
    
    // Add clearAuthData to window for testing purposes
    if (typeof window !== 'undefined') {
      (window as any).clearAuthData = clearAuthData;
    }
  }, []);

  // Check if user is authenticated on mount (only after hydration)
  useEffect(() => {
    if (!isHydrated) {
      console.log('🔍 AuthContext: Not hydrated yet, waiting...');
      return;
    }

    console.log('🔍 AuthContext: Starting authentication check...');

    const checkAuth = async () => {
      try {
        // First, try to get stored user data from localStorage
        const storedUser = localStorage.getItem('user_data');
        const token = localStorage.getItem('access_token') || localStorage.getItem('authToken');
        
        console.log('🔍 AuthContext: Stored data check:', { 
          hasStoredUser: !!storedUser, 
          hasToken: !!token 
        });
        
        // If we have stored user data, set it immediately to prevent loading state issues
        if (storedUser && token) {
          try {
            const userData = JSON.parse(storedUser);
            console.log('🔍 AuthContext: Setting stored user data immediately:', userData);
            setUser(userData);
            
            // Then validate the token in the background
            try {
              console.log('🔍 AuthContext: Validating stored token in background...');
              const freshUserData = await apiClient.getCurrentUser();
              
              // Map fresh API response to expected user format
              const mappedUser = {
                id: freshUserData.id.toString(),
                email: freshUserData.email || freshUserData.username,
                name: `${freshUserData.first_name || ''} ${freshUserData.last_name || ''}`.trim() || freshUserData.username,
                role: freshUserData.profile?.role || 'FLEET_USER',
                avatar: freshUserData.profile?.avatar || '/images/user/user-03.png',
                created_at: freshUserData.created_at || new Date().toISOString(),
                updated_at: freshUserData.updated_at || new Date().toISOString(),
              };
              
              // Update with fresh data
              localStorage.setItem('user_data', JSON.stringify(mappedUser));
              setUser(mappedUser);
              console.log('✅ AuthContext: Token is valid, user data refreshed:', mappedUser);
            } catch (error: any) {
              console.log('❌ AuthContext: Token validation failed:', error.message);
              // Token is invalid, clear all stored data
              clearAuthData();
              setUser(null);
            }
          } catch (parseError) {
            console.error('❌ AuthContext: Failed to parse stored user data:', parseError);
            clearAuthData();
            setUser(null);
          }
        } else {
          console.log('🔍 AuthContext: No stored user data or token found, user not authenticated');
          setUser(null);
        }
      } catch (error) {
        console.error('❌ AuthContext: Auth check error:', error);
        setUser(null);
      } finally {
        console.log('🔍 AuthContext: Setting loading to false');
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
    clearAuthData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
