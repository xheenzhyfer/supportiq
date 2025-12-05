import axios from 'axios';
import { supabase } from './supabase'; // Import your client

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://supportiq.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  
  return config;
});

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized! Redirecting to login...');
    }
    console.error('API Error Object:', error);
    console.error('API Error Response:', error.response);
    console.error('API Error Message:', error.message);
    return Promise.reject(error);
  }
);

export default api;