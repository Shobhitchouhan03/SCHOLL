import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Bearer token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global error handling and automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const storedToken = localStorage.getItem('accessToken');
      if (storedToken) {
        try {
          const refreshRes = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
          if (refreshRes.data.success && refreshRes.data.accessToken) {
            localStorage.setItem('accessToken', refreshRes.data.accessToken);
            originalRequest.headers.Authorization = `Bearer ${refreshRes.data.accessToken}`;
            return api(originalRequest);
          }
        } catch (refreshErr) {
          localStorage.removeItem('accessToken');
        }
      }
    }
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject({ ...error, customMessage: message });
  }
);

export default api;
