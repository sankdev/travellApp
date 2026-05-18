import axios from 'axios';
//const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://agencesvoyage.com:5001';

//const API_URL = 'http://localhost:5000/api'; // Adjust the base URL as needed
const API_URL='/api/passenger'
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

export const passengerService = {
    createPassenger: async (data) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${API_URL}`, data, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
    getPassengers: async () => {
        const response = await axiosWithAuth().get('/');
        return response.data;
    },
    getPassengerById: async (id) => {
        const response = await axiosWithAuth().get(`/${id}`);
        return response.data;
    },
    updatePassenger: async (id, passengerData) => {
        return axiosWithAuth().put(`/${id}`, passengerData);
    },
    deletePassenger: async (id) => {
        return axiosWithAuth().delete(`$/{id}`);
    },
    getPassengersByReservation: async (reservationId) => {
        const response = await axiosWithAuth().get(`/reservation/${reservationId}`);
        return response.data;
    }
};
