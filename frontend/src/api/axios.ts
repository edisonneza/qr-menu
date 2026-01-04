import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://192.168.100.148/github/qr-menu/backend/api',
  headers: { 'Content-Type': 'application/json' }
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response, // successful responses
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        // No refresh token, clear auth and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh the token
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE || 'http://192.168.100.148/github/qr-menu/backend/api'}/auth/refresh`,
          { refresh_token: refreshToken }
        );

        if (response.data.success) {
          const { access_token, refresh_token: newRefreshToken } = response.data.data;
          
          // Update stored tokens
          localStorage.setItem('token', access_token);
          localStorage.setItem('refresh_token', newRefreshToken);
          
          // Update axios default header
          api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
          originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
          
          // Process queued requests
          processQueue(null, access_token);
          isRefreshing = false;
          
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear auth and redirect
        processQueue(refreshError, null);
        isRefreshing = false;
        
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
