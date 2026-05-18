const axios = require('axios');

const apiKey = process.env.SKYSCANNER_API_KEY;
const baseURL=process.env.FLIGHT_API_BASE_URL

const FlightApiService = {

  baseURL:'https://skyscanner89.p.rapidapi.com/flights',
  headers: {
    'x-rapidapi-host': 'skyscanner89.p.rapidapi.com',
    'x-rapidapi-key': apiKey,
    'Content-Type': 'application/json'
  },

  async searchFlights(params) {
    try {
      // console.log("Sending flight search request:", params);
 
      const response = await axios.post(
        `${baseURL}/multi/list`,
        {
          country: 'FR',
          currency: 'EUR',
          locale: 'fr-FR',
          originPlace: params.originPlace ? `${params.originPlace}-sky` : '',
          destinationPlace: params.destinationPlace ? `${params.destinationPlace}-sky` : '',
          outboundDate: params.startDate,
          inboundDate: params.endDate,
          cabinClass: params.class || 'economy',
          adults: params.passengers || 1,
          maxPrice: params.maxPrice || undefined
        },
        { headers: { 'x-rapidapi-host': 'skyscanner89.p.rapidapi.com', 'x-rapidapi-key': apiKey } }
      );
      console.log('responseApiSKyScanner',response)
      return response.data || [];
      
    } catch (error) {
      console.error("Flight API Error:", error.response?.data || error.message);
      return []; // Retourne un tableau vide au lieu de faire planter l'app
    }
  },

  async getPlaces(query) {
    try {
      const response = await axios.get(`${this.baseURL}/auto-complete`, {
        params: { query },
        headers: this.headers,
      });
      console.log('placesExt',response)
      return response.data.inputSuggest || [];

    } catch (error) {
      console.error('Places API Error:', error.response?.data || error.message);
      throw new Error('Failed to fetch places data');
    }
  },

  async getFlightDetails(id) {
    try {
      const response = await axios.get(`${this.baseURL}/details`, {
        params: { id },
        headers: this.headers,
      });
      return response.data;
    } catch (error) {
      console.error('Flight Details API Error:', error.response?.data || error.message);
      throw new Error('Failed to fetch flight details');
    }
  },
};

module.exports = FlightApiService;
