import axios from 'axios';

const API_URL = 'http://localhost:5000'; // Base URL for the API

export const compaignService = {
    getCompaigns: async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/api/campaign`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
    getCompaignsByUser: async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/api/campaign/user`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
    getActiveCampaigns: async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/api/campaign/all/active`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getCompaignById: async (id) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/api/campaign/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    createCompaign: async (data) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${API_URL}/api/campaign/post`, data, {
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

    updateCompaign: async (id, data) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.put(`${API_URL}/api/campaign/${id}`, data, {
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

    deleteCompaign: async (id) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.delete(`${API_URL}/api/campaign/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};
