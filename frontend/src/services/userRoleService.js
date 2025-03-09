import axios from 'axios';

const API_URL = 'http://localhost:5000/api/roleUser';

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

export const userRoleService = {
  // Assigner un rôle à un utilisateur
  assignRole: async (userId, roleId, status = 'active') => {
    try {
      const response = await axiosWithAuth().post('/', { userId, roleId, status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Récupérer les rôles d'un utilisateur
  getRolesByUser: async (userId) => {
    try {
      const response = await axiosWithAuth().get(`/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Révoquer un rôle d'un utilisateur
  revokeRole: async (id) => {
    try {
      const response = await axiosWithAuth().delete(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};
