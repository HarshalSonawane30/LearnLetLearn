import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { tokenManager } from '../utils/tokenManager';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = () => {
      try {
        // Check if user is authenticated
        if (authService.isAuthenticated()) {
          const storedUser = authService.getStoredUser();
          setUser(storedUser);
          setIsAuthenticated(true);
        } else {
          // Clear localStorage if token is invalid or expired
          tokenManager.logout();
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authService.login(email, password);
      setUser(data.user || authService.getStoredUser());
      setIsAuthenticated(true);
      return data;
    } catch (err) {
      const errorMessage = typeof err === 'string' ? err : err.message || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authService.register(userData);
      setUser(data.user || authService.getStoredUser());
      setIsAuthenticated(true);
      return data;
    } catch (err) {
      const errorMessage = typeof err === 'string' ? err : err.message || 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      setIsLoading(false);
    }
  }, []);

  // Get profile
  const getProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const profile = await authService.getProfile();
      setUser(profile);
      return profile;
    } catch (err) {
      const errorMessage = typeof err === 'string' ? err : err.message || 'Failed to load profile';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update user in state
  const updateUser = useCallback((userData) => {
    setUser(userData);
    tokenManager.setUser(userData);
  }, []);

  const value = {
    user,
    isLoading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    getProfile,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
