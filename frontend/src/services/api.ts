import axios from 'axios';

// Fallback to local server port if environment VITE_API_URL is not set
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token on authenticated requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('civicconnect_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for centralized error parsing
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong. Please check your connection.';
    return Promise.reject(new Error(message));
  }
);

export default api;
