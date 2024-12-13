const axios = require('axios');
const apiKey = process.env.SKYSCANNER_API_KEY;

const baseURL = 'https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices';
const headers = {
  'x-rapidapi-host': 'skyscanner-skyscanner-flight-search-v1.p.rapidapi.com',
  'x-rapidapi-key': apiKey
};

// Recherche des vols
const searchFlights = async (params) => {
  try {
    const {
      originPlace,
      destinationPlace,
      outboundDate,
      inboundDate,
      cabinClass,
      adults = 1,
      children = 0
    } = params;

    // Création de la session
    const createSession = await axios.post(
      `${baseURL}/pricing/v1.0`,
      {
        country: 'FR',
        currency: 'EUR',
        locale: 'fr-FR',
        originPlace: `${originPlace}-sky`,
        destinationPlace: `${destinationPlace}-sky`,
        outboundDate,
        inboundDate,
        cabinClass,
        adults,
        children,
        infants: 0
      },
      { headers }
    );

    const sessionKey = createSession.headers.location.split('/').pop();

    // Récupération des résultats
    const results = await axios.get(
      `${baseURL}/pricing/uk2/v1.0/${sessionKey}?pageIndex=0&pageSize=10`,
      { headers }
    );

    return results.data;
  } catch (error) {
    console.error('SkyScanner API Error:', error);
    throw new Error('Failed to fetch flight data from SkyScanner');
  }
};

// Récupération des lieux
const getPlaces = async (query) => {
  try {
    const response = await axios.get(
      `${baseURL}/autosuggest/v1.0/FR/EUR/fr-FR/?query=${query}`,
      { headers }
    );
    return response.data.Places;
  } catch (error) {
    console.error('SkyScanner Places API Error:', error);
    throw new Error('Failed to fetch places from SkyScanner');
  }
};

// Export des fonctions
module.exports = {
  searchFlights,
  getPlaces
};
