import axios from 'axios';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return (window as any).__NUXT__?.config?.public?.apiBase || 'http://localhost:3000/api/v1';
  }
  return 'http://localhost:3000/api/v1';
};

export const GATEWAY_ENDPOINT = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
  timeout: 15000,
});

export const GATEWAY_ENDPOINT_WITH_AUTH = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
  timeout: 15000,
});

const getCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};

const getToken = () => {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem('ticketr_admin_token');
};

// Add request interceptor to inject token
GATEWAY_ENDPOINT_WITH_AUTH.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle 401
GATEWAY_ENDPOINT_WITH_AUTH.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ticketr_admin_token');
        localStorage.removeItem('ticketr_admin_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
