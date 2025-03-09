import axios from 'axios';

const API_URL = 'http://localhost:5000/apis'; // Base URL for the API

export const flightService = {
    searchFlights: async (params) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/flights/search`, {
                params,
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getFlightDetails: async (id) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/flights/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    searchPlaces: async (query) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/flights/places`, {
                params: { query },
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};
