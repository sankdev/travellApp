import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Adjust the base URL as needed

export const passengerService = {
    createPassenger: async (data) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${API_URL}/passenger`, data, {
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
        const response = await axios.get(`${API_URL}/passenger`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        return response.data;
    },
    getPassengerById: async (id) => {
        const response = await axios.get(`${API_URL}/passenger/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        return response.data;
    },
    updatePassenger: async (id, passengerData) => {
        return axios.put(`${API_URL}/passenger/${id}`, passengerData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    },
    deletePassenger: async (id) => {
        return axios.delete(`${API_URL}/passenger/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    },
    getPassengersByReservation: async (reservationId) => {
        const response = await axios.get(`${API_URL}/passenger/reservation/${reservationId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        return response.data;
    }
};
