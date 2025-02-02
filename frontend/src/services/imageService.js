import axios from 'axios';

const API_URL = 'http://localhost:5000'; // Adjust the base URL as needed

export const imageService = {
    uploadImages: async (data) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${API_URL}/api/image/entity`, data, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateImages: async (entityType, id, data) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.put(`${API_URL}/api/image/images/${entityType}/${id}`, data, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};
