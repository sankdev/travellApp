import axios from 'axios';
//const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://agencesvoyage.com:5001';

//const API_URL = 'http://localhost:5000/api/paymentMode';
const API_URL='/api/paymentMode'
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

const authHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const paymentModeService = {
    getActivePaymentModes: async () => {
        const response = await axiosWithAuth().get('/modes');
        return response.data;
    },
   getPaymentModesByAgency: async (agencyId) => {
    const response = await axiosWithAuth().get(`/mode/get/${agencyId}`);
    return response.data;
  },
    createPaymentMode: async (paymentModeData) => {
        const response = await axiosWithAuth().post('/mode', paymentModeData);
        return response.data;
    },
    updatePaymentMode: async (paymentModeId, paymentModeData) => {
        const response = await axiosWithAuth().put('/mode/${paymentModeId}', paymentModeData);
        return response.data;
    },
    deletePaymentMode: async (paymentModeId) => {
        const response = await axiosWithAuth().delete(`/mode/${paymentModeId}`);
        return response.data;
    }
};
