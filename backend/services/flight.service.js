const db = require('../models');
const Vol = db.Vol;
const Agency = db.Agency;
const Campaign = db.Campaign;
const skyscannerService = require('./skyScanner.service');
const { Op } = require("sequelize");

// 🔹 Recherche des vols SkyScanner + agences locales
const searchFlightsWithAgencies = async (searchParams) => {
  console.log("🧐 searchParams reçu :", searchParams);

  try {
    if (!searchParams.originPlace || !searchParams.destinationPlace || !searchParams.outboundDate) {
      throw new Error("🚨 searchParams est incomplet !");
    }

    console.log('🔍 Envoi de la requête à SkyScanner...', searchParams);
    const skyscannerFlights = await skyscannerService.searchFlights(searchParams);

    if (!skyscannerFlights || !skyscannerFlights.Itineraries) {
      console.warn("⚠️ Aucun vol trouvé sur SkyScanner !");
      return { flights: [], meta: { totalResults: 0, searchParams } };
    }

    console.log(`✅ ${skyscannerFlights.Itineraries.length} vols trouvés sur SkyScanner`);

    // ✅ Récupérer les agences qui desservent la destination
    const agencies = await Agency.findAll({
      include: [{
        model: Vol,
        where: {
          destinationId: searchParams.destinationPlace,
          status: 'active'
        },
        required: true
      }],
      where: { status: 'active' }
    });

    console.log(`✅ ${agencies.length} agences trouvées`);

    // 🔹 Associer les vols SkyScanner aux agences
    const enrichedFlights = skyscannerFlights.Itineraries.map(itinerary => {
      // Vérifier quelles agences proposent des vols similaires
      const relevantAgencies = agencies.filter(agency =>
        agency.Vols.some(flight => flight.prix <= itinerary.PricingOptions[0]?.Price * 1.2)
      );

      return {
        ...itinerary,
        agencies: relevantAgencies.map(agency => ({
          id: agency.id,
          name: agency.name,
          rating: agency.rating,
          address: agency.address
        }))
      };
    });

    // ✅ Récupérer toutes les promotions en une seule requête SQL
    const agencyIds = enrichedFlights.flatMap(f => f.agencies.map(a => a.id));
    const promotions = await Campaign.findAll({
      where: {
        agencyId: { [Op.in]: agencyIds },
        destinationId: searchParams.destinationPlace,
        status: 'active',
        startAt: { [Op.lte]: new Date(searchParams.outboundDate) },
        endAt: { [Op.gte]: new Date(searchParams.outboundDate) }
      }
    });

    // 🔹 Associer les promotions aux agences concernées
    enrichedFlights.forEach(flight => {
      flight.agencies.forEach(agency => {
        agency.promotions = promotions.filter(promo => promo.agencyId === agency.id);
      });
    });

    return {
      flights: enrichedFlights,
      meta: {
        totalResults: enrichedFlights.length,
        searchParams,
        timestamp: new Date()
      }
    };
  } catch (error) {
    console.error('❌ Erreur lors de la recherche de vols:', error.message);
    throw new Error('Échec de la recherche de vols avec agences');
  }
};

module.exports = {
  searchFlightsWithAgencies
};
