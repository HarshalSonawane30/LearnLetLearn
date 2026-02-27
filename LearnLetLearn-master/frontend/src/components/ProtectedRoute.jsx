import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../app/AuthContext';
import { LoadingSpinner } from './ui';

// Protected Route Component
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};
