import axios from 'axios';
//const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://agencesvoyage.com:5001';

//const API_URL = 'http://localhost:5000/api/vols';
const API_URL='/api/vols'
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


export const volService = {
    getVols: async () => {
        const response = await axiosWithAuth().get('/');
        return response.data; // Ensure data is returned
    },
    getVolById: async (id) => {
        return axiosWithAuth().get(`/${id}`, );
    },
    getVolsByAgency: async () => {

        const response = await axiosWithAuth().get('/all' );

         console.log('responseVolByAgency',response)
        return response.data; // Ensure data is returned
    },
    createVol: async (volData) => {
        return axiosWithAuth().post('/post', volData );
    },
    updateVol: async (id, volData) => {
        return axiosWithAuth().put(`/${id}`, volData );
    },
    deleteVol: async (id) => {
        return axiosWithAuth().delete(`/${id}` );
    }
};
