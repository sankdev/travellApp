import axios from 'axios';

const API_URL = 'http://localhost:5000/api/role-permissions';

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

export const rolePermissionService = {
  // Assigner une permission à un rôle
  assignPermission: async (roleId, permissionId, status = 'active') => {
    try {
      const response = await axiosWithAuth().post('/', { roleId, permissionId, status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Récupérer les permissions d'un rôle
  getPermissionsByRole: async (roleId) => {
    try {
      const response = await axiosWithAuth().get(`/${roleId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Révoquer une permission d'un rôle
  revokePermission: async (id) => {
    try {
      const response = await axiosWithAuth().delete(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  revokeRolePermission:async (roleId,permissionId) => {
    try {
      const response = await axiosWithAuth().delete(`/${roleId}/permissions/${permissionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

