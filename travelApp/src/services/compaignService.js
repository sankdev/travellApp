import axios from 'axios';
// import.meta.env.VITE_API_BASE_URL ||
//const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://agencesvoyage.com:5001'; // Base URL for the API

 const API_URL='/api/campaign'
const axiosWithAuth = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: `${API_URL}`,
    headers: {
      'Authorization': `Bearer ${token}`,
      
    }
  });
};


export const compaignService = {
    getCompaigns: async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axiosWithAuth().get('/');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
    getCompaignsByUser: async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axiosWithAuth().get('/user');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
    getActiveCampaigns: async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axiosWithAuth().get('/all/active');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getCompaignById: async (id) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axiosWithAuth().get(`/${id}`);
           console.log('campaign By Id',response) 
           return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    createCompaign: async (data) => {
      //  const token = localStorage.getItem('token');
        try {
            const response = await axiosWithAuth().post('/post', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateCompaign: async (id, data) => {
//        const token = localStorage.getItem('token');
        try {
            const response = await axiosWithAuth().put(`/${id}`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    deleteCompaign: async (id) => {
        
        try {
            const response = await axiosWithAuth().delete(`/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};
