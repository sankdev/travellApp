import axios from 'axios';
//const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://agencesvoyage.com:5001';

//const API_URL = 'http://localhost:5000/api';
const API_URL='/api/userAgency'
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
export const userAgencyService = {
  assignUserToAgency: async (data) => {
    try {
  //    const token = localStorage.getItem('token');
      const response = await axiosWithAuth().post('/assign', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  revokeUserFromAgency: async (data) => {
    try {
      //const token = localStorage.getItem('token');
      const response = await axiosWithAuth().post('/revoke', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getUserAgencies: async (userId) => {
    try {
      //const token = localStorage.getItem('token');
      const response = await axiosWithAuth().get(`/user/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getAgencyUsers: async (agencyId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosWithAuth().get(`/agency/${agencyId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteUserAgency: async (userId, agencyId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosWithAuth().delete(`/user-agencies/${userId}/${agencyId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
  
};
