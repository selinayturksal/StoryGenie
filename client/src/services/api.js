import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

// Request interceptor — her istekte token'ı ekle
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sn_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — hata mesajlarını standartlaştır
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const validationErrors = error.response?.data?.errors;
    const message =
      (Array.isArray(validationErrors) && validationErrors[0]?.msg) ||
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;