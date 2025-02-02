import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/reservations';

const authHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const reservationService = {
    createReservation: async (reservationData) => {
        const headers = {
            ...authHeader(),
            'Content-Type': 'multipart/form-data',
        };
        return axios.post(API_URL, reservationData, { headers });
    },
    getReservations: async () => {
        const response = await axios.get(API_URL, { headers: authHeader() });
        return response.data;
    },
    listReservations: async () => {
        const response = await axios.get(`${API_URL}/list`, { headers: authHeader() });
        return response.data;
    },
    getAgencyReservations: async () => {
        const response = await axios.get(`${API_URL}/agency`, { headers: authHeader() });
        return response.data;
      },
      // Confirmer une réservation
  confirmReservation: async (reservationId) => {
    const headers = {
      ...authHeader(),
      'Content-Type': 'application/json',
    };
    const response = await axios.post(
      `${API_URL}/confirm`,
      { reservationId },
      { headers }
    );

    if (response.status !== 200) {
      throw new Error(response.data.message || 'Failed to confirm reservation');
    }
    return response.data;
  },

    getReservationById: async (id) => {
        const response = await axios.get(`${API_URL}/${id}`, { headers: authHeader() });
        return response.data;
    },
    updateReservation: async (id, reservationData) => {
        return axios.put(`${API_URL}/${id}`, reservationData, { headers: authHeader() });
    },
    cancelReservation: async (id) => {
        return axios.put(`${API_URL}/${id}/cancel`, {}, { headers: authHeader() });
    },
    getReservationsByAgency: async (agencyId) => {
        const response = await axios.get(`${API_URL}/agency/${agencyId}`, { headers: authHeader() });
        return response.data;
    },
    getReservationsByCustomer: async (customerId) => {
        const response = await axios.get(`${API_URL}/customer/${customerId}`, { headers: authHeader() });
        return response.data;
    }
};
