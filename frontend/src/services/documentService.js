import axios from 'axios';

const API_URL = 'http://localhost:5000/api/documents';

const authHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const documentService = {
    createDocument: async (data) => {
        try {
            const response = await axios.post(API_URL, data, {
                headers: {
                    ...authHeader(),
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getDocuments: async (params) => {
        try {
            const response = await axios.get(`${API_URL}/${params.relatedEntity}/${params.relatedEntityId}`, {
                params,
                headers: authHeader(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getDocumentById: async (id, relatedEntity, relatedEntityId) => {
        try {
            const response = await axios.get(`${API_URL}/${relatedEntity}/${relatedEntityId}/${id}`, {
                headers: authHeader(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateDocument: async (id, data) => {
        try {
            const response = await axios.put(`${API_URL}/${id}`, data, {
                headers: authHeader(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    deleteDocument: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/${id}`, {
                headers: authHeader(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};
