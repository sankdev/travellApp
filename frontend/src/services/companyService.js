import axios from 'axios';

const API_URL = 'http://localhost:5000/api/company';

export const companyService = {
    getCompanyProfile: async (id) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateCompanyProfile: async (id, data) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.put(`${API_URL}/${id}`, data, {
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

    getCompanyStats: async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // CRUD Endpoints for Company
    createCompany: async (data) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${API_URL}/post`, data, {
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

    getCompanies: async (params) => {
        // const token = localStorage.getItem('token');
        try {
            const response = await axios.get(API_URL);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getCompany: async (id) => {
        // const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateCompany: async (id, data) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.put(`${API_URL}/${id}`, data, {
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

    deleteCompany: async (id) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.delete(`${API_URL}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};
