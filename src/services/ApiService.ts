import axios from 'axios';

// Create an axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api', // Default to backend on port 5000
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration or other errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error responses
    // Only redirect to login for 401 errors when NOT on the login page itself
    // This is important to prevent redirecting during login attempts
    if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
      // For 401 errors on non-login endpoints, clear tokens and redirect to login
      // This handles expired tokens for protected routes
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      localStorage.removeItem('businessData');
      window.location.href = '/login'; // Redirect to login page
    }
    return Promise.reject(error);
  }
);

export default api;