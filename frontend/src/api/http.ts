import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000/api/';

const http: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach access token from localStorage to each request
http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    const headers = (config.headers ?? {}) as Record<string, string>;
    headers['Authorization'] = `Bearer ${token}`;
    config.headers = headers as InternalAxiosRequestConfig['headers'];
  }
  return config;
});

// Try to refresh token on 401 responses
http.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const resp = await axios.post(`${API_BASE}auth/token/refresh/`, { refresh: refreshToken });
          const { access } = resp.data as { access: string };
          localStorage.setItem('accessToken', access);
          // apply new access token to the original request headers
          if (originalRequest.headers) {
            const headers = (originalRequest.headers ?? {}) as Record<string, string>;
            headers['Authorization'] = `Bearer ${access}`;
            originalRequest.headers = headers as InternalAxiosRequestConfig['headers'];
          }
          return axios(originalRequest);
        } catch (e) {
          // Refresh failed -> clear storage and redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(e);
        }
      }
    }

    return Promise.reject(error);
  },
);

export default http;
 