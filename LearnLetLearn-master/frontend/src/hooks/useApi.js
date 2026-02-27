import { useState, useCallback } from 'react';
import apiClient from '../services/apiClient';

// Custom hook for API calls with loading and error states
export const useApi = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (config = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get(url, { ...options, ...config });
      setData(response.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [url, options]);

  return { data, isLoading, error, fetchData, setData, setError };
};

// Custom hook for POST/PUT/DELETE requests
export const useApiMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (method, url, payload = null) => {
    try {
      setIsLoading(true);
      setError(null);

      let response;
      if (method === 'POST') {
        response = await apiClient.post(url, payload);
      } else if (method === 'PUT') {
        response = await apiClient.put(url, payload);
      } else if (method === 'DELETE') {
        response = await apiClient.delete(url);
      }

      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error, setError };
};
