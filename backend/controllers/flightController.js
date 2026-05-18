const Vol = require('../models/volModel');
const Agency = require('../models/agenceModel');
const Destination = require('../models/destinationModel');
const flightApiService = require('../services/flightApiService');
const Company=require('../models/Company');
const Reservation=require('../models/booking');
const { Op } = require('sequelize');
const AgencyFlight=require('../models/flightAgency');
//const AgencyClass=require('../models/agencyClass')
const ClassAgency=require('../models/agencyClass');
const travelClass=require('../models/classModel');

// exports.searchFlights = async (req, res) => {

//   try {
//     const {
//       originPlace,
//       destinationPlace,
//       startDate,
//       endDate,
//       passengers,
//       class: cabinClass,
//       maxPrice
//     } = req.query;

//     // 1. Search local flights
//     const localWhereClause = {
//       status: 'active'
//     };
 
//     if (maxPrice) localWhereClause.prix = { [Op.lte]: maxPrice };
//     if (startDate) {
//       localWhereClause.startAt = {
//         [Op.gte]: new Date(startDate)
//       };
//     }
//     if (endDate) {
//       localWhereClause.endAt = {
//         [Op.lte]: new Date(endDate)
//       };
//     }

//     // 2. Fetch data in parallel
//     const [localFlights, externalFlights] = await Promise.all([
//       Vol.findAndCountAll({
//         where: localWhereClause,
//         include: [
//           { model: Agency, as: 'volAgency', attributes: ['id', 'name', 'rating', 'logo'] },
//           // { model: Destination, as: 'destination', attributes: ['id', 'name', 'city', 'country'] }
//         ],
//         order: [['prix', 'ASC']]
//       }),
//       flightApiService.searchFlights({
//         originPlace,
//         destinationPlace,
//         startDate,
//         endDate,
//         passengers,
//         class: cabinClass
//       }).catch(err => {
//         console.error("Erreur API externe:", err);
//         return { Itineraries: [] }; // Retourner un tableau vide pour éviter que la requête échoue
//       })
//     ]);
    

//     // 3. Process external flights
//    // Ajoute une vérification pour éviter l'erreur sur "map"
// const processedExternalFlights = Array.isArray(externalFlights?.Itineraries) ? 
// externalFlights.Itineraries.map(itinerary => ({
//   id: `ext-${itinerary.OutboundLegId}`,
//   name: `${itinerary.OutboundLeg.Carriers?.[0]?.Name || "Unknown Airline"} ${itinerary.OutboundLeg.FlightNumbers?.[0] || "Unknown Flight"}`,
//   prix: itinerary.PricingOptions?.[0]?.Price || 0,
//   startAt: itinerary.OutboundLeg.DepartureDateTime || null,
//   endAt: itinerary.OutboundLeg.ArrivalDateTime || null,
//   status: 'active',
//   external: true,
//   agency: {
//     name: itinerary.PricingOptions?.[0]?.Agents?.[0]?.Name || "Unknown Agent",
//     rating: itinerary.PricingOptions?.[0]?.Agents?.[0]?.Rating || 0
//   }
// })) : [];


//     // 4. Find relevant local agencies for external flights
//     const destinationIds = new Set(localFlights.rows.map(f => f.destinationId));
//     const agencyIds = localFlights.rows.map(f => f.agencyId).filter(id => id);
// const relevantAgencies = agencyIds.length
//   ? await Agency.findAll({
//       where: { status: 'active', id: { [Op.in]: agencyIds } },
//       attributes: ['id', 'name', 'rating', 'logo']
//     })
//   : [];


//     // 5. Combine and enrich results
//     const combinedFlights = [
//       ...localFlights.rows,
//       ...processedExternalFlights.map(flight => ({
//         ...flight,
//         localAgencies: relevantAgencies.filter(agency => 
//           agency.rating >= 4.0 && flight.prix <= agency.maxFlightPrice
//         )
//       }))
//     ];

//     // 6. Get aggregated data for filters
//     const [minFlightPrice, maxFlightPrice] = await Promise.all([
//       Vol.min('prix', { where: localWhereClause }),
//       Vol.max('prix', { where: localWhereClause })
//     ]);
    

//     const destinations = await Destination.findAll({
//       attributes: ['id', 'name', 'city', 'country'],
//       where: {
//         id: { [Op.in]: Array.from(destinationIds) }
//       }
//     });
// const localFlight = await Vol.findAndCountAll({ where: localWhereClause});
// console.log('LocalFlight',localFlight)

//     res.json({
//       flights: combinedFlights,
//       totalCount: combinedFlights.length,
//       page: 1,
//       pageSize: combinedFlights.length,
//      filters: {
//   minPrice: Math.min(minFlightPrice, ...processedExternalFlights.map(f => f.prix)),
//   maxPrice: Math.max(maxFlightPrice, ...processedExternalFlights.map(f => f.prix)),
//   destinations,
//   agencies: relevantAgencies
// }
// ,
//       meta: {
//         localFlights: localFlights.count,
//         externalFlights: processedExternalFlights.length,
//         timestamp: new Date()
//       }
        
//     });
//     console.log('externalFlight',externalFlights);
//   } catch (error) {
//     console.error('Flight search error:', error);
//     res.status(500).json({
//       error: 'Failed to search flights',
//       details: error.message
//     });
//   }
// };
// exports.searchFlights = async (req, res) => {
//   try {
//     const {
//       originPlace,
//       destinationPlace,
//       startDate,
//       endDate,
//       passengers,
//       class: cabinClass,
//       maxPrice,
//       page = 1,
//       pageSize = 10
//     } = req.query;
//  console.log('originPlace',originPlace)
//     // 1. Recherche des vols locaux avec les conditions
//     const localWhereClause = { status: 'active' };
//     // if (maxPrice) localWhereClause.prix = { [Op.lte]: maxPrice };
//     // if (startDate) localWhereClause.startAt = { [Op.gte]: new Date(startDate) };
//     // if (endDate) localWhereClause.endAt = { [Op.lte]: new Date(endDate) }; 

//     // 2. Requête des vols locaux avec pagination
//     const localFlights = await Vol.findAndCountAll({
//       where: localWhereClause,
//       include: [
//         { model: Agency, as: 'volAgency', attributes: ['id', 'name', 'rating', 'logo'] },
//         { model: Destination, as: 'destination', attributes: ['id', 'name', 'city', 'country'] }
//       ],
//       order: [['prix', 'ASC']],
//       limit: pageSize,
//       offset: (page - 1) * pageSize,
//     });

//     console.log('LocalFlight', localFlights);

//     // 3. Requête de l'API externe (sans bloquer le processus)
//     let externalFlights = [];
//     try {
//       const apiResponse = await flightApiService.searchFlights({
//         originPlace,
//         destinationPlace,
//         startDate,
//         endDate,
//         passengers,
//         class: cabinClass
//       });
//       externalFlights = Array.isArray(apiResponse?.Itineraries) ? apiResponse.Itineraries.map(itinerary => ({
//         id: `ext-${itinerary.OutboundLegId}`,
//         name: `${itinerary.OutboundLeg.Carriers?.[0]?.Name || "Unknown Airline"} ${itinerary.OutboundLeg.FlightNumbers?.[0] || "Unknown Flight"}`,
//         prix: itinerary.PricingOptions?.[0]?.Price || 0,
//         startAt: itinerary.OutboundLeg.DepartureDateTime || null,
//         endAt: itinerary.OutboundLeg.ArrivalDateTime || null,
//         status: 'active',
//         external: true,
//         agency: {
//           name: itinerary.PricingOptions?.[0]?.Agents?.[0]?.Name || "Unknown Agent",
//           rating: itinerary.PricingOptions?.[0]?.Agents?.[0]?.Rating || 0
//         }
//       })) : [];
//     } catch (error) {
//       console.error("Erreur API externe:", error.message);
//     }

//     console.log("externalFlight", externalFlights);

//     // 4. Regroupement des résultats
//     const combinedFlights = [...localFlights.rows, ...externalFlights];

//     // 5. Récupération des agences locales associées
//     const agencyIds = [...new Set(localFlights.rows.map(f => f.agencyId))];
//     const relevantAgencies = agencyIds.length
//       ? await Agency.findAll({
//           where: { status: 'active', id: { [Op.in]: agencyIds } },
//           attributes: ['id', 'name', 'rating', 'logo']
//         })
//       : [];

