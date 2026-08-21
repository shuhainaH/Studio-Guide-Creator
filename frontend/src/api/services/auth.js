import apiClient from '../client';

export const authService = {
    login: async (username, password) => {
        const response = await apiClient.post('auth/login/', { username, password });
        if (response.data.access) {
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
        }
        return response.data;
    },
    
    register: async (username, email, password) => {
        const response = await apiClient.post('auth/register/', { username, email, password });
        return response.data;
    },
    
    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    },

    getCurrentUser: async () => {
        const response = await apiClient.get('users/me/');
        return response.data;
    },
    
    updateUser: async (data) => {
        const response = await apiClient.patch('users/me/', data);
        return response.data;
    },
    
    updateProfile: async (data) => {
        const response = await apiClient.patch('users/me/profile/', data);
        return response.data;
    },

    changePassword: async (old_password, new_password) => {
        const response = await apiClient.put('users/me/change-password/', { old_password, new_password });
        return response.data;
    }
};
