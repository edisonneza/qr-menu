import React, { createContext, useEffect, useState } from 'react';
import api from '../api/axios';
interface AuthContextType {
  token: string | null;
  store: any | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
}
export const AuthContext = createContext<AuthContextType>({} as AuthContextType);
export const AuthProvider: React.FC<{ children: any }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [store, setStore] = useState<any>(() => localStorage.getItem('store') ? JSON.parse(localStorage.getItem('store')!) : null);
  useEffect(() => {
    if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    else delete api.defaults.headers.common['Authorization'];
  }, [token]);
  const login = async (email: string, password: string) => {
    const res = await api.post('/login.php', { email, password });
    const { token, store } = res.data;
    setToken(token);
    setStore(store);
    localStorage.setItem('token', token);
    localStorage.setItem('store', JSON.stringify(store));
    return res.data;
  };
  const logout = () => {
    setToken(null);
    setStore(null);
    localStorage.removeItem('token');
    localStorage.removeItem('store');
  };
  return (
    <AuthContext.Provider value={{ token, store, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
