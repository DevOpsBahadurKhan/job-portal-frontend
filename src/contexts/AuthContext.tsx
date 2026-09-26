'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

type AuthResponse = Awaited<ReturnType<typeof apiClient.login>>;

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, name?: string) => Promise<AuthResponse>;
  register: (name: string, email: string, password: string, role?: string) => Promise<AuthResponse>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    try {
      const response = await apiClient.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
      console.error('Failed to restore user profile from accessToken cookie:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUserProfile();
  }, []);

  const login = async (email: string, password: string, name?: string) => {
    setLoading(true);
    try {
      const response = await apiClient.login({ email, password, name });
      if (response.success && response.data) {
        setUser(response.data);
        return response;
      }
      throw new Error(response.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role?: string) => {
    setLoading(true);
    try {
      const response = await apiClient.register({ name, email, password, role });
      if (response.success && response.data) {
        setUser(response.data);
        return response;
      }
      throw new Error(response.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    void apiClient.logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        isAuthenticated: Boolean(user),
        refreshUser: fetchUserProfile,
      }}
    >
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
