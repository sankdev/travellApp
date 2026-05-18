import axios from 'axios';

//const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://agencesvoyage.com:5001';

//const API_URL = 'http://localhost:5000'; // Adjust the base URL as needed
const API_URL='/api/image'
const axiosWithAuth = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: `${API_URL}`,
    headers: {
      'Authorization': `Bearer ${token}`,
    
    }
  });
};

const getHeaders = (data, token) => {
  const headers = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Si c'est un FormData, on laisse le navigateur gérer Content-Type
  if (!(data instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  return { headers };
};


export const imageService = {
    uploadImages: async (data) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axiosWithAuth().post(`/entity`, data );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateImages: async (entityType, id, data) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axiosWithAuth.put(`/${entityType}/${id}`, data );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};
