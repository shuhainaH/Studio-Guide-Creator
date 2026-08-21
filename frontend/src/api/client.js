import axios from 'axios';

// Get API URL from environment variables, fallback to local dev server
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh automatically
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) throw new Error('No refresh token');
                
                // Try to get a new access token
                const response = await axios.post(`${API_URL}auth/refresh/`, {
                    refresh: refreshToken
                });
                
                const { access } = response.data;
                localStorage.setItem('access_token', access);
                
                // Retry the original request
                apiClient.defaults.headers.Authorization = `Bearer ${access}`;
                originalRequest.headers.Authorization = `Bearer ${access}`;
                
                return apiClient(originalRequest);
            } catch (refreshError) {
                // If refresh fails, log the user out
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);

export default apiClient;
