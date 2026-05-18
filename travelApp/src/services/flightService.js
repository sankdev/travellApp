import axios from 'axios';

//const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://agencesvoyage.com:5001';

//const API_URL = 'http://localhost:5000/apis'; // Base URL for the API
const API_URL='/api/flights'
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

export const flightService = {
    searchFlights: async (params) => {
        //const token = localStorage.getItem('token');
        try {
            const response = await axiosWithAuth().get('/search', params);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getFlightDetails: async (id) => {
        //const token = localStorage.getItem('token');
        try {
           const response = await axiosWithAuth().get(`/${id}`);
           // const response = await axiosWithAuth().get(`/class/${classId}/flight/${flightId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    searchPlaces: async (query) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axiosWithAuth().get('/places',{ 
                params: { query }}
                );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};
