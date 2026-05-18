const axios = require('axios');
const apiKey = process.env.SKYSCANNER_API_KEY;

const baseURL = 'https://skyscanner89.p.rapidapi.com';
const headers = {
  'x-rapidapi-host': 'skyscanner89.p.rapidapi.com',  
  'x-rapidapi-key': apiKey,
  'Content-Type': 'application/json'
};

// 🔹 Vérification des paramètres et récupération des vols
const searchFlights = async (params) => {
  try {
    if (!params.originPlace || !params.destinationPlace) {
      throw new Error('❌ Les paramètres de recherche sont incomplets.');
    } 

    console.log('🔎 Recherche des vols avec les paramètres:', params);

    const response = await axios.post(
      `${baseURL}/flights/create-session`,
      {
        country: 'FR',
        currency: 'EUR',
        locale: 'fr-FR',
        originPlace: `${params.originPlace}-sky`,
        destinationPlace: `${params.destinationPlace}-sky`,
        outboundDate: params.outboundDate,
        inboundDate: params.inboundDate || null,
        cabinClass: params.cabinClass || 'economy',
        adults: params.adults || 1,
        children: params.children || 0,
        infants: 0
      }, 
      { headers }
    );
    console.log('response Session',response)
    const sessionKey = response.data.sessionKey;
    console.log(`✅ Session SkyScanner créée: ${sessionKey}`);

    const results = await axios.get(
      `${baseURL}/flights/results/${sessionKey}?pageIndex=0&pageSize=10`,
      { headers }
    );

    return results.data;
  } catch (error) {
    console.error('❌ Erreur SkyScanner:', error.response?.data || error.message);
    throw new Error('Échec de la récupération des vols depuis SkyScanner');
  }
};

// 🔹 Récupération des lieux
const getPlaces = async (query) => {
  try {
    if (!query) {
      throw new Error('❌ Le paramètre "query" est requis.');
    }

    const response = await axios.get(
      `${baseURL}/flights/autosuggest/v1.0/FR/EUR/fr-FR/?query=${query}`,
      { headers }
    );

    return response.data.Places;
  } catch (error) {
    console.error('❌ Erreur SkyScanner Places:', error.response?.data || error.message);
    throw new Error('Échec de la récupération des lieux');
  }
};

module.exports = {
  searchFlights,
  getPlaces
};
   