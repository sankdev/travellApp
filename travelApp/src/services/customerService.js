import axios from 'axios';
//const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://agencesvoyage.com:5001';

//const API_URL = 'http://localhost:5000/api/customer';

// Ajouter le token aux headers pour les requêtes authentifiées
const API_URL='/api/customer'

const axiosWithAuth = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: `${API_URL}`,
    headers: {
      'Authorization': `Bearer ${token}`,
     
    }
  });
};

const authHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const customerService = {
    // Profil
    getCustomerProfile: async () => {
        return axiosWithAuth().get(`/customers/profile`);
    },
    getCustomerProfileById: async (id) => {
        return axiosWithAuth().get(`/customers/profile/${id}`);
    },
    getAllCustomersWithoutRestriction:async () => {
        return axiosWithAuth().get('/customers/without');
    },
    updateCustomerProfile: async (profileData) => {
    return axiosWithAuth().put('/customers/profile', profileData
);
  },
    createCustomer: async (customerData) => {
    return axiosWithAuth().post('/customers', customerData
    );
  },

    // Réservations 
    
    getCustomerReservations: async () => {
        return axiosWithAuth().get('/customers/reservations');
    },

    getReservationDetails: async (reservationId) => {
        return axios.get(`${API_URL}/customers/reservations/${reservationId}`, { headers: authHeader() });
    },

    createReservation: async (reservationData) => {
        return axiosWithAuth().post('/reservations', reservationData);
    },

    cancelReservation: async (reservationId) => {
        return axios.put(
            `${API_URL}/api/customer/customers/reservations/${reservationId}/cancel`,
            {},
            { headers: authHeader() }
        );
    },

    // Factures
    getCustomerInvoices: async () => {
        return axiosWithAuth().get('/customers/invoices');
    },

    getInvoiceDetails: async (invoiceId) => {
        return axiosWithAuth().get(`/customers/invoices/${invoiceId}`);
    },

    downloadInvoice: async (invoiceId) => {
        return axios.get(`/customers/invoices/${invoiceId}/download`, {
            headers: authHeader(),
            responseType: 'blob'
        });
    },

    // Paiements
    initiatePayment: async (invoiceId, paymentData) => {
        return axios.post(
            `customers/invoices/${invoiceId}/pay`,
            paymentData,
            { headers: authHeader() }
        );
    },

    // Customers
    getAllCustomers: async () => {
        return axiosWithAuth().get('/customers/all');
    }
};
