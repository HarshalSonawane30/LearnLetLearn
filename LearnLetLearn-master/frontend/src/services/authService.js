import apiClient from './apiClient';
import { tokenManager } from '../utils/tokenManager';
import { API_ENDPOINTS } from '../constants/api';

export const authService = {
  // Login user
  login: async (email, password) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.LOGIN, {
        email,
        password,
      });
      
      if (response.data.token) {
        tokenManager.setToken(response.data.token);
      }
      if (response.data.user) {
        tokenManager.setUser(response.data.user);
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
  },

  // Register user
  register: async (userData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.REGISTER, userData);
      
      if (response.data.token) {
        tokenManager.setToken(response.data.token);
      }
      if (response.data.user) {
        tokenManager.setUser(response.data.user);
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PROFILE);
      if (response.data) {
        tokenManager.setUser(response.data);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to load profile';
    }
  },

  // Logout user
  logout: async () => {
    try {
      await apiClient.post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenManager.logout();
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return tokenManager.hasToken() && !tokenManager.isTokenExpired();
  },

  // Get stored user
  getStoredUser: () => {
    return tokenManager.getUser();
  },
};
