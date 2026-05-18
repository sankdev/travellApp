import axios from 'axios';
//const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://agencesvoyage.com:5001';

//const API_URL = 'http://localhost:5000/api/company';
const API_URL='/api/company'
const axiosWithAuth = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: `${API_URL}`,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

export const companyService = {
    getCompanyProfile: async (id) => {
       // const token = localStorage.getItem('token');
        try {
            const response = await axiosWithAuth().get(`/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateCompanyProfile: async (id, data) => {
        //const token = localStorage.getItem('token');
        try {
            const response = await axiosWithAuth().put(`/${id}`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getCompanyStats: async () => {
        
        try {
            const response = await axiosWithAuth().get('/stats');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // CRUD Endpoints for Company
    createCompany: async (data) => {
        
        try {
            const response = await axiosWithAuth().post('/post', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getCompanies: async (params) => {
        // const token = localStorage.getItem('token');
        try {
            const response = await axiosWithAuth().get('/');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getCompany: async (id) => {
        // const token = localStorage.getItem('token');
        try {
            const response = await axiosWithAuth().get(`/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateCompany: async (id, data) => {
        
        try {
            const response = await axiosWithAuth().put(`/${id}`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    deleteCompany: async (id) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axiosWithAuth.delete(`/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};
