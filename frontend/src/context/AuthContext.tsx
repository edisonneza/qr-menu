import React, { createContext, useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { User } from '../models/User';
interface AuthContextType {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  handleTokenExpired: () => void;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: any }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState<string | null>(() => localStorage.getItem('refresh_token'));
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Helper function to check if token is expired
  const isTokenExpired = useCallback((token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      // Add a 30-second buffer to refresh before actual expiration
      return Date.now() >= (expirationTime - 30000);
    } catch (error) {
      return true; // If we can't decode, consider it expired
    }
  }, []);

  // Handle token expiration
  const handleTokenExpired = useCallback(() => {
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    // Redirect to login page
    window.location.href = '/login';
  }, []);

  // Check token validity on mount and when token changes
  useEffect(() => {
    if (token) {
      if (isTokenExpired(token)) {
        // Token is expired, but axios interceptor will handle refresh
        // Only clear if there's no refresh token
        if (!refreshToken) {
          handleTokenExpired();
        }
      } else {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token, refreshToken, isTokenExpired, handleTokenExpired]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { access_token, refresh_token, user } = res.data.data;
    
    setToken(access_token);
    setRefreshToken(refresh_token);
    setUser(user);
    
    localStorage.setItem('token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return res.data;
  };

  const logout = useCallback(async () => {
    // Call backend to revoke refresh token
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refresh_token: refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }, [refreshToken]);
  return (
    <AuthContext.Provider value={{ token, refreshToken, user, login, logout, handleTokenExpired }}>
      {children}
    </AuthContext.Provider>
  );
};
