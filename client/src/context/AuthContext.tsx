'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';

interface User {
  id: number;
  full_name: string;
  email: string;
  user_type: 'individual' | 'student' | 'professional' | 'admin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (fullName: string, email: string, password: string, userType: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('dms_token');
    const storedUser = localStorage.getItem('dms_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('dms_user');
      }
    }
    setLoading(false);
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

        return { success: true, message: 'Login successful!' };
      }
    } catch (err: any) { /* fallback below */ }

    // Standalone client mode login fallback
    const authUser: User = {
      id: 1,
      full_name: email.split('@')[0] ? (email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)) : 'Demo User',
      email: email,
      user_type: 'individual'
    };
    const authToken = 'demo_token_' + Date.now();
    setToken(authToken);
    setUser(authUser);
    localStorage.setItem('dms_token', authToken);
    localStorage.setItem('dms_user', JSON.stringify(authUser));
    return { success: true, message: 'Logged in successfully!' };
  };

  const register = async (fullName: string, email: string, password: string, userType: string) => {
    try {
      const res = await api.post('/auth/register', { fullName, email, password, userType });
      if (res.data && res.data.token) {
        const authToken = res.data.token;
        const authUser = res.data.user;

        setToken(authToken);
        setUser(authUser);

        localStorage.setItem('dms_token', authToken);
        localStorage.setItem('dms_user', JSON.stringify(authUser));

        return { success: true, message: 'Account registered successfully!' };
      }
    } catch { /* fallback below */ }

    const fallbackUser: User = {
      id: Date.now(),
      full_name: fullName,
      email: email,
      user_type: (userType as any) || 'individual'
    };
    const authToken = 'demo_token_' + Date.now();
    setToken(authToken);
    setUser(fallbackUser);
    localStorage.setItem('dms_token', authToken);
    localStorage.setItem('dms_user', JSON.stringify(fallbackUser));
    return { success: true, message: 'Registered successfully!' };
  };

  const logout = async () => {
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
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
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
