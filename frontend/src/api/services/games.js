import apiClient from '../client';

export const gamesService = {
    getAllGames: async (params = {}) => {
        const response = await apiClient.get('games/', { params });
        return response.data; // Usually { results: [...], count: ... } if paginated
    },
    
    getGameDetails: async (id) => {
        const response = await apiClient.get(`games/${id}/`);
        return response.data;
    },
    
    createGame: async (gameData) => {
        const response = await apiClient.post('games/', gameData);
        return response.data;
    },
    
    updateGame: async (id, gameData) => {
        const response = await apiClient.patch(`games/${id}/`, gameData);
        return response.data;
    },
    
    deleteGame: async (id) => {
        const response = await apiClient.delete(`games/${id}/`);
        return response.data;
    },

    likeGame: async (id) => {
        const response = await apiClient.post(`games/${id}/like/`);
        return response.data;
    },

    getCategories: async () => {
        const response = await apiClient.get('categories/');
        return response.data;
    }
};
