import axios from 'axios';
//const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://agencesvoyage.com:5000';

//const API_URL = 'http://localhost:5000/api';

// const getToken = () => {
//   // Remplacez ceci par la méthode appropriée pour récupérer le token
//   return localStorage.getItem('token');
// };
 const API_URL='/api/agencyAssociation'
const axiosWithAuth = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: `${API_URL}`,
    headers: {
      'Authorization': `Bearer ${token}`,

    }
  });
};
export const agencyAssociationService = {
  createFlightAgency: async (data) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosWithAuth().post('/flight-agencies',data)
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getAllFlightAgenciesCode: async (params) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosWithAuth().get('/flight-agencies',{params} );
console.log('response',response)
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
,
// Récupérer tous les vols agence (avec gestion d'erreur robuste)
    getAllFlightAgencies: async (params) => {
        try {
            // Valeurs par défaut sécurisées
            const safeParams = params || {};
            const requestParams = {
                limit: safeParams.limit || 1000,
                page: safeParams.page || 1
            };
            
            console.log('🔍 Requête FlightAgencies avec params:', requestParams);
            
            const response = await axiosWithAuth().get('/flight-agencies', { 
                params: requestParams 
            });
            
            console.log('📦 FlightAgencies reçus:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur getAllFlightAgencies:', error);
            throw error.response?.data || error.message;
        }
    },
getAllFlightAgenciesCorig: async (params) => {
    try {
      const token = localStorage.getItem('token');
      
      // Assurez-vous que la limite est bien passée
      const requestParams = {
        ...params,
        limit: params.limit || 1000, // Garantir la limite
        page: params.page || 1
      };
      
      console.log('🚀 Requête API avec params:', requestParams);
      
      const response = await axiosWithAuth().get('/flight-agencies', { 
        params: requestParams 
      });
      
      console.log('📡 Réponse brute API:', response);
      console.log('📊 Données de réponse:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('💥 Erreur API:', error);
      throw error.response?.data || error.message;
    }
},
  updateFlightAgency: async (id, data) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosWithAuth().put(`/flight-agencies/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteFlightAgency: async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosWithAuth().delete(`/flight-agencies/${id}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getUserFlightAgencies: async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosWithAuth().get('/flightUser-agencies');
      console.log('userFlightAgency',response)
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createClassAgency: async (data) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosWithAuth().post('/class-agencies', data
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getAllClassAgencies: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosWithAuth().get('/class-agencies');
console.log('classAgencieAll',response)
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateClassAgency: async (id, data) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosWithAuth().put(`/class-agencies/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
   getClassByAgencyId: async (id, data) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosWithAuth().get(`/agencies/${id}/classes`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
    getClassAgencyById: async (id) => {
    try {
      const response = await axiosWithAuth().get(`/flight-agencie/${id}`);
      console.log(`📦 FlightAgency ${id}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur getFlightAgencyById ${id}:`, error);
      throw error.response?.data || error.message;
    }
  }
,
  getClassAgenciesByFlight: async (agencyVolId) => {
    try {
      const response = await axiosWithAuth().get('/by-flight', {
        params: { agencyVolId }
      });
      console.log(`📦 Classes pour le vol ${agencyVolId}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur getClassAgenciesByFlight ${agencyVolId}:`, error);
      throw error.response?.data || error.message;
    }
  },

  // Récupérer une classe spécifique pour un vol
  getClassAgencyByFlightAndClass: async (agencyVolId, classId) => {
    try {
      const response = await axiosWithAuth().get('/by-flight-and-class', {
        params: { agencyVolId, classId }
      });
      console.log(`📦 Classe ${classId} pour vol ${agencyVolId}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur getClassAgencyByFlightAndClass:`, error);
      throw error.response?.data || error.message;
    }
  },


  deleteClassAgency: async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosWithAuth().delete(`/class-agencies/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getUserClassAgencies: async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosWithAuth().get('/classUser-agencies');
  console.log('userClassAgency',response)
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}; 


