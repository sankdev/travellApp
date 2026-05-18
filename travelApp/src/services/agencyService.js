import axios from 'axios';


 const API_URL='/api/agency';
const axiosWithAuth = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: `${API_URL}`,
    headers: {
      'Authorization': `Bearer ${token}`,
      
    }
  });
};

const getHeaders = (data, token) => {
  const headers = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Si c'est un FormData, on laisse le navigateur gérer Content-Type
  if (!(data instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  return { headers };
};


export const agencyService = {
    getAgencyProfile: async (id) => {
       // const token = localStorage.getItem('token');
        const userId=localStorage.getItem('userId')
        try {
            const response = await axiosWithAuth().get(`/${id}`);
            console.log('getProfil',response)
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
     updateAgencyStatus: async (agencyId, status, reason = '') => {
    const token = localStorage.getItem('token');
    
    try {
      const payload = { status };
      if (reason) {
        payload.reason = reason;
      }

      const response = await axiosWithAuth().put(
        `/agencies/${agencyId}/status`,
        payload,
        {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
      );
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Met à jour le statut avec raison détaillée
   * @param {number} agencyId - ID de l'agence
   * @param {string} status - Nouveau statut
   * @param {string} reason - Raison détaillée
   * @returns {Promise}
   */
  updateAgencyStatusWithReason: async (agencyId, status, reason) => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await axiosWithAuth().put(
        `/agencies/${agencyId}/status-with-reason`,
        { status, reason },
        {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
      );
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
       
  bulkUpdateAgencyStatus: async (agencyIds, status, reason = '') => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await axiosWithAuth().post(
        '/agencies/bulk-status-update',
        { agencyIds, status, reason },
        getHeaders({ agencyIds, status, reason }, token)
      );
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Récupère l'historique des statuts
   */
  getStatusHistory: async (agencyId, page = 1, limit = 10) => {
    const token = localStorage.getItem('token');
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await axiosWithAuth().get(
        `/agencies/${agencyId}/status-history?${params.toString()}`,
        getHeaders(null, token)
      );
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Valide un statut
   */
  isValidStatus: (status) => {
    const allowedStatuses = ['active', 'inactive', 'suspended', 'pending'];
    return allowedStatuses.includes(status);
  },

  /**
   * Configuration des statuts
   */
  getStatusConfig: () => {
    return {
      active: {
        label: 'Actif',
        color: 'green',
        badgeClass: 'bg-green-100 text-green-800 border-green-200',
        description: 'Agence active et opérationnelle'
      },
      inactive: {
        label: 'Inactif',
        color: 'gray',
        badgeClass: 'bg-gray-100 text-gray-800 border-gray-200',
        description: 'Agence temporairement inactive'
      },
      suspended: {
        label: 'Suspendu',
        color: 'red',
        badgeClass: 'bg-red-100 text-red-800 border-red-200',
        description: 'Agence suspendue pour non-conformité'
      },
      pending: {
        label: 'En attente',
        color: 'yellow',
        badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        description: 'Agence en attente de validation'
      }
    };
  },

  /**
   * Options pour les selects
   */
  getStatusOptions: () => {
    const config = agencyService.getStatusConfig();
    return Object.keys(config).map(status => ({
      value: status,
      label: config[status].label,
      color: config[status].color
    }));
  },

    updateAgencyProfile: async (data) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axiosWithAuth().put(`/profile`, data, getHeaders(data, token));
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getAgencyStats: async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axiosWithAuth().get('/api/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // CRUD Endpoints for CreationAgency
    createAgency: async (data) => {
       
        try {
            const response = await axiosWithAuth().post('/', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getAgencies: async (params) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axiosWithAuth().get('/', {
                params,
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('getProfil',response)
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
    getUserAgencies: async (params) => {
        const token = localStorage.getItem('token');
        const userId=localStorage.getItem('userId')
        try {
            const response = await axiosWithAuth().get(`/userAgency/${userId}`, {
                params,
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('getProfil',response)
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
    getAgency: async (id) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axiosWithAuth().get(`/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateAgency: async (id, data) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axiosWithAuth().put(`/${id}`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    deleteAgency: async (id) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axiosWithAuth().delete(`/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};
