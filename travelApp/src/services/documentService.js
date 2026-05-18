import axios from 'axios';
//const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://agencesvoyage.com:5001';

//const API_URL = 'http://localhost:5000/api/documents';

const API_URL='/api/documents'
const axiosWithAuth = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: `${API_URL}`,
    headers: {
      'Authorization': `Bearer ${token}`,
     
    }
  });
};


//const authHeader = () => {
  //  const token = localStorage.getItem('token');
   // return token ? { Authorization: `Bearer ${token}` } : {};
//};

export const documentService = {
    createDocument: async (data) => {
        try {
            const response = await axiosWithAuth().post('/',data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getDocuments: async (params) => {
        try {
            const response = await axiosWithAuth().get(`/${params.relatedEntity}/${params.relatedEntityId}`, {
                params
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getDocumentById: async (id, relatedEntity, relatedEntityId) => {
        try {
            const response = await axiosWithAuth().get(`/${relatedEntity}/${relatedEntityId}/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateDocument: async (id, data) => {
        try {
            const response = await axiosWithAuth().put(`/${id}`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    deleteDocument: async (id) => {
        try {
            const response = await axiosWithAuth().delete(`/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};
