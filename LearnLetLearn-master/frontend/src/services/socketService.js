import { io } from 'socket.io-client';
import { tokenManager } from '../utils/tokenManager';

let socket = null;

export const socketService = {
  // Initialize socket connection (only once)
  initialize: (userId, onConnect = null) => {
    if (socket?.connected) {
      console.log('Socket already connected');
      return socket;
    }

    socket = io('/', {
      autoConnect: false,
      auth: {
        token: tokenManager.getToken(),
      },
    });

    socket.on('connect', () => {
      console.log('Socket connected');
      if (userId) {
        socket.emit('join', { userId });
      }
      if (onConnect) onConnect();
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    socket.connect();
    return socket;
  },

  // Get socket instance
  getInstance: () => {
    return socket;
  },

  // Disconnect socket
  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  // Send message
  sendMessage: (data, callback) => {
    if (socket?.connected) {
      socket.emit('send_message', data, callback);
    }
  },

  // Fetch chat history
  fetchHistory: (data, callback) => {
    if (socket?.connected) {
      socket.emit('fetch_history', data, callback);
    }
  },

  // Listen to incoming messages
  onMessage: (callback) => {
    if (socket) {
      socket.on('receive_message', callback);
    }
  },

  // Listen to typing indicator
  onTyping: (callback) => {
    if (socket) {
      socket.on('typing', callback);
    }
  },

  // Send typing indicator
  sendTyping: (data) => {
    if (socket?.connected) {
      socket.emit('typing', data);
    }
  },

  // Listen to online status
  onStatusChange: (callback) => {
    if (socket) {
      socket.on('user_online', callback);
      socket.on('user_offline', callback);
    }
  },

  // Remove listeners
  removeListener: (event) => {
    if (socket) {
      socket.off(event);
    }
  },
};