//     // 6. Calcul des filtres
//     const [minFlightPrice, maxFlightPrice] = await Promise.all([
//       Vol.min('prix', { where: localWhereClause }),
//       Vol.max('prix', { where: localWhereClause })
//     ]);

//     const destinations = await Destination.findAll({
//       attributes: ['id', 'name', 'city', 'country'],
//       where: {
//         id: { [Op.in]: localFlights.rows.map(f => f.destinationId) }
//       }
//     });

//     // 7. Envoi de la réponse
//     res.json({
//       flights: combinedFlights,
//       totalCount: combinedFlights.length,
//       page: parseInt(page),
//       pageSize: parseInt(pageSize),
//       filters: {
//         minPrice: Math.min(minFlightPrice || 0, ...externalFlights.map(f => f.prix)),
//         maxPrice: Math.max(maxFlightPrice || 0, ...externalFlights.map(f => f.prix)),
//         destinations,
//         agencies: relevantAgencies
//       },
//       meta: {
//         localFlights: localFlights.count,
//         externalFlights: externalFlights.length,
//         timestamp: new Date()
//       }
//     });

//   } catch (error) {
//     console.error('Flight search error:', error);
//     res.status(500).json({
//       error: 'Failed to search flights',
//       details: error.message
//     });

// exports.searchFlights = async (req, res) => {
//   try {
//     const {
//       originPlace,
//       destinationPlace,
//       startDate,
//       endDate,
//       passengers,
//       class: cabinClass,
//       maxPrice,
//       page = 1,
//       pageSize = 10
//     } = req.query;

//     // 1. Conditions de recherche pour les vols locaux
//     const localWhereClause = {
//       status: 'active',
//       ...(originPlace && { originPlace }),
//       ...(destinationPlace && { destinationPlace }),
//       ...(startDate && { startAt: { [Op.gte]: startDate } }),
//       ...(endDate && { endAt: { [Op.lte]: endDate } }),
//       ...(maxPrice && { prix: { [Op.lte]: maxPrice } })
//     };

//     // 2. Recherche des vols locaux avec pagination et relations
//     const localFlights = await AgencyFlight.findAndCountAll({
//       where: localWhereClause,
//       include: [
//         { model: Agency, as: 'agency', attributes: ['id', 'name', 'rating', 'logo'] },
//         { model: Reservation, as: 'reservation', attributes: ['id', 'tripType'] },
//         {
//           model: Vol,
//           as: 'flight',
//           include: { model: Destination, as: 'destination', attributes: ['id', 'name', 'city', 'country'] }
//         }
//       ],
//       order: [['prix', 'ASC']],
//       limit: pageSize,
//       offset: (page - 1) * pageSize,
//       distinct: true
//     });

//     // 3. Requête de l'API externe (sans bloquer l'exécution)
//     let externalFlights = [];
//     try {
//       const apiResponse = await flightApiService.searchFlights({
//         originPlace,
//         destinationPlace,
//         startDate,
//         endDate,
//         passengers,
//         class: cabinClass
//       });

//       externalFlights = Array.isArray(apiResponse?.Itineraries)
//         ? apiResponse.Itineraries.map(itinerary => ({
//             id: `ext-${itinerary.OutboundLegId}`,
//             name: `${itinerary.OutboundLeg.Carriers?.[0]?.Name || "Unknown Airline"} ${itinerary.OutboundLeg.FlightNumbers?.[0] || "Unknown Flight"}`,
//             prix: itinerary.PricingOptions?.[0]?.Price || 0,
//             startAt: itinerary.OutboundLeg.DepartureDateTime || null,
//             endAt: itinerary.OutboundLeg.ArrivalDateTime || null,
//             status: 'active',
//             external: true,
//             agency: {
//               name: itinerary.PricingOptions?.[0]?.Agents?.[0]?.Name || "Unknown Agent",
//               rating: itinerary.PricingOptions?.[0]?.Agents?.[0]?.Rating || 0
//             }
//           }))
//         : [];
//     } catch (error) {
//       console.error("Erreur API externe:", error.message);
//     }

//     // 4. Traitement des vols locaux pour extraire les agences et destinations
//     const localFlightsWithDetails = localFlights.rows.map(flight => {
//       const flightData = flight.get({ plain: true });
//       return {
//         ...flightData,
//         agency: flight.agency ? {
//           id: flight.agency.id,
//           name: flight.agency.name,
//           rating: flight.agency.rating,
//           logo: flight.agency.logo
//         } : null,
//         reservations: flightData.reservation || [],
//         destination: flight.flight?.destination || null
//       };
//     });

//     const combinedFlights = [...localFlightsWithDetails, ...externalFlights];

//     // 5. Récupération des agences locales associées
//     const relevantAgencies = await Agency.findAll({
//       where: { status: 'active', id: { [Op.in]: localFlights.rows.map(f => f.agency?.id).filter(Boolean) } },
//       attributes: ['id', 'name', 'rating', 'logo']
//     });

//     // 6. Calcul des filtres
//     const [minFlightPrice, maxFlightPrice] = await Promise.all([
//       AgencyFlight.min('prix', { where: localWhereClause }),
//       AgencyFlight.max('prix', { where: localWhereClause })
//     ]);

//     const destinations = await Destination.findAll({
//       attributes: ['id', 'name', 'city', 'country'],
//       where: {
//         id: { [Op.in]: localFlights.rows.flatMap(f => f.flight?.destination?.id).filter(Boolean) }
//       }
//     });

//     // 7. Réponse JSON
//     res.json({
//       flights: combinedFlights,
//       totalCount: combinedFlights.length,
//       page: parseInt(page),
//       pageSize: parseInt(pageSize),
//       filters: {
//         minPrice: Math.min(minFlightPrice || 0, ...externalFlights.map(f => f.prix)),
//         maxPrice: Math.max(maxFlightPrice || 0, ...externalFlights.map(f => f.prix)),
//         destinations,
//         agencies: relevantAgencies
//       },
//       meta: {
//         localFlights: localFlights.count,
//         externalFlights: externalFlights.length,
//         timestamp: new Date()
//       }
//     });

//   } catch (error) {
//     console.error('Flight search error:', error);
//     res.status(500).json({
//       error: 'Failed to search flights',
//       details: error.message
//     });
//   }
// };


    // Construction de la requête principale avec l'inclusion de Vol
    
          // where: {localWhereClause
          //   // ...(originPlace && { originId: originPlace }),
          //   // ...(destinationPlace && { destinationId: destinationPlace }),
          //   // ...(startDate && { startAt: { [Op.gte]: startDate } }),
          //   // ...(endDate && { endAt: { [Op.lte]: endDate } })
          // },


