'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Business, auth } from '../lib/api';

interface AuthContextType {
  user: User | null;
  business: Business | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<any>;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    companyName?: string;
    phone?: string;
  }) => Promise<any>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
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
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    try {
      const response = await auth.getProfile();
      if (response.success && response.data) {
        setUser(response.data.user);
        setBusiness(response.data.business || null);
      }
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if we're in the browser environment
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('auth_token');
          if (token) {
            await refreshProfile();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await auth.login(credentials);
      if (response.success && response.data) {
        setUser(response.data.user);
        setBusiness(response.data.business || null);
      }
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    companyName?: string;
    phone?: string;
  }) => {
    try {
      const response = await auth.register(userData);
      if (response.success && response.data) {
        setUser(response.data.user);
        setBusiness(response.data.business || null);
      }
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    auth.logout();
    setUser(null);
    setBusiness(null);
  };

  const value: AuthContextType = {
    user,
    business,
    loading,
    login,
    register,
    logout,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
