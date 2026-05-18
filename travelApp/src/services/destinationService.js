import axios from 'axios';
//const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://agencesvoyage.com:5001';
 
//const API_URL = 'http://localhost:5000'; // Adjust the base URL as needed
const API_URL='/api/destinations/'
const axiosWithAuth = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: `${API_URL}`,
    headers: {
      'Authorization': `Bearer ${token}`,
      
    }
  });
};
 

export const destinationService = {
    createDestination: async (data) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axiosWithAuth().post('/post', data );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getDestinations: async (params) => {
        // const token = localStorage.getItem('token');
        try {
            const response = await axiosWithAuth().get('/');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getDestination: async (id) => {
        // const token = localStorage.getItem('token');
        try {
            const response = await axiosWithAut().get(`/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateDestination: async (id, data) => {
       // const token = localStorage.getItem('token');
        try {
            const response = await axiosWithAuth().put(`/${id}`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    deleteDestination: async (id) => {
        //const token = localStorage.getItem('token');
        try {
            const response = await axiosWithAuth().delete(`/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};
