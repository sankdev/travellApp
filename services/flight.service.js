const db = require('../models');
const Vol=require('../models/volModel')
const Agency=require('../models/agenceModel')
const Campaign =require('../models/compaign')
const skyscannerService = require('./skyScanner.service');

// Recherche des vols avec les agences
const searchFlightsWithAgencies = async (searchParams) => {
  try {
    // Récupérer les vols de SkyScanner
    const skyscannerFlights = await skyscannerService.searchFlights(searchParams);

    // Récupérer les agences qui desservent la destination
    const agencies = await Agency.findAll({
      include: [{
        model: Vol,
        where: {
          destination: searchParams.destinationPlace,
          status: 'active'
        },
        required: true
      }],
      where: { status: 'active' }
    });

    // Associer les données des vols avec les informations des agences
    const enrichedFlights = skyscannerFlights.Itineraries.map(itinerary => {
      const relevantAgencies = agencies.filter(agency => {
        // Associer les agences en fonction de critères comme les prix, les dates, etc.
        const agencyFlights = agency.Vols;
        return agencyFlights.some(flight => 
          flight.price <= itinerary.PricingOptions[0].Price * 1.2 // Marge de 20%
        );
      });

      return {
        ...itinerary,
        agencies: relevantAgencies.map(agency => ({
          id: agency.id,
          name: agency.name,
          rating: agency.rating,
          services: agency.services,
          contactInfo: agency.contactInfo
        }))
      };
    });

    // Ajouter des promotions spécifiques aux agences
    for (const flight of enrichedFlights) {
      for (const agency of flight.agencies) {
        const promotions = await Campaign.findAll({
          where: {
            agencyId: agency.id,
            destination: searchParams.destinationPlace,
            status: 'active',
            startAt: { [db.Sequelize.Op.lte]: new Date(searchParams.outboundDate) },
            endAt: { [db.Sequelize.Op.gte]: new Date(searchParams.outboundDate) }
          }
        });
        agency.promotions = promotions;
      }
    }

    return {
      flights: enrichedFlights,
      meta: {
        totalResults: enrichedFlights.length,
        searchParams,
        timestamp: new Date()
      }
    };
  } catch (error) {
    console.error('Flight search error:', error);
    throw new Error('Failed to search flights with agencies');
  }
};

// Détails du vol
const getFlightDetails = async (flightId, agencyId) => {
  try {
    // Récupérer les détails du vol depuis SkyScanner et notre base de données
    const [skyscannerDetails, agencyDetails] = await Promise.all([
      skyscannerService.getFlightDetails(flightId),
      db.Vol.findOne({
        where: { id: flightId, agencyId },
        include: [
          { model: db.Agency },
          { model: db.Class },
          { model: db.Company }
        ]
      })
    ]);

    return {
      ...skyscannerDetails,
      agencyDetails: {
        agency: agencyDetails.Agency,
        availableClasses: agencyDetails.Classes,
        airline: agencyDetails.Company,
        additionalServices: agencyDetails.services,
        cancellationPolicy: agencyDetails.cancellationPolicy,
        baggagePolicy: agencyDetails.baggagePolicy
      }
    };
  } catch (error) {
    console.error('Flight details error:', error);
    throw new Error('Failed to get flight details');
  }
};

// Export des fonctions
module.exports = {
  searchFlightsWithAgencies,
  getFlightDetails
};
