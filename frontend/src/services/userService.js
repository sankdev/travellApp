import axios from 'axios';

const API_URL = 'http://localhost:5000/api/user';

// Configuration axios avec token
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

export const userService = {
  // Récupérer tous les utilisateurs
  getAllUsers: async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API_URL}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Récupérer un utilisateur par ID
  getUserById: async (id) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Créer un nouvel utilisateur
  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Connexion utilisateur
  login: async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/login`, credentials);
      // Vérifiez si la réponse contient 'user' et 'token'
      if (response.data?.token && response.data?.user) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('userId', JSON.stringify(response.data.user.id));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Mettre à jour un utilisateur
  updateUser: async (id, userData) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axiosWithAuth().put(`${API_URL}/${id}`, userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Supprimer un utilisateur
  deleteUser: async (id) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axiosWithAuth().delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Demande de réinitialisation de mot de passe
  requestPasswordReset: async (email) => {
    try {
      const response = await axios.post(`${API_URL}/request-reset`, { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Réinitialisation du mot de passe
  resetPassword: async (token, newPassword) => {
    try {
      const response = await axios.post(`${API_URL}/reset-password/${token}`, { password: newPassword });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Changement de mot de passe
  changePassword: async (oldPassword, newPassword) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axiosWithAuth().post(`${API_URL}/change-password`, {
        oldPassword,
        newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Déconnexion
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Récupérer l'utilisateur actuel
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};
