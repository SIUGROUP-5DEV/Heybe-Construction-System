import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, setAuthToken } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        setAuthToken(token);
        // Verify token with backend
        const response = await authAPI.verify();
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await AsyncStorage.removeItem('authToken');
      setAuthToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      
      if (response.data.success) {
        const { token, user } = response.data;
        await AsyncStorage.setItem('authToken', token);
        setAuthToken(token);
        setUser(user);
        return { success: true };
      } else {
        return { success: false, error: 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('authToken');
    setAuthToken(null);
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};