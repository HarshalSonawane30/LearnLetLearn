import { useEffect, useState, useCallback } from 'react';
import { socketService } from '../services/socketService';

// Custom hook for socket.io functionality
export const useSocket = (userId, events = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  // Initialize socket on mount
  useEffect(() => {
    if (!userId) return;

    socketService.initialize(userId, () => {
      setIsConnected(true);
      setError(null);
    });

    const socket = socketService.getInstance();

    // Register event listeners
    Object.entries(events).forEach(([event, callback]) => {
      socket?.on(event, callback);
    });

    return () => {
      // Cleanup listeners
      Object.keys(events).forEach((event) => {
        socket?.off(event);
      });
    };
  }, [userId, events]);

  // Emit helper
  const emit = useCallback((event, data, callback) => {
    socketService.sendMessage(data, callback);
  }, []);

  return { isConnected, error, emit };
};
