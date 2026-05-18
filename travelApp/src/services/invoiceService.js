import axios from 'axios';
//const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://agencesvoyage.com:5001';

//const API_URL = 'http://localhost:5000/api/invoice';

// Ajouter le token aux headers pour les requêtes authentifiées
const API_URL='/api/invoice'
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

export const invoiceService = {
    getInvoices: async () => {
        return axiosWithAuth().get('/my-invoices');
    },
    getInvoicesForAgency: async () => {
        const userId=localStorage.getItem('userId')
        return axiosWithAuth().get(`/userAgency/${userId}`);
    },
    getInvoicesForCustomer: async () => {
        const userId=localStorage.getItem('userId')
        return axiosWithAuth().get(`/userCustomer/${userId}`);
    },
    getInvoiceDetails: async (invoiceId) => {
        return axiosWithAuth().get(`/${invoiceId}`);
    },
    downloadInvoice: async (invoiceId) => {
        return axiosWithAuth().get(`/download/${invoiceId}`, {
            headers: authHeader(),
            responseType: 'blob'
        });
    },
    createInvoice: async (invoiceData) => {
        return axiosWithAuth().post('/', invoiceData, { headers: authHeader() });
    },
    updateInvoice: async (invoiceId, invoiceData) => {
        return axiosWithAuth().patch(`/${invoiceId}`, invoiceData);
    },
    deleteInvoice: async (invoiceId) => {
        return axiosWithAuth().delete(`/${invoiceId}`);
    }
};
