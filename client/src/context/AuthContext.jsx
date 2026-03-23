import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'sonner';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for user/token
    const storedUser = sessionStorage.getItem('user');
    const storedToken = sessionStorage.getItem('token');
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    sessionStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
