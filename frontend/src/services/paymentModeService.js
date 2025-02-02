import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/paymentMode';

const authHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const paymentModeService = {
    getActivePaymentModes: async () => {
        const response = await axios.get(`${API_URL}/modes`, { headers: authHeader() });
        return response.data;
    },
    createPaymentMode: async (paymentModeData) => {
        const response = await axios.post(API_URL, paymentModeData, { headers: authHeader() });
        return response.data;
    },
    updatePaymentMode: async (paymentModeId, paymentModeData) => {
        const response = await axios.put(`${API_URL}/${paymentModeId}`, paymentModeData, { headers: authHeader() });
        return response.data;
    },
    deletePaymentMode: async (paymentModeId) => {
        const response = await axios.delete(`${API_URL}/${paymentModeId}`, { headers: authHeader() });
        return response.data;
    }
};
