import React, { createContext, useEffect, useState } from 'react';
import api from '../api/axios';
import { log } from 'console';
import { User } from '../models/User';
interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
}
export const AuthContext = createContext<AuthContextType>({} as AuthContextType);
export const AuthProvider: React.FC<{ children: any }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null);
  useEffect(() => {
    if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    else delete api.defaults.headers.common['Authorization'];
  }, [token]);

  useEffect(() => {
    if (!user) {
      logout();
    }
  }, [user]);
  const login = async (email: string, password: string) => {
    const res = await api.post('/login.php', { email, password });
    const { token, user } = res.data.data;
    setToken(token);
    setUser(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return res.data;
  };
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };
  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
