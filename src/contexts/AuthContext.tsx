'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, name?: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      apiClient.setToken(storedToken);
      // Fetch user profile to restore user data
      fetchUserProfile();
    }
    setLoading(false);
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await apiClient.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const login = async (email: string, password: string, name?: string) => {
    setLoading(true);
    try {
      const response = await apiClient.login({ email, password, name });
      if (response.success && response.data) {
        const newToken = response.data.token;
        setToken(newToken);
        apiClient.setToken(newToken);
        setUser(response.data.user);
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role?: string) => {
    setLoading(true);
    try {
      const response = await apiClient.register({ name, email, password, role });
      if (response.success && response.data) {
        const newToken = response.data.token;
        setToken(newToken);
        apiClient.setToken(newToken);
        setUser(response.data.user);
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    apiClient.clearToken();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        loading,
        isAuthenticated: !!token,
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
