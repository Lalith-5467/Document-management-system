'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';
import { logActivity } from '@/lib/activityLogger';

interface User {
  id: number;
  full_name: string;
  email: string;
  user_type: 'individual' | 'student' | 'professional' | 'admin';
  // Profile fields
  job_title?: string;
  designation?: string;
  department?: string;
  occupation?: string;
  organization?: string;
  company_name?: string;
  college_name?: string;
  phone?: string;
  mobile_number?: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (userData: any) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  setUser: (user: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const handleSetUser = (u: any) => {
    setUser(u);
    if (typeof window !== 'undefined') {
      if (u) {
        localStorage.setItem('dms_user', JSON.stringify(u));
        window.dispatchEvent(new CustomEvent('dms_user_updated', { detail: u }));
      } else {
        localStorage.removeItem('dms_user');
      }
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('dms_token');
    const storedUser = localStorage.getItem('dms_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch (e) {
        localStorage.removeItem('dms_user');
        setUser(null);
      }
    } else if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    }
    setLoading(false);

    const handleUserUpdate = (e: any) => {
      if (e.detail) {
        setUser(e.detail);
      } else {
        const stored = localStorage.getItem('dms_user');
        if (stored) {
          try { setUser(JSON.parse(stored)); } catch (err) {}
        }
      }
    };
    window.addEventListener('dms_user_updated', handleUserUpdate);
    return () => window.removeEventListener('dms_user_updated', handleUserUpdate);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data && res.data.token) {
        const authToken = res.data.token;
        const authUser = res.data.user;

        setToken(authToken);
        setUser(authUser);

        localStorage.setItem('dms_token', authToken);
        localStorage.setItem('dms_user', JSON.stringify(authUser));

        try {
          await logActivity('LOGIN', null, 'User signed in successfully');
        } catch (e) {}

        return { success: true, message: 'Login successful!' };
      }

      return { success: false, message: 'Invalid response from server' };
    } catch (err: any) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Login failed. Please check your credentials.'
      };
    }
  };

  const register = async (userData: any) => {
    try {
      const res = await api.post('/auth/register', userData);
      if (res.data && res.data.token) {
        const authToken = res.data.token;
        const authUser = res.data.user;

        setToken(authToken);
        setUser(authUser);

        localStorage.setItem('dms_token', authToken);
        localStorage.setItem('dms_user', JSON.stringify(authUser));

        try {
          await logActivity('LOGIN', null, 'User account registered and signed in');
        } catch (e) {}

        return { success: true, message: 'Account registered successfully!' };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (err: any) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Registration failed. Please try again.'
      };
    }
  };

  const logout = async () => {
    try {
      await logActivity('LOGOUT', null, 'User signed out of session');
    } catch (e) {}
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors during logout
    } finally {
      setToken(null);
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('dms_token');
        localStorage.removeItem('dms_user');
        window.location.href = '/';
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, setUser: handleSetUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
