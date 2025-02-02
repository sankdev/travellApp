import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/vols';

const authHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const volService = {
    getVols: async () => {
        const response = await axios.get(API_URL, { headers: authHeader() });
        return response.data; // Ensure data is returned
    },
    getVolById: async (id) => {
        return axios.get(`${API_URL}/${id}`, { headers: authHeader() });
    },
    createVol: async (volData) => {
        return axios.post(`${API_URL}/post`, volData, { headers: authHeader() });
    },
    updateVol: async (id, volData) => {
        return axios.put(`${API_URL}/${id}`, volData, { headers: authHeader() });
    },
    deleteVol: async (id) => {
        return axios.delete(`${API_URL}/${id}`, { headers: authHeader() });
    }
};
