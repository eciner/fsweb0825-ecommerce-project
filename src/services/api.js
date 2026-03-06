import axios from 'axios';

/**
 * Axios API Service Configuration
 * 
 * This service is pre-configured for future API integration.
 * Currently, the application uses local data from src/data/
 * 
 * To enable API calls:
 * 1. Set VITE_API_URL in .env file
 * 2. Replace local data imports with API calls using this instance
 * 3. Example: const products = await api.get('/products');
 * 
 * Features:
 * - Automatic JWT token injection from localStorage
 * - Global error handling
 * - Response data unwrapping
 */

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if exists
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

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle errors globally
    const message = error.response?.data?.message || 'An error occurred';
    return Promise.reject(message);
  }
);

export default api;
