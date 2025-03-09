import axios from 'axios';

const API_URL = 'http://localhost:5000/api/permissions';

const axiosWithAuth = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

export const permissionService = {
  createPermission: async (data) => {
    try {
      const response = await axiosWithAuth().post('/', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getAllPermissions: async () => {
    try {
      const response = await axiosWithAuth().get('/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getPermissionById: async (id) => {
    try {
      const response = await axiosWithAuth().get(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updatePermission: async (id, data) => {
    try {
      const response = await axiosWithAuth().put(`/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deletePermission: async (id) => {
    try {
      const response = await axiosWithAuth().delete(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};
