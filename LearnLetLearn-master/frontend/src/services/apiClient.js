import axios from 'axios';
import { tokenManager } from '../utils/tokenManager';
import { API_BASE_URL } from '../constants/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // withCredentials not needed since we use JWT in Authorization header
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      tokenManager.logout();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
