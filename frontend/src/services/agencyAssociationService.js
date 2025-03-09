import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// const getToken = () => {
//   // Remplacez ceci par la méthode appropriée pour récupérer le token
//   return localStorage.getItem('token');
// };

export const agencyAssociationService = {
  createFlightAgency: async (data) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/flight-agencies`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getAllFlightAgencies: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/flight-agencies`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateFlightAgency: async (id, data) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/flight-agencies/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteFlightAgency: async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/flight-agencies/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getUserFlightAgencies: async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/flightUser-agencies`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createClassAgency: async (data) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/class-agencies`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getAllClassAgencies: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/class-agencies`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateClassAgency: async (id, data) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/class-agencies/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteClassAgency: async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/class-agencies/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getUserClassAgencies: async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/classUser-agencies`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}; 