exports.searchFlights = async (req, res) => {
  try {
    const {
      originId,
      destinationId,
      startDate,
      endDate,
      passengers,
      class: cabinClass,
      page = 1,
      pageSize = 10
    } = req.query;

    console.log('🔍 Données reçues:', { originId, destinationId, startDate, endDate, passengers, cabinClass, page, pageSize });

    // 1️⃣ Construction de la clause WHERE pour les vols
    const flightWhereClause = { status: 'active' };
    
    // Filtre sur les agences qui ont des ClassAgency
    const agenciesWithClasses = await ClassAgency.findAll({
      attributes: [],
      include: [{
        model: AgencyFlight,
        as: 'agencyVol',
        attributes: ['agencyId']
      }],
      group: ['agencyVol.agencyId'],
      raw: true
    });

    const agencyIds = agenciesWithClasses.map(item => item['agencyVol.agencyId']).filter(Boolean);
    
    if (agencyIds.length > 0) {
      flightWhereClause.agencyId = { [Op.in]: agencyIds };
    }

    // 2️⃣ Construction des filtres pour le Vol
    const volWhereClause = {};
    
    if (originId) {
      volWhereClause.originId = originId;
    }
    
    if (destinationId) {
      volWhereClause.destinationId = destinationId;
    }

    // 3️⃣ Inclusion du Vol avec ses relations
    const volInclude = {
      model: Vol,
      as: 'flight',
      required: true,
      where: volWhereClause,
      include: [
        {
          model: Destination,
          as: "origin",
          attributes: ["id", "name", "city", "country"]
        },
        {
          model: Destination,
          as: "destination",
          attributes: ["id", "name", "city", "country"]
        },
        {
          model: Company,
          as: 'companyVol',
          attributes: ["id", "name"]
        }
      ]
    };

    // 4️⃣ Filtre sur la date de départ
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(start);
      nextDay.setDate(nextDay.getDate() + 1);
      
      flightWhereClause.departureTime = {
        [Op.gte]: start,
        [Op.lt]: nextDay
      };
    }

    // 5️⃣ Compter le nombre TOTAL de vols correspondant aux critères
    const totalCount = await AgencyFlight.count({
      where: flightWhereClause,
      include: [volInclude]
    });

    console.log(`📊 Total vols correspondant aux critères: ${totalCount}`);

    // 6️⃣ Récupérer les vols avec pagination
    const localFlights = await AgencyFlight.findAll({
      where: flightWhereClause,
      include: [
        volInclude,
        {
          model: Agency,
          as: 'agency',
          required: true,
          attributes: ['id', 'name', 'rating', 'logo', 'location', 'address']
        },
        {
          model: ClassAgency,
          as: 'agencyClasses',
          required: true,  // Seulement les vols qui ont des classes
          include: [
            {
              model: travelClass,
              as: 'class',
              attributes: ['id', 'name' ]
            }
          ]
        },
        {
          model: Reservation,
          as: 'reservation',
          attributes: ['id', 'tripType'],
          required: false
        }
      ],
      order: [
        ['departureTime', 'ASC']
      ],
      limit: parseInt(pageSize) || 10,
      offset: ((parseInt(page) || 1) - 1) * (parseInt(pageSize) || 10),
      distinct: true
    });

    console.log(`📦 ${localFlights.length} vols affichés (page ${page})`);

    // 7️⃣ Filtrer par classe si spécifié
    let filteredFlights = localFlights;
    if (cabinClass) {
      filteredFlights = localFlights.filter(flight => 
        flight.agencyClasses.some(c => 
          c.class?.name?.toLowerCase().includes(cabinClass.toLowerCase())
        )
      );
    }

    // 8️⃣ Récupérer les agences uniques pour les filtres
    const uniqueAgencyIds = [...new Set(localFlights.map(f => f.agency?.id).filter(Boolean))];
    const agencies = await Agency.findAll({
      where: { id: { [Op.in]: uniqueAgencyIds } },
      attributes: ['id', 'name', 'rating', 'logo'],
      order: [['name', 'ASC']]
    });

    // 9️⃣ Récupérer les destinations uniques
    const destinationIds = [...new Set(localFlights.map(f => f.flight?.destinationId).filter(Boolean))];
    const destinations = await Destination.findAll({
      attributes: ['id', 'name', 'city', 'country'],
      where: { id: { [Op.in]: destinationIds } },
      order: [['name', 'ASC']]
    });

    // 🔟 Calculer les prix min et max
    let minPrice = Infinity;
    let maxPrice = 0;
    
    filteredFlights.forEach(flight => {
      if (flight.agencyClasses && flight.agencyClasses.length > 0) {
        const prices = flight.agencyClasses.map(c => parseFloat(c.price));
        minPrice = Math.min(minPrice, ...prices);
        maxPrice = Math.max(maxPrice, ...prices);
      }
    });

    minPrice = minPrice === Infinity ? 0 : minPrice;

    // 1️⃣1️⃣ Formater les résultats
    // Dans searchFlights, au moment de formater
// Dans searchFlights, au moment de formater
const formattedFlights = filteredFlights.map(flight => {
  const flightData = flight.get({ plain: true });
  
  // ⚠️ ICI LA CORRECTION : 
  // flightData.id = ID de ClassAgency
  // flightData.agencyVolId = ID du FlightAgency
  
  const classes = (flightData.agencyClasses || []).map(classItem => {
    // classItem = une autre ClassAgency pour le même vol
    return {
      // ✅ L'ID de CETTE classe (ClassAgency)
      id: classItem.id,                    // ID de ClassAgency
      classId: classItem.classId,           // ID de la classe de voyage
      className: classItem.class?.name || 'Standard',
      price: parseFloat(classItem.price),
      priceMultiplier: classItem.priceMultiplier,
      status: classItem.status
    };
  }).sort((a, b) => a.price - b.price);

  // Prix par défaut (le moins cher)
  const defaultPrice = classes.length > 0 ? classes[0].price : null;

  return {
    // ✅ Informations claires
    classAgencyId: flightData.id,           // L'ID de CETTE ClassAgency
    flightAgencyId: flightData.agencyVolId, // L'ID du FlightAgency associé
    
    // Informations du vol
    departureTime: flightData.departureTime,
    arrivalTime: flightData.arrivalTime,
    status: flightData.status,
    price: defaultPrice,
    
    // Vol
    flight: flightData.flight ? {
      id: flightData.flight.id,              // ID du Vol
      name: flightData.flight.name,
      origin: flightData.flight.origin || null,
      destination: flightData.flight.destination || null,
      company: flightData.flight.companyVol || null
    } : null,
    
    // Agence
    agency: flightData.agency ? {
      id: flightData.agency.id,
      name: flightData.agency.name,
      rating: flightData.agency.rating,
      logo: flightData.agency.logo,
      address: flightData.agency.address,
      location: flightData.agency.location
    } : null,
    
    // ✅ TOUTES les classes disponibles pour CE vol
    classes: classes,
    hasClasses: classes.length > 0,
    minPrice: classes[0]?.price || null,
    maxPrice: classes[classes.length - 1]?.price || null,
    availableClasses: classes.length
  };
});

    // 1️⃣2️⃣ Réponse
    res.json({
      success: true,
      data: {
        flights: formattedFlights,
        pagination: {
          currentPage: parseInt(page) || 1,
          pageSize: parseInt(pageSize) || 10,
          totalItems: totalCount,
          totalPages: Math.ceil(totalCount / (parseInt(pageSize) || 10))
        },
        filters: {
          minPrice,
          maxPrice,
          destinations,
          agencies
        },
        searchCriteria: {
          originId,
          destinationId,
          startDate,
          endDate,
          passengers,
          class: cabinClass
        },
        metadata: {
          totalAgenciesWithClasses: agencies.length,
          stats: {
            totalFlights: totalCount,
            flightsInPage: formattedFlights.length
          }
        }
      }
    });

  } catch (error) {
    console.error('❌ Flight search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search flights',
      details: error.message
    });
  }
};

