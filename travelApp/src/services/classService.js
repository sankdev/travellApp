import axios from 'axios';
//const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://agencesvoyage.com:5001';

//const API_URL = 'http://localhost:5000/api/vols';
const API_URL='/api/classes'
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


export const classeService = {
    getClasses: async () => {
        const response = await axiosWithAuth().get('/');
        return response.data; // Ensure data is returned
    },
    getClasseById: async (id) => {
        return axiosWithAuth().get(`/${id}`, );
    },
    
    createClasse: async (volData) => {
        return axiosWithAuth().post('/post', volData );
    },
    updateClasse: async (id, volData) => {
        return axiosWithAuth().put(`/${id}`, volData );
    },
    deleteClasse: async (id) => {
        return axiosWithAuth().delete(`/${id}` );
    }
};

