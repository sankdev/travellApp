import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/invoice';

// Ajouter le token aux headers pour les requêtes authentifiées
const authHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const invoiceService = {
    getInvoices: async () => {
        return axios.get(`${API_URL}/my-invoices`, { headers: authHeader() });
    },
    getInvoiceDetails: async (invoiceId) => {
        return axios.get(`${API_URL}/${invoiceId}`, { headers: authHeader() });
    },
    downloadInvoice: async (invoiceId) => {
        return axios.get(`${API_URL}/download/${invoiceId}`, {
            headers: authHeader(),
            responseType: 'blob'
        });
    },
    createInvoice: async (invoiceData) => {
        return axios.post(`${API_URL}/`, invoiceData, { headers: authHeader() });
    },
    updateInvoice: async (invoiceId, invoiceData) => {
        return axios.patch(`${API_URL}/${invoiceId}`, invoiceData, { headers: authHeader() });
    },
    deleteInvoice: async (invoiceId) => {
        return axios.delete(`${API_URL}/${invoiceId}`, { headers: authHeader() });
    }
};
