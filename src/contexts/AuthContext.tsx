
'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';

type AuthResponse = Awaited<
  ReturnType<typeof apiClient.login>
>;

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (
    email: string,
    password: string,
    name?: string
  ) => Promise<AuthResponse>;
  register: (
    name: string,
    email: string,
    password: string,
    role?: string
  ) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<
  AuthContextType | undefined
>(undefined);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // Prevent profile restoration after logout
  const loggedOutRef = useRef(false);

  // Prevent stale profile responses from changing auth state
  const requestIdRef = useRef(0);

  // Restore logged-in user from access token cookie
  const fetchUserProfile = async () => {
    if (loggedOutRef.current) {
      setUser(null);
      setLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;

    try {
      const response = await apiClient.getProfile();

      // Ignore response if logout or another request occurred
      if (
        loggedOutRef.current ||
        requestId !== requestIdRef.current
      ) {
        return;
      }

      if (response.success && response.data) {
        setUser(response.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      if (
        !loggedOutRef.current &&
        requestId === requestIdRef.current
      ) {
        setUser(null);
        console.error(
          'Failed to restore user profile:',
          error
        );
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  // Restore user on initial mount
  useEffect(() => {
    void fetchUserProfile();
  }, []);

  // Login
  const login = async (
    email: string,
    password: string,
    name?: string
  ) => {
    setLoading(true);

    try {
      const response = await apiClient.login({
        email,
        password,
        name,
      });

      if (response.success && response.data) {
        // Allow authentication again after login
        loggedOutRef.current = false;

        // Reset API client's logout/refresh guard
        apiClient.resetAuthState();

        // Invalidate any previous profile requests
        requestIdRef.current++;

        setUser(response.data);

        return response;
      }

      throw new Error(
        response.error || 'Login failed'
      );
    } finally {
      setLoading(false);
    }
  };

  // Register
  const register = async (
    name: string,
    email: string,
    password: string,
    role?: string
  ) => {
    setLoading(true);

    try {
      const response = await apiClient.register({
        name,
        email,
        password,
        role,
      });

      if (response.success && response.data) {
        loggedOutRef.current = false;

        apiClient.resetAuthState();

        requestIdRef.current++;

        setUser(response.data);

        return response;
      }

      throw new Error(
        response.error || 'Registration failed'
      );
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    // Immediately stop profile restoration
    loggedOutRef.current = true;

    // Invalidate any pending profile response
    requestIdRef.current++;

    // Clear API client's refresh state
    apiClient.markLoggedOut();

    // Clear user from UI immediately
    setUser(null);
    setLoading(false);

    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      router.replace('/login');
    }
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
    throw new Error(
      'useAuth must be used within AuthProvider'
    );
  }

  return context;
}