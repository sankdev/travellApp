import axios from 'axios';
//const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://agencesvoyage.com:5001';

//const API_URL = 'http://localhost:5000/api/reservations';
const API_URL='/api/reservations'
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

export const reservationService = {
    createReservation: async (reservationData) => {
        const response = await axiosWithAuth().post('/', reservationData);
    
        return response.data;
    },

      createReservationDemande: async (reservationData) => {
        const response = await axiosWithAuth().post('/demande', reservationData);

        return response.data;
    },
     createReservationAuto: async (reservationData) => {
        const response = await axiosWithAuth().post('/auto', reservationData);

        return response.data;
    },

  createReservationCampaign: async (reservationData) => {
        const response = await axiosWithAuth().post('/campaign', reservationData);

        return response.data;
    },

   
   respondToProposal: async (responseData) => {
  const response = await axiosWithAuth().post('/proposals/respond', responseData);
  return response.data;
},
combineConfirmReservation: async (reservationId) => {
  const response = await axiosWithAuth().post('/confirm/proposal',{reservationId });
  return response.data;
},

    getReservations: async () => {
        const response = await axiosWithAuth().get('/');
        return response.data;
    },
    listReservations: async () => {
        const response = await axiosWithAuth().get('/list');
        return response.data;
    },
    getAgencyReservations: async () => {
        const response = await axiosWithAuth().get('/agency');
        return response.data;
      },
      // Confirmer une réservation
  confirmReservation: async (reservationId) => {
    
    const response = await axiosWithAuth().post(
      '/confirm',
      { reservationId },
          );

    if (response.status !== 200) {
      throw new Error(response.data.message || 'Failed to confirm reservation');
    }
    return response.data;
  },
         createCounterProposal: async (proposalData) => {
    const response = await axiosWithAuth().post('/counter-proposals', proposalData);
    return response.data;
  },
       createCounterProposals: async (proposalData) => {
    const response = await axiosWithAuth().post('/counter-proposals/proposal', proposalData);
    return response.data;
  },

    
    getReservationById: async (id) => {
        const response = await axiosWithAuth().get(`/${id}`);
        return response.data;
    },
    updateReservation: async (id, reservationData) => {
        return axiosWithAuth().put(`/${id}`, reservationData);
    },
    cancelReservation: async (id) => {
        return axiosWithAuth().put(`/${id}/cancel`);
    },
    getReservationsByAgency: async (agencyId) => {
        const response = await axiosWithAuth().get(`/agency/${agencyId}`);
        return response.data;
    },
    getReservationsByCustomer: async (customerId) => {
        const response = await axiosAuthWith().get(`/customer/${customerId}`);
        return response.data;
    }
};