exports.searchFlightsGrand = async (req, res) => {
  try {
    const {
      originPlace,
      destinationPlace,
      startDate,
      endDate,
      passengers,
      class: cabinClass,
      maxPrice,
      page = 1,
      pageSize = 10
    } = req.query;

    console.log('🔍 req.query', req.query);

    const start = startDate ? new Date(startDate) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Construction de la clause WHERE pour les vols
    const flightWhereClause = { status: 'active' };
    
    if (start) {
      flightWhereClause.departureTime = {
        [Op.gte]: start
      };
    }

    // Inclusion du Vol avec ses relations
    const volInclude = {
      model: Vol,
      as: 'flight',
      required: true,
      include: [
        {
          model: Destination,
          as: "origin",
          attributes: ["id", "name", "city", "country"],
          where: originPlace ? {
            [Op.or]: [
              { name: { [Op.like]: `%${originPlace}%` } },
              { city: { [Op.like]: `%${originPlace}%` } },
              { country: { [Op.like]: `%${originPlace}%` } }
            ]
          } : undefined
        },
        {
          model: Destination,
          as: "destination",
          attributes: ["id", "name", "city", "country"],
          where: destinationPlace ? {
            [Op.or]: [
              { name: { [Op.like]: `%${destinationPlace}%` } },
              { city: { [Op.like]: `%${destinationPlace}%` } },
              { country: { [Op.like]: `%${destinationPlace}%` } }
            ]
          } : undefined
        },
        {
          model: Company,
          as: 'companyVol',
          attributes: ["id", "name"]
        }
      ]
    };

    // Recherche des vols avec leurs classes
    const localFlights = await AgencyFlight.findAndCountAll({
      where: flightWhereClause,
      include: [
        volInclude,
        {
          model: Agency,
          as: 'agency',
          attributes: ['id', 'name', 'rating', 'logo', 'location', 'address'],
          where: { status: 'active' }
        },
        {
          model: ClassAgency,
          as: 'agencyClasses',
          required: false,  // IMPORTANT: false pour inclure les vols sans classes
          include: [
            {
              model: Class,
              as: 'class',
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: Reservation,
          as: 'reservation',
          attributes: ['id', 'tripType'],
          required: false
        }
      ],
      order: [
        ['departureTime', 'ASC'],
        [{ model: ClassAgency, as: 'agencyClasses' }, 'price', 'ASC']
      ],
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize),
      distinct: true
    });

    console.log(`📦 ${localFlights.rows.length} vols trouvés`);
    
    // Statistiques sur les classes
    const volsWithClasses = localFlights.rows.filter(f => 
      f.agencyClasses && f.agencyClasses.length > 0
    ).length;
    console.log(`📊 ${volsWithClasses}/${localFlights.rows.length} vols ont des classes`);

    // Filtrer les vols par prix maximum (si demandé)
    let filteredRows = localFlights.rows;
    if (maxPrice) {
      filteredRows = localFlights.rows.filter(flight => {
        // Si le vol a des classes, prendre le prix minimum des classes
        if (flight.agencyClasses && flight.agencyClasses.length > 0) {
          const minClassPrice = Math.min(...flight.agencyClasses.map(c => parseFloat(c.price)));
          return minClassPrice <= parseFloat(maxPrice);
        }
        // Sinon, garder le vol (on ne peut pas filtrer par prix)
        return true;
      });
    }

    // Récupérer les agences uniques
    const relevantAgencies = await Agency.findAll({
      where: {
        status: 'active',
        id: { [Op.in]: filteredRows.map(f => f.agency?.id).filter(Boolean) }
      },
      attributes: ['id', 'name', 'rating', 'logo']
    });

    // Calculer les prix min et max GLOBAUX
    let minFlightPrice = Infinity;
    let maxFlightPrice = 0;
    
    // Prix depuis ClassAgency
    const classPrices = await ClassAgency.findAll({
      attributes: [
        [sequelize.fn('MIN', sequelize.col('price')), 'minPrice'],
        [sequelize.fn('MAX', sequelize.col('price')), 'maxPrice']
      ],
      raw: true
    });
    
    if (classPrices[0]?.minPrice) {
      minFlightPrice = parseFloat(classPrices[0].minPrice);
      maxFlightPrice = parseFloat(classPrices[0].maxPrice);
    }

    // Récupérer les destinations uniques
    const destinations = await Destination.findAll({
      attributes: ['id', 'name', 'city', 'country'],
      where: {
        id: { [Op.in]: filteredRows.map(f => f.flight?.destinationId).filter(Boolean) }
      }
    });

    // FORMATTER LES RÉSULTATS - Structure préservée avec classes en plus
    const localFlightsFormatted = filteredRows.map(flight => {
      const flightData = flight.get({ plain: true });
      
      // Formater les classes disponibles
      const classes = (flightData.agencyClasses || []).map(classItem => ({
        id: classItem.id,
        classId: classItem.classId,
        className: classItem.class?.name || 'Standard',
        
        price: parseFloat(classItem.price),
        priceMultiplier: classItem.priceMultiplier,
        status: classItem.status
      })).sort((a, b) => a.price - b.price);

      // Structure ORIGINALE préservée
      return {
        id: flightData.id,
        departureTime: flightData.departureTime,
        arrivalTime: flightData.arrivalTime,
        status: flightData.status,
        // Structure vol originale
        vol: flightData.flight ? {
          id: flightData.flight.id,
          name: flightData.flight.name,
          origin: flightData.flight.origin || null,
          destination: flightData.flight.destination || null,
          company: flightData.flight.companyVol || null
        } : null,
        // Structure agence originale
        agency: flightData.agency ? {
          id: flightData.agency.id,
          name: flightData.agency.name,
          rating: flightData.agency.rating,
          logo: flightData.agency.logo,
          address: flightData.agency.address,
          location: flightData.agency.location
        } : null,
        // Informations originales supplémentaires
        reservations: flightData.reservation || [],
        // NOUVEAU: informations sur les classes
        classes: classes,
        hasClasses: classes.length > 0,
        minPrice: classes.length > 0 ? classes[0].price : null,
        maxPrice: classes.length > 0 ? classes[classes.length - 1].price : null,
        availableClasses: classes.length
      };
    });

    // Filtrer par classe spécifique si demandé (optionnel)
    let finalFlights = localFlightsFormatted;
    if (cabinClass) {
      finalFlights = localFlightsFormatted.filter(flight => 
        flight.classes.some(c => 
          c.className.toLowerCase().includes(cabinClass.toLowerCase())
        )
      );
    }

    res.json({
      flights: finalFlights,
      totalCount: finalFlights.length,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      filters: {
        minPrice: minFlightPrice,
        maxPrice: maxFlightPrice,
        destinations,
        agencies: relevantAgencies
      },
      meta: {
        totalFlights: localFlights.count,
        filteredFlights: finalFlights.length,
        flightsWithClasses: finalFlights.filter(f => f.hasClasses).length,
        flightsWithoutClasses: finalFlights.filter(f => !f.hasClasses).length,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('❌ Flight search error:', error);
    console.log(error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to search flights',
      details: error.message
    });
  }
};

 exports.searchFlights3 = async (req, res) => {
  try {
    const {
      originPlace,
      destinationPlace,
      startDate,
      endDate,
      passengers,
      class: cabinClass,
      maxPrice,
      page = 1,
      pageSize = 100
    } = req.query;

    console.log('🔍 req.query', req.query);

    const start = startDate ? new Date(startDate) : null;

    // Construction de la clause WHERE pour les vols
    const flightWhereClause = { status: 'active' };
    
    if (start && !isNaN(start)) {
      flightWhereClause.departureTime = { [Op.gte]: start };
    }

    // Inclusion du Vol avec ses relations
    const volInclude = {
      model: Vol,
      as: 'flight',
      required: true,
      include: [
        {
          model: Destination,
          as: "origin",
          attributes: ["id", "name", "city", "country"],
          where: originPlace ? {
            [Op.or]: [
              { name: { [Op.like]: `%${originPlace}%` } },
              { city: { [Op.like]: `%${originPlace}%` } },
              { country: { [Op.like]: `%${originPlace}%` } }
            ]
          } : undefined
        },
        {
          model: Destination,
          as: "destination",
          attributes: ["id", "name", "city", "country"],
          where: destinationPlace ? {
            [Op.or]: [
              { name: { [Op.like]: `%${destinationPlace}%` } },
              { city: { [Op.like]: `%${destinationPlace}%` } },
              { country: { [Op.like]: `%${destinationPlace}%` } }
            ]
          } : undefined
        },
        {
          model: Company,
          as: 'companyVol',
          attributes: ["id", "name"]
        }
      ]
    };

    // RECHERCHE PRINCIPALE - TOUS LES VOLS DISPONIBLES
    const localFlights = await AgencyFlight.findAndCountAll({
      where: flightWhereClause,
      include: [
        volInclude,
        {
          model: Agency,
          as: 'agency',
          attributes: ['id', 'name', 'rating', 'logo', 'location', 'address'],
          where: { status: 'active' }
        },
        {
          model: ClassAgency,
          as: 'agencyClasses',
          required: false,  // false = inclut les vols même sans classes
          include: [
            {
              model: Class,
              as: 'class',
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: Reservation,
          as: 'reservation',
          attributes: ['id', 'tripType'],
          required: false
        }
      ],

      limit: parseInt(pageSize) || 100,
      offset: ((parseInt(page) || 1) - 1) * (parseInt(pageSize) || 10),
      distinct: true
    });

    console.log(`📦 ${localFlights.rows.length} vols trouvés (page ${page})`);
    
    // Statistiques sur les classes
    const volsWithClasses = localFlights.rows.filter(f => 
      f.agencyClasses && f.agencyClasses.length > 0
    ).length;
    
    console.log(`📊 Statistiques: ${volsWithClasses}/${localFlights.rows.length} vols ont des classes`);

    // Récupérer les agences uniques pour les filtres
    const agencyIds = [...new Set(localFlights.rows
      .map(f => f.agency?.id)
      .filter(Boolean))];
    
    const relevantAgencies = await Agency.findAll({
      where: {
        status: 'active',
        id: { [Op.in]: agencyIds }
      },
      attributes: ['id', 'name', 'rating', 'logo']
    });

    // Calculer les prix min et max GLOBAUX (pour tous les vols)
    let minGlobalPrice = Infinity;
    let maxGlobalPrice = 0;
    
    // Prix depuis ClassAgency
    const classPrices = await ClassAgency.findAll({
      attributes: [
        [Sequelize.fn('MIN', Sequelize.col('price')), 'minPrice'],
        [Sequelize.fn('MAX', Sequelize.col('price')), 'maxPrice']
      ],
      raw: true
    });
    
    if (classPrices[0]?.minPrice) {
      minGlobalPrice = parseFloat(classPrices[0].minPrice);
      maxGlobalPrice = parseFloat(classPrices[0].maxPrice);
    }

    // Prix depuis FlightAgency (fallback)
    const flightPrices = await AgencyFlight.findAll({
      attributes: [
        [Sequelize.fn('MIN', Sequelize.col('price')), 'minPrice'],
        [Sequelize.fn('MAX', Sequelize.col('price')), 'maxPrice']
      ],
      where: flightWhereClause,
      raw: true
    });

    if (flightPrices[0]?.minPrice) {
      minGlobalPrice = Math.min(minGlobalPrice, parseFloat(flightPrices[0].minPrice));
      maxGlobalPrice = Math.max(maxGlobalPrice, parseFloat(flightPrices[0].maxPrice));
    }

    minGlobalPrice = minGlobalPrice === Infinity ? 0 : minGlobalPrice;

    // Récupérer les destinations uniques pour les filtres
    const destinationIds = [...new Set(localFlights.rows
      .map(f => f.flight?.destinationId)
      .filter(Boolean))];
    
    const destinations = await Destination.findAll({
      attributes: ['id', 'name', 'city', 'country'],
      where: { id: { [Op.in]: destinationIds } }
    });

    // FORMATTER LES RÉSULTATS - TOUS LES VOLS
    const localFlightsFormatted = localFlights.rows.map(flight => {
      const flightData = flight.get({ plain: true });
      
      // Formater les classes disponibles
      const classes = (flightData.agencyClasses || []).map(classItem => ({
        id: classItem.id,
        classId: classItem.classId,
        className: classItem.class?.name || 'Standard',
        
        price: parseFloat(classItem.price),
        priceMultiplier: classItem.priceMultiplier,
        status: classItem.status
      })).sort((a, b) => a.price - b.price);

      return {
        id: flightData.id,
        departureTime: flightData.departureTime,
        arrivalTime: flightData.arrivalTime,
        status: flightData.status,
        agencyId: flightData.agencyId,
        volId: flightData.volId,
        // Informations de base
        basePrice: parseFloat(flightData.price),
        // Vol
        vol: flightData.flight ? {
          id: flightData.flight.id,
          name: flightData.flight.name,
          origin: flightData.flight.origin || null,
          destination: flightData.flight.destination || null,
          company: flightData.flight.companyVol || null
        } : null,
        // Agence
        agency: flightData.agency ? {
          id: flightData.agency.id,
          name: flightData.agency.name,
          rating: flightData.agency.rating,
          logo: flightData.agency.logo,
          address: flightData.agency.address,
          location: flightData.agency.location
        } : null,
        // Classes (peut être vide)
        classes: classes,
        // Indicateurs
        hasClasses: classes.length > 0,
        minPrice: classes.length > 0 ? classes[0].price : parseFloat(flightData.price),
        maxPrice: classes.length > 0 ? classes[classes.length - 1].price : parseFloat(flightData.price),
        availableClasses: classes.length
      };
    });

    console.log('✅ Résultats prêts:', {
      total: localFlightsFormatted.length,
      avecClasses: localFlightsFormatted.filter(f => f.hasClasses).length,
      sansClasses: localFlightsFormatted.filter(f => !f.hasClasses).length
    });

    res.json({
      flights: localFlightsFormatted,  // TOUS les vols, sans filtrage
      totalCount: localFlights.count,
      page: parseInt(page) || 1,
      pageSize: parseInt(pageSize) || 10,
      filters: {
        minPrice: minGlobalPrice,
        maxPrice: maxGlobalPrice,
        destinations,
        agencies: relevantAgencies
      },
      meta: {
        totalFlights: localFlights.count,
        flightsWithClasses: localFlightsFormatted.filter(f => f.hasClasses).length,
        flightsWithoutClasses: localFlightsFormatted.filter(f => !f.hasClasses).length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Flight search error:', error);
    res.status(500).json({
      error: 'Failed to search flights',
      details: error.message
    });
  }
};
    exports.searchFlightsS = async (req, res) => {
  try {
    const {
      originPlace,
      destinationPlace,
      startDate,
      endDate,
      passengers,
      class: cabinClass,
      maxPrice,
      page = 1,
      pageSize = 10
    } = req.query;

    console.log('🔍 req.query', req.query);

    const start = startDate ? new Date(startDate) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Construction de la clause WHERE pour les vols
    const flightWhereClause = {};
    
    // Filtres sur les destinations via les relations Vol
    const volInclude = {
      model: Vol,
      as: 'flight',
      required: true,
      include: [
        {
          model: Destination,
          as: "origin",
          attributes: ["id", "name", "city", "country"],
          where: originPlace ? {
            [Op.or]: [
              { name: { [Op.like]: `%${originPlace}%` } },
              { city: { [Op.like]: `%${originPlace}%` } },
              { country: { [Op.like]: `%${originPlace}%` } }
            ]
          } : undefined
        },
        {
          model: Destination,
          as: "destination",
          attributes: ["id", "name", "city", "country"],
          where: destinationPlace ? {
            [Op.or]: [
              { name: { [Op.like]: `%${destinationPlace}%` } },
              { city: { [Op.like]: `%${destinationPlace}%` } },
              { country: { [Op.like]: `%${destinationPlace}%` } }
            ]
          } : undefined
        },
        {
          model: Company,
          as: 'companyVol',
          attributes: ["id", "name"]
        }
      ]
    };

    // Filtre sur la date de départ
    if (start) {
      flightWhereClause.departureTime = {
        [Op.gte]: start
      };
    }

    // Filtre sur le statut
    flightWhereClause.status = 'active';

    // Recherche des vols avec leurs classes
    const localFlights = await AgencyFlight.findAndCountAll({
      where: flightWhereClause,
      include: [
        volInclude,
        {
          model: Agency,
          as: 'agency',
          attributes: ['id', 'name', 'rating', 'logo', 'location', 'address'],
          where: { status: 'active' }
        },
        {
          model: ClassAgency,
          as: 'agencyClasses',
          required: false,
          include: [
            {
              model: travelClass,
              as: 'class',
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: Reservation,
          as: 'reservation',
          attributes: ['id', 'tripType'],
          required: false
        }
      ],
      order: [
        ['departureTime', 'ASC'],
        [{ model: ClassAgency, as: 'agencyClasses' }, 'price', 'ASC']
      ],
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize),
      distinct: true
    });

    // Filtrer les vols par prix maximum (en utilisant le prix minimum des classes)
    let filteredRows = localFlights.rows;
    if (maxPrice) {
      filteredRows = localFlights.rows.filter(flight => {
        // Si le vol a des classes, prendre le prix minimum
        if (flight.agencyClasses && flight.agencyClasses.length > 0) {
          const minClassPrice = Math.min(...flight.agencyClasses.map(c => parseFloat(c.price)));
          return minClassPrice <= parseFloat(maxPrice);
        }
        // Sinon, utiliser le prix du vol (fallback)
        return parseFloat(flight.price) <= parseFloat(maxPrice);
      });
    }
    // Récupérer les agences uniques
    const relevantAgencies = await Agency.findAll({
      where: {
        status: 'active',
        id: { [Op.in]: filteredRows.map(f => f.agency?.id).filter(Boolean) }
      },
      attributes: ['id', 'name', 'rating', 'logo']
    });

    // Calculer les prix min et max à partir des ClassAgency
    let minFlightPrice = Infinity;
    let maxFlightPrice = 0;
    
    filteredRows.forEach(flight => {
      if (flight.agencyClasses && flight.agencyClasses.length > 0) {
        const prices = flight.agencyClasses.map(c => parseFloat(c.price));
        const flightMin = Math.min(...prices);
        const flightMax = Math.max(...prices);
        
        minFlightPrice = Math.min(minFlightPrice, flightMin);
        maxFlightPrice = Math.max(maxFlightPrice, flightMax);
      }
    });

    minFlightPrice = minFlightPrice === Infinity ? 0 : minFlightPrice;

    // Récupérer les destinations uniques
    const destinations = await Destination.findAll({
      attributes: ['id', 'name', 'city', 'country'],
      where: {
        id: { [Op.in]: filteredRows.map(f => f.flight?.destinationId).filter(Boolean) }
      }
    });

    // Formater les résultats
    const localFlightsFormatted = filteredRows.map(flight => {
      const flightData = flight.get({ plain: true });
      
      // Formater les classes disponibles
      const classes = flightData.agencyClasses?.map(classItem => ({
        id: classItem.id,
        classId: classItem.classId,
        className: classItem.class?.name || 'Standard',
        
        price: parseFloat(classItem.price),
        priceMultiplier: classItem.priceMultiplier,
        status: classItem.status
      })) || [];

      // Trier les classes par prix
      classes.sort((a, b) => a.price - b.price);

      return {
        id: flightData.id,
        departureTime: flightData.departureTime,
        arrivalTime: flightData.arrivalTime,
        status: flightData.status,
        vol: flightData.flight ? {
          id: flightData.flight.id,
          name: flightData.flight.name,
          origin: flightData.flight.origin || null,
          destination: flightData.flight.destination || null,
          company: flightData.flight.companyVol || null
        } : null,
        agency: flightData.agency ? {
          id: flightData.agency.id,
          name: flightData.agency.name,
          rating: flightData.agency.rating,
          logo: flightData.agency.logo,
          address: flightData.agency.address,
          location: flightData.agency.location
        } : null,
        classes: classes,
        minPrice: classes.length > 0 ? classes[0].price : null,
        maxPrice: classes.length > 0 ? classes[classes.length - 1].price : null,
        availableClasses: classes.length,
        reservations: flightData.reservation || []
      };
    });

    // Filtrer par classe spécifique si demandé
    let finalFlights = localFlightsFormatted;
    if (cabinClass) {
      finalFlights = localFlightsFormatted.filter(flight => 
        flight.classes.some(c => 
          c.className.toLowerCase().includes(cabinClass.toLowerCase())
        )
      );
    }

    // Filtrer par nombre de passagers (si nécessaire)
    // Note: Cette logique dépend de comment vous gérez la disponibilité

    res.json({
      flights: finalFlights,
      totalCount: finalFlights.length,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      filters: {
        minPrice: minFlightPrice,
        maxPrice: maxFlightPrice,
        destinations,
        agencies: relevantAgencies
      },
      meta: {
        totalFlights: localFlights.count,
        filteredFlights: finalFlights.length,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('❌ Flight search error:', error);
    console.log(error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to search flights',
      details: error.message
    });
  }
};

   exports.searchFlightsPremierVrai = async (req, res) => {
  try {
    const {
      originPlace,
      destinationPlace,
      startDate,
      endDate,
      passengers,
      class: cabinClass,
      maxPrice,
      page = 1,
      pageSize = 10
    } = req.query;

    console.log('req.query', req.query);

    const start = startDate ? new Date(startDate) : null;

   // const localWhereClause = {
      
    //  ...(start && { departureTime: { [Op.gte]: start } })
    //};
  //   const localWhereClause = {};
//if (start) {
//  const startOfDay = new Date(start.setHours(0, 0, 0, 0)); // début de la journée
 // localWhereClause.departureTime = {
  //  [Op.gte]: startOfDay
//  };
//}

             

const today = new Date();
today.setHours(0, 0, 0, 0); // aujourd’hui à minuit

const localWhereClause = {};

// Si startDate est fourni → filtrer à partir de startDate
//if (startDate) {
 // localWhereClause.departureTime = {
  //  [Op.gte]: new Date(new Date(startDate).setHours(0, 0, 0, 0))
 // };
//}
// else {
  // Sinon, ignorer les vols passés
  //localWhereClause.departureTime = {
    //[Op.gte]: today
 // };
//}

// Si endDate est fourni, ajouter la borne supérieure
//if (endDate) {
  //localWhereClause.departureTime = {
  //  ...whereClause.departureTime,
   // [Op.lte]: new Date(new Date(endDate).setHours(23, 59, 59, 999))
 // };
//}

             
    const localFlights = await AgencyFlight.findAndCountAll({
  //where: localWhereClause,
  include: [
    {
      model: Vol,
      as: 'flight',
      include: [
        {
          model: Destination,
          as: "origin",
          attributes: ["id", "name","city","country"]
        },
        {
          model: Destination,
          as: "destination",
          attributes: ["id", "name","city","country"]
        },
       {model:Company,as:'companyVol',attributes:["id","name"]},
      ]
    }, {
          model: Agency,
          as: 'agency',
          attributes: ['id', 'name', 'rating', 'logo', 'location', 'address']
        }
,
    {
      model: Reservation,
      as: 'reservation', // S'assurer que l'alias correspond à l'association déclarée dans le modèle
      attributes: ['id', 'tripType']
    }
  ],
  order: [['price', 'ASC']],
  limit: parseInt(pageSize),
  offset: (parseInt(page) - 1) * parseInt(pageSize),
  distinct: true
});

    const relevantAgencies = await Agency.findAll({
      where: {
        status: 'active',
        id: { [Op.in]: localFlights.rows.map(f => f.agency?.id).filter(Boolean) }
      },
      attributes: ['id', 'name', 'rating', 'logo']
    });

    const [minFlightPrice, maxFlightPrice] = await Promise.all([
      AgencyFlight.min('price', { where: localWhereClause }),
      AgencyFlight.max('price', { where: localWhereClause })
    ]);

    const destinations = await Destination.findAll({
      attributes: ['id', 'name', 'city', 'country'],
      where: {
        id: { [Op.in]: localFlights.rows.map(f => f.flight?.destinationId).filter(Boolean) }
      }
    });

    const localFlightsFormatted = localFlights.rows.map(flight => {
      const flightData = flight.get({ plain: true });
 console.log('flightData',flightData)
      return {
        ...flightData,
        vol: flightData.flight ? {
          id: flightData.flight.id,
          origin: flightData.flight.origin || null,
          destination: flightData.flight.destination || null,
          startAt: flightData.flight.startAt,
          endAt: flightData.flight.endAt,
          company: flightData.flight.companyVol || null
        } : null,
        agency: flight.agency ? {
          id: flight.agency.id,
          name: flight.agency.name,
          rating: flight.agency.rating,
          logo: flight.agency.logo,
          address: flight.agency.address,
          location: flight.agency.location
        } : null,
        reservations: flightData.reservation || []
      };
    });

    res.json({
      flights: localFlightsFormatted,
      totalCount: localFlights.count,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      filters: {
        minPrice: minFlightPrice || 0,
        maxPrice: maxFlightPrice || 0,
        destinations,
        agencies: relevantAgencies
      },
      meta: {
        localFlights: localFlights.count,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Flight search error:', error);
    console.log(error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to search flights',
      details: error.message
    });
  }
};
      
// exports.searchFlights = async (req, res) => {
//   try {
//     const {
//       originPlace,
//       destinationPlace,
//       startDate,
//       endDate,
//       passengers,
//       class: cabinClass,
//       maxPrice,
//       page = 1,
//       pageSize = 10
//     } = req.query;

//     console.log('req.query', req.query);

//     const start = startDate ? new Date(startDate) : null;

//     // Filtrage basé sur le vol, et non sur AgencyFlight
//     const localWhereClause = {
//       status: 'active',
//       ...(start && { departureTime: { [Op.gte]: start } })
//     };

//     // Fetching local flights
//     const localFlights = await AgencyFlight.findAndCountAll({
//       where: localWhereClause,
//       include: [
//         {
//           model: Vol,
//           as: 'flight',
//           include: [
//             { model: Destination, as: 'destination', attributes: ['id', 'name', 'city', 'country'] }
//           ]
//         },
//         { model: Agency, as: 'agency', attributes: ['id', 'name', 'rating', 'logo', 'location', 'address'] },
//         { model: Reservation, as: 'reservation', attributes: ['id', 'tripType'] }
//       ],
//       order: [['price', 'ASC']],
//       limit: pageSize,
//       offset: (page - 1) * pageSize,
//       distinct: true
//     });

//     console.log('LocalFlights', localFlights);

//     // Fetching flight suggestions for places from the external API
//     const suggestions = await flightApiService.getPlaces(req.query.query || "").catch(err => {
//       console.error('Error fetching suggestions from external API:', err);
//       return [];
//     });

//     // Formatting the flight results
//     const localFlightsFormatted = localFlights.rows.map(flight => {
//       const flightData = flight.get({ plain: true });
//       return {
//         ...flightData,
//         vol: flightData.flight ? {
//           id: flightData.flight.id,
//           origin: flightData.flight.origin || null,
//           destination: flightData.flight.destination || null,
//           startAt: flightData.flight.startAt,
//           endAt: flightData.flight.endAt
//         } : null,
//         agency: flight.agency ? {
//           id: flight.agency.id,
//           name: flight.agency.name,
//           rating: flight.agency.rating,
//           logo: flight.agency.logo,
//           address: flight.agency.address,
//           location: flight.agency.location
//         } : null,
//         reservations: flightData.reservation || []
//       };
//     });

//     // 2. Returning the response with the local flights and suggestions
//     res.json({
//       flights: localFlightsFormatted,
//       totalCount: localFlights.count,
//       page: parseInt(page),
//       pageSize: parseInt(pageSize),
//       suggestions: suggestions,  // Adding suggestions to the response
//       meta: {
//         localFlights: localFlights.count,
//         timestamp: new Date()
//       }
//     });

//   } catch (error) {
//     console.error('Flight search error:', error);
//     console.log(error.response?.data || error.message);
//     res.status(500).json({
//       error: 'Failed to search flights',
//       details: error.message
//     });
//   }
// };

// Fonction utilitaire pour formater les dates
    // Recherche principa    const destinationIds = [...new Set(filteredRows
    // Filtrer par class

// Détails d'un vol
   

// Recherche de places (aéroports/villes)

exports.getFlightDetails = async (req, res) => {
  try {
    const classAgencyId = req.params.id; // C'est un ID de ClassAgency
    let flightDetails;

    // Vérifier si c'est un vol externe
    if (classAgencyId.startsWith('ext-')) {
      const externalId = classAgencyId.replace('ext-', '');
      const externalFlight = await flightApiService.getFlightDetails(externalId);
      flightDetails = {
        ...externalFlight,
        external: true,
      };
    } else {
      // Recherche dans ClassAgency avec l'ID spécifique
      const classAgency = await ClassAgency.findByPk(classAgencyId, {
        include: [
          {
            model: AgencyFlight,
            as: 'agencyVol',
            required: true,
            include: [
              {
                model: Agency,
                as: 'agency',
                attributes: ['id', 'name', 'rating', 'logo', 'description', 'location', 'address']
              },
              {
                model: Vol,
                as: 'flight',
                include: [
                  {
                    model: Destination,
                    as: 'origin',
                    attributes: ['id', 'name', 'country', 'city']
                  },
                  {
                    model: Destination,
                    as: 'destination',
                    attributes: ['id', 'name', 'country', 'city']
                  },
                  {
                    model: Company,
                    as: 'companyVol',
                    attributes: ['id', 'name']
                  }
                ]
              }
            ]
          },
          {
            model: travelClass,
            as: 'class',
            attributes: ['id', 'name']
          }
        ]
      });

      if (!classAgency) {
        return res.status(404).json({ error: 'Flight class not found' });
      }

      const classData = classAgency.get({ plain: true });
      const flightData = classData.agencyVol;

      // OPTIONNEL: Récupérer les autres classes du même vol (si nécessaire pour l'affichage)
      const otherClasses = await ClassAgency.findAll({
        where: {
          agencyVolId: flightData.id,
          status: 'active',
          id: { [Op.ne]: classAgencyId } // Exclure la classe actuelle
        },
        include: [
          {
            model: travelClass,
            as: 'class',
            attributes: ['id', 'name']
          }
        ],
        limit: 5 // Limiter pour ne pas surcharger
      });

      // Formater les autres classes
      const otherClassesFormatted = otherClasses.map(classItem => ({
        id: classItem.id,
        classId: classItem.classId,
        className: classItem.class?.name || 'Standard',
        
        price: parseFloat(classItem.price),
        priceMultiplier: classItem.priceMultiplier,
        status: classItem.status
      }));

      // Construction de l'objet formaté pour LA CLASSE DEMANDÉE
      flightDetails = {
        // Informations de la classe spécifique
        id: classData.id,
        classId: classData.classId,
        className: classData.class?.name || 'Standard',
        
        price: parseFloat(classData.price),
        priceMultiplier: classData.priceMultiplier,
        classStatus: classData.status,
        
        // Informations du vol
        departureTime: flightData.departureTime,
        arrivalTime: flightData.arrivalTime,
        flightStatus: flightData.status,
        
        // Agence
        agency: flightData.agency ? {
          id: flightData.agency.id,
          name: flightData.agency.name,
          rating: flightData.agency.rating,
          logo: flightData.agency.logo,
          description: flightData.agency.description,
          location: flightData.agency.location,
          address: flightData.agency.address
        } : null,
        
        // Vol
        flight: flightData.flight ? {
          id: flightData.flight.id,
          name: flightData.flight.name,
          origin: flightData.flight.origin || null,
          destination: flightData.flight.destination || null,
          company: flightData.flight.companyVol || null
        } : null,
        
        // Autres classes disponibles pour ce même vol (optionnel)
        otherClasses: otherClassesFormatted,
        hasOtherClasses: otherClassesFormatted.length > 0,
        
        // Statistiques
        minPrice: Math.min(parseFloat(classData.price), ...otherClassesFormatted.map(c => c.price)),
        maxPrice: Math.max(parseFloat(classData.price), ...otherClassesFormatted.map(c => c.price)),
        totalAvailableClasses: 1 + otherClassesFormatted.length
      };
    }

    // Ajouter des offres similaires si c'est un vol local
    if (!flightDetails.external && flightDetails.vol) {
      try {
        const similarExternalFlights = await flightApiService.searchFlights({
          originPlace: flightDetails.vol.origin?.city || flightDetails.vol.origin?.name,
          destinationPlace: flightDetails.vol.destination?.city || flightDetails.vol.destination?.name,
          startDate: flightDetails.departureTime,
          maxPrice: flightDetails.maxPrice ? flightDetails.maxPrice * 1.2 : null
        });

        flightDetails.similarOffers = similarExternalFlights?.slice(0, 3) || [];
      } catch (error) {
        console.log('⚠️ Erreur récupération offres similaires:', error.message);
        flightDetails.similarOffers = [];
      }
    }

    res.json(flightDetails);

  } catch (error) {
    console.error('❌ Flight details error:', error);
    res.status(500).json({
      error: 'Failed to get flight details',
      details: error.message
    });
  }
};
exports.getFlightDetailsbn = async (req, res) => {
  try {
    const classAgencyId = req.params.id; // C'est un ID de ClassAgency
    let flightDetails;

    // Vérifier si c'est un vol externe
    if (classAgencyId.startsWith('ext-')) {
      const externalId = classAgencyId.replace('ext-', '');
      const externalFlight = await flightApiService.getFlightDetails(externalId);
      flightDetails = {
        ...externalFlight,
        external: true,
      };
    } else {
      // Recherche dans ClassAgency d'abord
      const classAgency = await ClassAgency.findByPk(classAgencyId, {
        include: [
          {
            model: AgencyFlight,
            as: 'agencyVol',
            required: true,
            include: [
              {
                model: Agency,
                as: 'agency',
                attributes: ['id', 'name', 'rating', 'logo', 'description', 'location', 'address']
              },
              {
                model: Vol,
                as: 'flight',
                include: [
                  {
                    model: Destination,
                    as: 'origin',
                    attributes: ['id', 'name', 'country', 'city']
                  },
                  {
                    model: Destination,
                    as: 'destination',
                    attributes: ['id', 'name', 'country', 'city']
                  },
                  {
                    model: Company,
                    as: 'companyVol',
                    attributes: ['id', 'name']
                  }
                ]
              }
            ]
          },
          {
            model: travelClass,
            as: 'class',
            attributes: ['id', 'name']
          }
        ]
      });

      if (!classAgency) {
        return res.status(404).json({ error: 'Flight class not found' });
      }

      const classData = classAgency.get({ plain: true });
      const flightData = classData.agencyVol;

      // Récupérer toutes les autres classes pour ce même vol
      const otherClasses = await ClassAgency.findAll({
        where: {
          agencyVolId: flightData.id,
          status: 'active'
        },
        include: [
          {
            model: travelClass,
            as: 'class',
            attributes: ['id', 'name']
          }
        ]
      });

      // Formater toutes les classes disponibles
      const allClasses = [classData, ...otherClasses.filter(c => c.id !== classData.id)]
        .map(classItem => ({
          id: classItem.id,
          classId: classItem.classId,
          className: classItem.class?.name || 'Standard',
           price: parseFloat(classItem.price),
          priceMultiplier: classItem.priceMultiplier,
          status: classItem.status
        }))
        .sort((a, b) => a.price - b.price);

      // Prix par défaut (la classe demandée)
      const defaultPrice = parseFloat(classData.price);

      // Construction de l'objet formaté
      flightDetails = {
        id: classData.id,
        classId: classData.classId,
        className: classData.class?.name || 'Standard',
        
        price: defaultPrice,
        priceMultiplier: classData.priceMultiplier,
        status: classData.status,
        departureTime: flightData.departureTime,
        arrivalTime: flightData.arrivalTime,
        flightStatus: flightData.status,
        agency: flightData.agency ? {
          id: flightData.agency.id,
          name: flightData.agency.name,
          rating: flightData.agency.rating,
          logo: flightData.agency.logo,
          description: flightData.agency.description,
          location: flightData.agency.location,
          address: flightData.agency.address
        } : null,
        flight: flightData.flight ? {
          id: flightData.flight.id,
          name: flightData.flight.name,
          origin: flightData.flight.origin || null,
          destination: flightData.flight.destination || null,
          company: flightData.flight.companyVol || null
        } : null,
        allClasses: allClasses,
        hasMultipleClasses: allClasses.length > 1,
        minPrice: allClasses[0]?.price || defaultPrice,
        maxPrice: allClasses[allClasses.length - 1]?.price || defaultPrice,
        availableClasses: allClasses.length
      };
    }

    // Ajouter des offres similaires si c'est un vol local
    if (!flightDetails.external && flightDetails.vol) {
      try {
        const similarExternalFlights = await flightApiService.searchFlights({
          originPlace: flightDetails.vol.origin?.city || flightDetails.vol.origin?.name,
          destinationPlace: flightDetails.vol.destination?.city || flightDetails.vol.destination?.name,
          startDate: flightDetails.departureTime,
          maxPrice: flightDetails.maxPrice ? flightDetails.maxPrice * 1.2 : null
        });

        flightDetails.similarOffers = similarExternalFlights?.slice(0, 3) || [];
      } catch (error) {
        console.log('⚠️ Erreur récupération offres similaires:', error.message);
        flightDetails.similarOffers = [];
      }
    }

    res.json(flightDetails);

  } catch (error) {
    console.error('❌ Flight details error:', error);
    res.status(500).json({
      error: 'Failed to get flight details',
      details: error.message
    });
  }
};

     exports.getFlightDetails4 = async (req, res) => {
  try {
    const flightId = req.params.id;
    let flight;

    // Vérifier si c'est un vol externe
    if (flightId.startsWith('ext-')) {
      const externalId = flightId.replace('ext-', '');
      const externalFlight = await flightApiService.getFlightDetails(externalId);
      flight = {
        ...externalFlight,
        external: true,
      };
    } else {
      // Recherche dans la base locale avec les classes
      flight = await AgencyFlight.findByPk(flightId, {
        include: [
          {
            model: Agency,
            as: 'agency',
            attributes: ['id', 'name', 'rating', 'logo', 'description', 'location', 'address']
          },
          {
            model: Vol,
            as: 'flight',
            include: [
              {
                model: Destination,
                as: 'origin',
                attributes: ['id', 'name', 'country', 'city']
              },
              {
                model: Destination,
                as: 'destination',
                attributes: ['id', 'name', 'country', 'city']
              },
              {
                model: Company,
                as: 'companyVol',
                attributes: ['id', 'name']
              }
            ]
          },
          {
            model: ClassAgency,
            as: 'agencyClasses',
            required: false,
            include: [
              {
                model: travelClass,
                as: 'class',
                attributes: ['id', 'name']
              }
            ]
          },
          {
            model: Reservation,
            as: 'reservation',
            attributes: ['id', 'tripType'],
            required: false
          }
        ]
      });
    }

    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }

    // Formater la réponse
    const flightData = flight.get({ plain: true });
    
    const formattedFlight = {
      id: flightData.id,
      departureTime: flightData.departureTime,
      arrivalTime: flightData.arrivalTime,
      status: flightData.status,
      agency: flightData.agency,
      flight: flightData.flight ? {
        id: flightData.flight.id,
        name: flightData.flight.name,
        origin: flightData.flight.origin,
        destination: flightData.flight.destination,
        company: flightData.flight.companyVol
      } : null,
      classes: flightData.agencyClasses?.map(classItem => ({
        id: classItem.id,
        classId: classItem.classId,
        className: classItem.class?.name || 'Standard',
        
        price: parseFloat(classItem.price),
        priceMultiplier: classItem.priceMultiplier,
        status: classItem.status
      })) || [],
      minPrice: flightData.agencyClasses?.length > 0 
        ? Math.min(...flightData.agencyClasses.map(c => parseFloat(c.price)))
        : null,
      maxPrice: flightData.agencyClasses?.length > 0
        ? Math.max(...flightData.agencyClasses.map(c => parseFloat(c.price)))
        : null
    };

    // Ajouter des offres similaires si c'est un vol local
    if (!flight.external && formattedFlight.vol) {
      const similarExternalFlights = await flightApiService.searchFlights({
        originPlace: formattedFlight.vol.origin?.city,
        destinationPlace: formattedFlight.vol.destination?.city,
        startDate: formattedFlight.departureTime,
        maxPrice: formattedFlight.maxPrice * 1.2 // 20% de marge
      });

      formattedFlight.similarOffers = similarExternalFlights.slice(0, 3);
    }

    res.json(formattedFlight);
  } catch (error) {
    console.error('❌ Flight details error:', error);
    res.status(500).json({
      error: 'Failed to get flight details',
      details: error.message
    });
  }
};

exports.getFlightDetailsPremierVrai = async (req, res) => {
  try {
    const flightId = req.params.id;
    let flight;

    // Check if it's an external flight
    if (flightId.startsWith('ext-')) {
      // Fetch from external API
      const externalId = flightId.replace('ext-', '');
      const externalFlight = await flightApiService.getFlightDetails(externalId);
      
      flight = {
        ...externalFlight,
        external: true,
        // Add any additional processing for external flights
      };
    } else {
      // Fetch from local database
      flight = await AgencyFlight.findByPk(flightId, {
        include: [
          {
            model: Agency,
            as: 'agency',
            attributes: ['id', 'name', 'rating', 'logo', 'description']
          },{
            model: Vol,
            as: 'flight',
            include: [
              {
                model: Destination,
                as: 'origin',
                attributes: ['id', 'name','country','city']
              },
              {
                model: Destination,
                as: 'destination',
                attributes: ['id', 'name','country','city']
              },
              {
                model: Company,
                as: 'companyVol',
                attributes: ['id', 'name']
              },
            
            ]
          },{
                model: Reservation,
                as: 'reservation',
                attributes: ['id', 'tripType']
              }

        ]
     
    })
}
    if (!flight) {
      return res.status(404).json({
        error: 'Flight not found'
      });
    }

    // If it's a local flight, check for similar external offers
    if (!flight.external) {
      const similarExternalFlights = await flightApiService.searchFlights({
        originPlace: flight.originId,
        destinationPlace: flight.destinationId,
        startDate: flight.startAt,
        maxPrice: flight.prix * 1.2 // 20% margin
      });

      flight.similarOffers = similarExternalFlights.slice(0, 3);
    }

    res.json(flight);
  } catch (error) {
    console.error('Flight details error:', error); 
    res.status(500).json({
      error: 'Failed to get flight details',
      details: error.message
    });
  }
};

exports.searchPlaces = async (req, res) => {
  try {
    const { query } = req.query;

    // Vérifie si l'API externe renvoie des résultats valides
    const [localPlaces, externalPlaces = []] = await Promise.all([
      Destination.findAll({
        where: {
          [Op.or]: [ 
            { name: { [Op.iLike]: `%${query}%` } },
            { city: { [Op.iLike]: `%${query}%` } }, 
            { country: { [Op.iLike]: `%${query}%` } }
          ]
        },
        attributes: ['id', 'name', 'city', 'country'],
        limit: 5
      }),
      flightApiService.getPlaces(query).catch(err => {
        console.error("Erreur API externe (getPlaces) :", err);
        return { error: 'L’API externe ne répond pas', places: [] }; // Retourne un tableau vide en cas d'erreur
      })
    ]);

    res.json({
      places: [
        ...localPlaces.map(place => ({
          ...place.toJSON(),
          source: 'local'
        })),
        ...(Array.isArray(externalPlaces) ? externalPlaces.map(place => ({
          id: place.PlaceId,
          name: place.PlaceName,
          city: place.CityName,
          country: place.CountryName,
          source: 'external'
        })) : [])
      ]
    });
  } catch (error) {
    console.error('Place search error:', error);
    res.status(500).json({
      error: 'Failed to search places',
      details: error.message
    });
  }
};
