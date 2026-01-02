import React, { createContext, useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { User } from '../models/User';
interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  handleTokenExpired: () => void;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: any }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Helper function to check if token is expired
  const isTokenExpired = useCallback((token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= expirationTime;
    } catch (error) {
      return true; // If we can't decode, consider it expired
    }
  }, []);

  // Handle token expiration
  const handleTokenExpired = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login page
    window.location.href = '/login';
  }, []);

  // Check token validity on mount and when token changes
  useEffect(() => {
    if (token) {
      if (isTokenExpired(token)) {
        handleTokenExpired();
      } else {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token, isTokenExpired, handleTokenExpired]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/login.php', { email, password });
    const { token, user } = res.data.data;
    setToken(token);
    setUser(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return res.data;
  };

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);
  return (
    <AuthContext.Provider value={{ token, user, login, logout, handleTokenExpired }}>
      {children}
    </AuthContext.Provider>
  );
};
