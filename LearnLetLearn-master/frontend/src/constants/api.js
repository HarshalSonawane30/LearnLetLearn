// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  PROFILE: '/auth/profile',
  
  // Skills
  SKILLS_GET: '/skills',
  SKILLS_UPDATE: '/skills',
  
  // Users - Recommendations & Search
  RECOMMENDATIONS_GET: '/users/recommendations',
  USERS_SEARCH: '/users/search',
  PROFILE_PHOTO_UPDATE: '/users/profile-photo',
  
  // Match
  MATCH_GET: '/match',
  MATCH_CREATE: '/match',
  
  // Chat
  CHAT_HISTORY: '/chat/history',
  
  // Requests
  REQUESTS_GET: '/request/received',
  REQUESTS_SEND: '/request/send',
  REQUESTS_UPDATE: '/request/respond',
  
  // Video
  VIDEO_HISTORY: '/video/history',
};
