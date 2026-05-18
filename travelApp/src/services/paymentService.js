import axios from 'axios';
//const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://agencesvoyage.com:5001';

//const API_URL = 'http://localhost:5000/api/payment';
const API_URL='/api/payment'
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


//const authHeader = () => {
  //  const token = localStorage.getItem('token');
  //  return token ? { Authorization: `Bearer ${token}` } : {};
//};

export const paymentService = {
   // createPayment: async (paymentData) => {
        //const response = await axiosWithAuth().post('/', paymentData);
      //  return response.data;
    //},
     createPayment:async (paymentData)=> {
        try {
            // Adapter les noms des champs pour correspondre au backend
            const backendData = {
                invoiceId: paymentData.invoiceId,
                paymentModeId: paymentData.modePaymentId, // Note: paymentModeId pour le backend
                amount: paymentData.amount,
                reference: paymentData.reference || undefined,
                description: paymentData.description || '',
                paymentDate: paymentData.paymentDate || new Date().toISOString()
            };
            
            console.log('📤 Envoi des données au backend:', backendData);
            const response = await axiosWithAuth().post('/', backendData);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur création paiement:', error);
            throw error;
        }
    },
    getPayments: async () => {
        const response = await axiosWithAuth().get('/');
        return response.data;
    },
    getPaymentById: async (paymentId) => {
        const response = await axiosWithAuth().get(`/${paymentId}`);
        return response.data;
    },
      getPaymentByInvoice: async (invoiceId) => {
        const response = await axiosWithAuth().get(`/invoice/${invoiceId}`);
        return response.data;
    },

    updatePayment: async (paymentId, paymentData) => {
        const response = await axiosWithAuth().patch(`/${paymentId}`, paymentData);
        return response.data;
    },
    deletePayment: async (paymentId) => {
        const response = await axiosWithAuth().delete(`/${paymentId}`);
        return response.data;
    },
    validatePay: async (paymentId) => {
        const response = await axiosWithAuth().put(`/validate/${paymentId}`);
        return response.data;
    },
};
