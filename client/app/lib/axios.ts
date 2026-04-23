import axios from 'axios';
import { storage } from './storage';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5101/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown | null, token: string | null = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

axiosClient.interceptors.request.use(
  (config) => {
    const token = storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = String(originalRequest?.url ?? '');
    const hasAccessToken = !!storage.getToken();
    const isAuthRequest =
      requestUrl.includes('/Auth/login')
      || requestUrl.includes('/Auth/register')
      || requestUrl.includes('/Auth/refresh-token')
      || requestUrl.includes('/Auth/confirm-email');
    
    if (error.response?.status === 401 && !originalRequest._retry && hasAccessToken && !isAuthRequest) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axiosClient.post('/Auth/refresh-token');
        const newToken = response.data.token;
        
        if (!newToken) {
          throw new Error('No token received from refresh');
        }
        
        const rememberMe = storage.getRememberMe?.() ?? false;
        storage.setToken(newToken, rememberMe);
        
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        processQueue(null, newToken);
        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        storage.clearAll();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient;