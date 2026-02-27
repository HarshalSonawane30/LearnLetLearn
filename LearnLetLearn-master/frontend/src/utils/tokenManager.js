// Token Manager for JWT handling
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export const tokenManager = {
  // Get token from localStorage
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Set token to localStorage
  setToken: (token) => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  // Clear token from localStorage
  clearToken: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  // Get user data from localStorage
  getUser: () => {
    try {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  // Set user data to localStorage
  setUser: (user) => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  // Clear user data from localStorage
  clearUser: () => {
    localStorage.removeItem(USER_KEY);
  },

  // Logout - clear both token and user
  logout: () => {
    tokenManager.clearToken();
    tokenManager.clearUser();
  },

  // Check if token exists
  hasToken: () => {
    return !!tokenManager.getToken();
  },

  // Check if token is expired (basic check)
  isTokenExpired: () => {
    const token = tokenManager.getToken();
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  },
};
