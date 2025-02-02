import axios from 'axios';

const API_URL = 'http://localhost:5000'; // Adjust the base URL as needed

export const destinationService = {
    createDestination: async (data) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${API_URL}/api/destinations/post`, data, {
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

    getDestinations: async (params) => {
        // const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/api/destinations`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getDestination: async (id) => {
        // const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/api/destinations/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateDestination: async (id, data) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.put(`${API_URL}/api/destinations/${id}`, data, {
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

    deleteDestination: async (id) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.delete(`${API_URL}/api/destinations/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};
