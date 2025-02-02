import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/payment';

const authHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const paymentService = {
    createPayment: async (paymentData) => {
        const response = await axios.post(API_URL, paymentData, { headers: authHeader() });
        return response.data;
    },
    getPayments: async () => {
        const response = await axios.get(API_URL, { headers: authHeader() });
        return response.data;
    },
    getPaymentById: async (paymentId) => {
        const response = await axios.get(`${API_URL}/${paymentId}`, { headers: authHeader() });
        return response.data;
    },
    updatePayment: async (paymentId, paymentData) => {
        const response = await axios.patch(`${API_URL}/${paymentId}`, paymentData, { headers: authHeader() });
        return response.data;
    },
    deletePayment: async (paymentId) => {
        const response = await axios.delete(`${API_URL}/${paymentId}`, { headers: authHeader() });
        return response.data;
    },
    validatePay: async (paymentId) => {
        const response = await axios.put(`${API_URL}/validate/${paymentId}`, {}, { headers: authHeader() });
        return response.data;
    },
};
