import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000, // AI üretimi uzun sürebilir
});

// Response interceptor — hata mesajlarını standartlaştır
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // express-validator returns { errors: [{msg, ...}] }, not { error: string }
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
