const DestinationAgency = require("../models/destinationAgency");
const FlightAgency = require("../models/flightAgency");
const ClassAgency = require("../models/agencyClass");
const Agency=require('../models/agenceModel')
const { Op } = require("sequelize");
const { Vol } = require("../models");
const Company =require("../models/Company")
const Destination=require('../models/destinationModel')
const Class=require('../models/classModel')
/**
 * 🚀 CRUD DestinationAgency
 */
// exports.createDestinationAgency = async (req, res) => {
//   try {
//     const { destinationId, agencyId, status } = req.body;
//     const newEntry = await DestinationAgency.create({ destinationId, agencyId, status });
//     res.status(201).json(newEntry);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.getAllDestinationAgencies = async (req, res) => {
//   try {
//     const data = await DestinationAgency.findAll({ include: ["destination", "agency"] });
//     res.json(data);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.updateDestinationAgency = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updated = await DestinationAgency.update(req.body, { where: { id } });
//     res.json({ message: "Mise à jour réussie", updated });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.deleteDestinationAgency = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await DestinationAgency.destroy({ where: { id } });
//     res.json({ message: "Suppression réussie" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

/**
 * 🚀 CRUD FlightAgency
 */
exports.createFlightAgency = async (req, res) => {
  try {
    const { volId, agencyId,classId, price, status, departureTime, arrivalTime } = req.body;

    // Vérification des formats de date
    const parsedDeparture = departureTime ? new Date(departureTime) : null;
    const parsedArrival = arrivalTime ? new Date(arrivalTime) : null;

    const newEntry = await FlightAgency.create({ 
      volId, 
      agencyId, classId,
      price, 
      status, 
      departureTime: parsedDeparture, 
      arrivalTime: parsedArrival 
    });

    res.status(201).json(newEntry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// exports.getAllFlightAgencies = async (req, res) => {
//   try {
//     const data = await FlightAgency.findAll({
//       where: {
        
//         status: "active",
//         departureTime: { [Op.gt]: new Date() } // Exclure les vols dont departureTime est aujourd'hui ou passé
//       },
//       include: ["flight", "agency"],
//       attributes: ["id", "price", "status", "departureTime", "arrivalTime"],
//     });

//     res.json(data);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


// exports.getUserFlightAgencies = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     // Vérifier si l'utilisateur appartient à une agence
//     const userAgency = await Agency.findOne({ where: { userId } });
//     if (!userAgency) {
//       return res.status(403).json({ error: "Vous n'êtes pas associé à une agence." });
//     }

//     console.log("userAgency", userAgency);

//     // Récupérer les vols de l'agence avec les horaires
//     const flightAgencies = await FlightAgency.findAll({
//       where: { agencyId: userAgency.id },
//       include: ["flight", "agency"],
//       attributes: ["id", "price", "status", "departureTime", "arrivalTime"],
//     });

//     res.json(flightAgencies);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
const addDays = (date, days) => {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
};
// exports.getAllFlightAgencies = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const offset = (page - 1) * limit;
//     const search = req.query.search || '';
//     const status = req.query.status;
//     const now = new Date();
//     const minDate = addDays(now, 1); // Vols dont departureTime est >= maintenant + 2 jours


//     const whereClause = {
//       [Op.and]: [
//         search ? {
//           [Op.or]: [
//             { '$flight.name$': { [Op.like]: `%${search}%` } },
//             { '$agency.name$': { [Op.like]: `%${search}%` } }
//           ]
//         } : {},
//         status ? { status } : {},
//         // { departureTime: { [Op.gt]: new Date() } }
//         // {departureTime: { 
//         //   [Op.between]: [new Date(), addDays(new Date(), 2)] // Filtrer les vols dans les 2 prochains jours
//         // }} // Exclure les vols 
//          { departureTime: { [Op.gte]: minDate } } // Afficher les vols avec departureTime >= minDate
//       ]
//     };

//     const { count, rows } = await FlightAgency.findAndCountAll({
//       where: whereClause,
//       include: [
//         { model: Vol, as: 'flight' ,where: { endAt: { [Op.gt]: now } }, // vols actives uniquement
//         required: false, },
//         { model: Agency, as: 'agency' }
//       ],
//       attributes: ['id', 'price', 'status', 'departureTime', 'arrivalTime'],
//       limit,
//       offset,
//       order: [['departureTime', 'ASC']]
//     });

//     res.status(200).json({
//       success: true,
//       data: rows,
//       pagination: {
//         total: count,
//         page,
//         pages: Math.ceil(count / limit)
//       }
//     });
//   } catch (error) {
//     console.error('Error fetching flights:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };
exports.getAllFlightAgenciesVrai = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status;
    const now = new Date();

    // Définir la date minimale (début de la journée actuelle)
//    const todayStart = addDays(new Date(now.setHours(0, 0, 0, 0)), 0); 
     const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const whereClause = {
      [Op.and]: [
        search ? {
          [Op.or]: [
            { '$flight.name$': { [Op.like]: `%${search}%` } },
            { '$agency.name$': { [Op.like]: `%${search}%` } }
          ]
        } : {},
        status ? { status } : {},
      ]
    };

    const { count, rows } = await FlightAgency.findAndCountAll({
     // where: whereClause,
      include: [
        { 
          model: Vol, 
          as: 'flight',
          where: { 
          //  endAt: { [Op.gte]: todayStart } // endAt >= aujourd'hui à 00:00:00
          }, 
          //required: true, // Assurer que l'on récupère uniquement les vols correspondants
           include:[ {model: Company, as:'companyVol'}]
        },

        { model: Agency, as: 'agency',required:true }
      ],distinct: true,
      attributes: ['id',  'status', 'departureTime', 'arrivalTime'],
      limit,
      offset,
      order: [['departureTime', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching flights:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// exports.getUserFlightAgencies = async (req, res) => {
//   try {
//     const userId = req.user.id; // Assurez-vous que l'ID de l'utilisateur est récupéré depuis le token ou la session

//     // Vérifier si l'utilisateur est lié à une agence
//     const userAgency = await Agency.findOne({ where: { userId } });
//     if (!userAgency) {
//       return res.status(403).json({ error: "Vous n'êtes pas associé à une agence." });
//     }
//  console.log('userAgency',userAgency)
//     // Récupérer les FlightAgency liés à l'agence de l'utilisateur
//     const flightAgencies = await FlightAgency.findAll({
//       where: { agencyId: userAgency.id },
//       include: ["flight", "agency"],
//     });

//     res.json(flightAgencies);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
exports.getUserFlightAgencies = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(403).json({ error: "User not authenticated" });
    }

    const userId = req.user.id;
    const hasPermission = req.isAdmin || req.hasPermission;

    let whereCondition = {};

    if (!hasPermission) {
      // L'utilisateur n'est ni admin ni autorisé => chercher s'il a créé une agence
      const userAgency = await Agency.findOne({ where: { userId } });

      if (!userAgency) {
        return res.status(403).json({ error: "Vous n'avez pas accès à ces données." });
      }

      whereCondition.agencyId = userAgency.id;
    }

    const flightAgencies = await FlightAgency.findAll({
      where: whereCondition,
  include: [
    {
      model: Vol,
      as: "flight",
      include: [
        {
          model: Company,
          as: "companyVol"
        },{
          model: Destination,
          as: "origin",
          attributes: ["id", "name"]
        },
        {
          model: Destination,
          as: "destination",
          attributes: ["id", "name"]
        }
      ]
    },
    {
      model: Agency,
      as: "agency"
    }
  ]
    });

    res.status(200).json(flightAgencies);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des FlightAgencies :", error);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des vols liés à une agence." });
  }
};



exports.getAllFlightAgencies = async (req, res) => {
  try {
    const { Op } = require('sequelize');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 1000;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status;

    const whereClause = {
      [Op.and]: [
        search ? {
          [Op.or]: [
            { '$flight.name$': { [Op.like]: `%${search}%` } },
            { '$agency.name$': { [Op.like]: `%${search}%` } },
          ]
        } : {},
        status ? { status } : {}
      ].filter(condition => Object.keys(condition).length > 0)
    };

    const includeOptions = [
      {
        model: Vol,
        as: 'flight',
        required: false,
        include: [
          {
            model: Company,
            as: 'companyVol',
            required: false
          },
          {
            model: Destination,
            as: 'origin',
            attributes: ['id', 'name', 'city', 'country']
          },
          {
            model: Destination,
            as: 'destination',
            attributes: ['id', 'name', 'city', 'country']
          }
        ]
      },
      {
        model: Agency,
        as: 'agency',
        required: false
      }
    ];

    const { count, rows } = await FlightAgency.findAndCountAll({
      where: whereClause,
      include: includeOptions,
      distinct: true,
      attributes: ['id', 'status', 'departureTime', 'arrivalTime', 'createdAt', 'updatedAt'],
      limit,
      offset,
      order: [['departureTime', 'ASC']],
      subQuery: false
    });

    // ✅ CORRECTION: Formater les données pour inclure les destinations
    const formattedRows = rows.map(item => {
      const data = item.get({ plain: true });
      
      return {
        id: data.id,
        status: data.status,
        departureTime: data.departureTime,
        arrivalTime: data.arrivalTime,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        
        // Informations de l'agence
        agency: data.agency ? {
          id: data.agency.id,
          name: data.agency.name,
          logo: data.agency.logo,
          rating: data.agency.rating,
          description: data.agency.description
        } : null,
        
        // Informations du vol avec destinations
        flight: data.flight ? {
          id: data.flight.id,
          name: data.flight.name,
          company: data.flight.companyVol ? {
            id: data.flight.companyVol.id,
            name: data.flight.companyVol.name
          } : null,
          origin: data.flight.origin ? {
            id: data.flight.origin.id,
            name: data.flight.origin.name,
            city: data.flight.origin.city,
            country: data.flight.origin.country
          } : null,
          destination: data.flight.destination ? {
            id: data.flight.destination.id,
            name: data.flight.destination.name,
            city: data.flight.destination.city,
            country: data.flight.destination.country
          } : null
        } : null
      };
    });

    res.status(200).json({
      success: true,
      data: formattedRows,
      pagination: {
        total: count,
        page,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching flights:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.getAllFlightAgenciesCorection = async (req, res) => {
  try {
    const { Op } = require('sequelize');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 1000;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status;

    const whereClause = {
      [Op.and]: [
        search ? {
          [Op.or]: [
            { '$flight.name$': { [Op.like]: `%${search}%` } },
            { '$agency.name$': { [Op.like]: `%${search}%` } },
            
          ]
        } : {},
        status ? { status } : {}
      ].filter(condition => Object.keys(condition).length > 0)
    };

    const includeOptions = [
      {
        model: Vol,
        as: 'flight',
        required: false, // Permet d'inclure même si pas de vol
        include: [
          {
            model: Company,
            as: 'companyVol',
            required: false
          },{
                        model: Destination,
                        as: 'origin',
                        attributes: ['id', 'name', 'city', 'country']
                    },
                    {
                        model: Destination,
                        as: 'destination',
                        attributes: ['id', 'name',  'city', 'country']
                    }

        ]
      },
      {
        model: Agency,
        as: 'agency',
        required: false // Permet d'inclure même si pas d'agence
      }
    ];

    const { count, rows } = await FlightAgency.findAndCountAll({
      where: whereClause, // Décommenté !
      include: includeOptions,
      distinct: true,
      attributes: ['id',  'status', 'departureTime', 'arrivalTime', 'createdAt', 'updatedAt'],
      limit,
      offset,
      order: [['departureTime', 'ASC']],
      subQuery: false // Important pour les includes complexes
    });

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching flights:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.getAllFlightAgenciesCorig = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100; // Augmenter la limite temporairement
    const offset = (page - 1) * limit;

    // D'abord, récupérer SANS filtres pour voir tout ce qu'il y a
    const { count, rows } = await FlightAgency.findAndCountAll({
      include: [
        {
          model: Vol,
          as: 'flight',
          required: false,
          include: [{ model: Company, as: 'companyVol', required: false }]
        },
        {
          model: Agency,
          as: 'agency',
          required: false
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    console.log(`Total AgencyFlight found: ${count}`);
    console.log(`AgencyFlight with Vol: ${rows.filter(r => r.flight).length}`);
    console.log(`AgencyFlight with Agency: ${rows.filter(r => r.agency).length}`);

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page,
        pages: Math.ceil(count / limit)
      },
      debug: {
        totalCount: count,
        withFlight: rows.filter(r => r.flight).length,
        withAgency: rows.filter(r => r.agency).length
      }
    });
  } catch (error) {
    console.error('Error fetching flights:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.deleteFlightAgency = async (req, res) => {
  try {
    const { id } = req.params;
    await FlightAgency.destroy({ where: { id } });
    res.json({ message: "Suppression réussie" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.updateFlightAgency = async (req, res) => {
  try {
    const { id } = req.params;
     const { departureTime, arrivalTime } = req.body;

    // Conversion des dates
    const parsedDeparture = departureTime ? new Date(departureTime) : null;
    const parsedArrival = arrivalTime ? new Date(arrivalTime) : null;

    const updated = await FlightAgency.update(
      { ...req.body, departureTime: parsedDeparture, arrivalTime: parsedArrival },
      { where: { id } }
    );

    res.json({ message: "Mise à jour réussie", updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Contrôleur pour récupérer les vols par agence
exports.getFlightsByAgency = async (req, res) => {
    try {
        const { agencyId } = req.params;
        const { 
            page = 1, 
            limit = 10, 
            search = '', 
            status,
            sortBy = 'departureTime',
            sortOrder = 'ASC',
            minPrice,
            maxPrice,
            fromDate,
            toDate
        } = req.query;

        // Validation de l'ID de l'agence
        if (!agencyId || isNaN(parseInt(agencyId))) {
            return res.status(400).json({
                success: false,
                message: 'ID d\'agence invalide'
            });
        }

        const parsedAgencyId = parseInt(agencyId);
        const parsedPage = parseInt(page);
        const parsedLimit = parseInt(limit);
        const offset = (parsedPage - 1) * parsedLimit;

        // Vérifier que l'agence existe
        const agency = await Agency.findByPk(parsedAgencyId);
        if (!agency) {
            return res.status(404).json({
                success: false,
                message: 'Agence non trouvée'
            });
        }

        // Construire les conditions de recherche
        const whereClause = {
            agencyId: parsedAgencyId
        };

        // Filtre par statut
        if (status) {
            whereClause.status = status;
        }

        // Filtre par prix
        if (minPrice || maxPrice) {
            whereClause.price = {};
            if (minPrice) whereClause.price[Op.gte] = parseFloat(minPrice);
            if (maxPrice) whereClause.price[Op.lte] = parseFloat(maxPrice);
        }

        // Filtre par date de départ
        if (fromDate || toDate) {
            whereClause.departureTime = {};
            if (fromDate) {
                whereClause.departureTime[Op.gte] = new Date(fromDate);
            }
            if (toDate) {
                whereClause.departureTime[Op.lte] = new Date(toDate);
            }
        }

        // Options d'inclusion
        const includeOptions = [
            {
                model: Vol,
                as: 'flight',
                include: [
                    {
                        model: Company,
                        as: 'companyVol',
                        attributes: ['id', 'name', 'logo']
                    },
                    {
                        model: Destination,
                        as: 'origin',
                        attributes: ['id', 'name', 'city', 'country']
                    },
                    {
                        model: Destination,
                        as: 'destination',
                        attributes: ['id', 'name',  'city', 'country']
                    }
                ]
            },
            {
                model: Agency,
                as: 'agency',
                attributes: ['id', 'name', 'logo', 'description']
            }
        ];

        // Recherche textuelle
        if (search) {
            includeOptions[0].where = {
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    { '$flight.companyVol.name$': { [Op.like]: `%${search}%` } },
                    { '$flight.origin.name$': { [Op.like]: `%${search}%` } },
                    { '$flight.destination.name$': { [Op.like]: `%${search}%` } }
                ]
            };
        }

        // Récupérer les vols avec pagination
        const { count, rows } = await FlightAgency.findAndCountAll({
            where: whereClause,
            include: includeOptions,
            distinct: true,
            attributes: ['id', 'status', 'departureTime', 'arrivalTime', 'createdAt', 'updatedAt'],
            limit: parsedLimit,
            offset: offset,
            order: [[sortBy, sortOrder.toUpperCase()]],
            subQuery: false
        });

        // Formater la réponse
        const formattedFlights = rows.map(flight => ({
            id: flight.id,
            
            status: flight.status,
            departureTime: flight.departureTime,
            arrivalTime: flight.arrivalTime,
            duration: flight.departureTime && flight.arrivalTime 
                ? Math.round((new Date(flight.arrivalTime) - new Date(flight.departureTime)) / (1000 * 60 * 60)) 
                : null,
            flight: flight.flight ? {
                id: flight.flight.id,
                name: flight.flight.name,
                company: flight.flight.companyVol,
                origin: flight.flight.origin,
                destination: flight.flight.destination       } : null,
            agency: flight.agency ? {
                id: flight.agency.id,
                name: flight.agency.name,
                logo: flight.agency.logo,
                description: flight.agency.description
            } : null,
            createdAt: flight.createdAt,
            updatedAt: flight.updatedAt
        }));

        // Statistiques supplémentaires
        const stats = {
            totalFlights: count,
            activeFlights: rows.filter(f => f.status === 'active').length,
            totalRevenue: rows.reduce((sum, flight) => sum + flight.price, 0),
            averagePrice: rows.length > 0 ? rows.reduce((sum, flight) => sum + flight.price, 0) / rows.length : 0
        };

        res.status(200).json({
            success: true,
            data: {
                agency: {
                    id: agency.id,
                    name: agency.name,
                    logo: agency.logo,
                    description: agency.description
                },
                flights: formattedFlights,
                stats,
                pagination: {
                    total: count,
                    page: parsedPage,
                    pages: Math.ceil(count / parsedLimit),
                    limit: parsedLimit
                }
            }
        });

    } catch (error) {
        console.error('❌ Erreur lors de la récupération des vols par agence:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la récupération des vols',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * 🚀 CRUD ClassAgency
 */
//exports.createClassAgency = async (req, res) => {
 // try {
  //  const { classId, agencyId, priceMultiplier, status } = req.body;
   // const newEntry = await ClassAgency.create({ classId, agencyId, priceMultiplier, status });
    //res.status(201).json(newEntry);
  //} catch (error) {
  //  res.status(500).json({ error: error.message });
//  }
//};
// avant a la place de flightClass on a class
//exports.getAllClassAgencies = async (req, res) => {
 // try {
  //  const data = await ClassAgency.findAll({ include: ["class", "agency"] });
//    res.json(data);
//  } catch (error) {
//    res.status(500).json({ error: error.message });
//  }
//};

// en haut etait le code 

exports.createClassAgency = async (req, res) => {
  try {
    const {
      classId,
      agencyVolId,
      price,
      status
    } = req.body;

    console.log("Creating ClassAgency with data:", { classId, agencyVolId, price, status });

    // 1️⃣ Vérifier la classe
    const existingClass = await Class.findByPk(classId);
    if (!existingClass) {
      return res.status(404).json({ message: "Classe non trouvée" });
    }

    // 2️⃣ Vérifier le vol agence (FlightAgency)
    const agencyVol = await FlightAgency.findByPk(agencyVolId);
    if (!agencyVol) {
      return res.status(404).json({ message: "Vol agence non trouvé" });
    }

    // 3️⃣ Vérifier doublon
    const existingEntry = await ClassAgency.findOne({
      where: {
        classId,
        agencyVolId
      }
    });

    if (existingEntry) {
      return res.status(400).json({
        message: "Cette classe est déjà configurée pour ce vol agence"
      });
    }

    // 4️⃣ Validation du prix
    if (!price || price <= 0) {
      return res.status(400).json({
        message: "Le prix est requis et doit être positif"
      });
    }

    // 5️⃣ Création
    const newClassAgency = await ClassAgency.create({
      classId,
      agencyVolId,
      price: parseFloat(price),
      status: status || "active"
    });

    // 6️⃣ Recharger avec les associations
    const result = await ClassAgency.findByPk(newClassAgency.id, {
      include: [
        {
          model: Class,
          as: "class"
        },
        {
          model: FlightAgency,
          as: "agencyVol",
          include: [
            {
              model: Agency,
              as: "agency"
            }
          ]
        }
      ]
    });

    return res.status(201).json(result);

  } catch (error) {
    console.error("Erreur dans createClassAgency:", error);
    return res.status(500).json({
      message: "Erreur lors de la création",
      error: error.message
    });
  }
};

// =======================================================
// GET ALL CLASS AGENCY
// Filtrage via agencyVol.agencyId (pas via classAgency)
// =======================================================

exports.getAllClassAgenciesDebut = async (req, res) => {
  try {
    const { agencyId } = req.query;

    const data = await ClassAgency.findAll({
      include: [
        {
          model: Class,
          as: "class"
        },
        {
          model: FlightAgency,
          as: "agencyVol",
          where: agencyId ? { agencyId } : undefined,
          include: [
            {
              model: Agency,
              as: "agency"
            }
          ]
        }
      ]
    });

    res.json(data);

  } catch (error) {
    res.status(500).json({
      message: "Error fetching classAgencies",
      error: error.message
    });
  }
};

exports.getAllClassAgencies = async (req, res) => {
  try {
    const { agencyId, flightId } = req.query;

    console.log('🔍 Paramètres reçus:', { agencyId, flightId });

    // Construction de la requête de base
    const queryOptions = {
      include: [
        {
          model: Class,
          as: "class",
          attributes: ['id', 'name']
        },
        {
          model: FlightAgency,
          as: "agencyVol",
          required: true,
          attributes: ['id', 'volId', 'agencyId', 'departureTime', 'arrivalTime'],
          include: [
            {
              model: Agency,
              as: "agency",
              attributes: ['id', 'name', 'logo', 'rating', 'description']
            },
            {
              model: Vol,
              as: "flight",
              attributes: ['id', 'name'],
              include: [
                {
                  model: Destination,
                  as: "origin",
                  attributes: ['id', 'name', 'city', 'country']
                },
                {
                  model: Destination,
                  as: "destination",
                  attributes: ['id', 'name', 'city', 'country']
                },
                {
                  model: Company,
                  as: "companyVol",
                  attributes: ['id', 'name']
                }
              ]
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    };

    // Ajouter des filtres si fournis
    if (agencyId) {
      // Filtrer par agence à travers la relation FlightAgency
      queryOptions.include[1].where = { agencyId: agencyId };
    }

    if (flightId) {
      // Filtrer par vol à travers la relation FlightAgency
      queryOptions.include[1].where = { 
        ...queryOptions.include[1].where,
        volId: flightId 
      };
    }

    // Exécuter la requête
    const classAgencies = await ClassAgency.findAll(queryOptions);

    console.log(`✅ ${classAgencies.length} ClassAgency trouvées`);

    // Formater la réponse pour inclure toutes les informations nécessaires
    const formattedData = classAgencies.map(item => {
      const data = item.get({ plain: true });
      
      return {
        id: data.id,
        classId: data.classId,
        price: data.price,
        priceMultiplier: data.priceMultiplier,
        status: data.status,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        
        // Informations de la classe
        class: data.class ? {
          id: data.class.id,
          name: data.class.name,
          
        } : null,
        
        // Informations du vol agence
        agencyVol: data.agencyVol ? {
          id: data.agencyVol.id,
          volId: data.agencyVol.volId,
          agencyId: data.agencyVol.agencyId,
          departureTime: data.agencyVol.departureTime,
          arrivalTime: data.agencyVol.arrivalTime,
          
          
          // Informations de l'agence
          agency: data.agencyVol.agency ? {
            id: data.agencyVol.agency.id,
            name: data.agencyVol.agency.name,
            logo: data.agencyVol.agency.logo,
            rating: data.agencyVol.agency.rating,
            description: data.agencyVol.agency.description
          } : null,
          
          // Informations du vol
          flight: data.agencyVol.flight ? {
            id: data.agencyVol.flight.id,
            name: data.agencyVol.flight.name,
            origin: data.agencyVol.flight.origin,
            destination: data.agencyVol.flight.destination,
            company: data.agencyVol.flight.companyVol
          } : null
        } : null
      };
    });

    res.json({
      success: true,
      count: formattedData.length,
      data: formattedData
    });

  } catch (error) {
    console.error('❌ Erreur dans getAllClassAgencies:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des classes",
      error: error.message
    });
  }
};

// =======================================================
// UPDATE CLASS AGENCY
// =======================================================
exports.updateClassAgency = async (req, res) => {
  try {

    const { id } = req.params;
    const { classId, agencyVolId, price, status } = req.body;

    const classAgency = await ClassAgency.findByPk(id);

    if (!classAgency) {
      return res.status(404).json({
        message: "Association non trouvée"
      });
    }

    // ---------------------------
    // Vérifier nouvelle classe
    // ---------------------------
    if (classId) {

      const existingClass = await Class.findByPk(classId);

      if (!existingClass) {
        return res.status(404).json({
          message: "Classe non trouvée"
        });
      }

      classAgency.classId = classId;
    }

    // ---------------------------
    // Vérifier nouveau vol agence
    // ---------------------------
    if (agencyVolId) {

      const agencyVol = await FlightAgency.findByPk(agencyVolId);

      if (!agencyVol) {
        return res.status(404).json({
          message: "Vol agence non trouvé"
        });
      }

      classAgency.agencyVolId = agencyVolId;
    }

    // ---------------------------
    // Vérifier doublon
    // ---------------------------
    if (classId || agencyVolId) {

      const duplicate = await ClassAgency.findOne({
        where: {
          classId: classAgency.classId,
          agencyVolId: classAgency.agencyVolId
        }
      });

      if (duplicate && duplicate.id !== parseInt(id)) {
        return res.status(400).json({
          message: "Cette classe existe déjà pour ce vol agence"
        });
      }
    }

    // ---------------------------
    // Modifier prix
    // ---------------------------
    if (price !== undefined) {

      const parsedPrice = parseFloat(price);

      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        return res.status(400).json({
          message: "Le prix doit être positif"
        });
      }

      classAgency.price = parsedPrice;
    }

    // ---------------------------
    // Modifier status
    // ---------------------------
    if (status) {
      classAgency.status = status;
    }

    await classAgency.save();

    const result = await ClassAgency.findByPk(id, {
      include: [
        {
          model: Class,
          as: "class"
        },
        {
          model: FlightAgency,
          as: "agencyVol",
          include: [
            {
              model: Agency,
              as: "agency"
            }
          ]
        }
      ]
    });

    return res.json({
      message: "Modification réussie",
      data: result
    });

  } catch (error) {

    console.error("Erreur updateClassAgency:", error);

    res.status(500).json({
      message: "Erreur lors de la mise à jour",
      error: error.message
    });
  }
};
exports.updateClassAgencyBon = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, status } = req.body;

    const classAgency = await ClassAgency.findByPk(id);

    if (!classAgency) {
      return res.status(404).json({ message: "Association non trouvée" });
    }

    // Mise à jour des champs
    if (price) {
      if (price <= 0) {
        return res.status(400).json({ message: "Le prix doit être positif" });
      }
      classAgency.price = parseFloat(price);
    }

    if (status) {
      classAgency.status = status;
    }

    await classAgency.save();

    // Recharger avec les associations
    const result = await ClassAgency.findByPk(id, {
      include: [
        {
          model: Class,
          as: "class"
        },
        {
          model: FlightAgency,
          as: "agencyVol",
          include: [
            {
              model: Agency,
              as: "agency"
            }
          ]
        }
      ]
    });

    return res.json(result);

  } catch (error) {
    console.error("Erreur dans updateClassAgency:", error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour",
      error: error.message
    });
  }
};

// =======================================================
// DELETE CLASS AGENCY
// =======================================================

exports.deleteClassAgency = async (req, res) => {
  try {
    const { id } = req.params;

    const classAgency = await ClassAgency.findByPk(id);

    if (!classAgency) {
      return res.status(404).json({ message: "ClassAgency not found" });
    }

    await classAgency.destroy();

    return res.json({
      message: "ClassAgency deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: "Error deleting classAgency",
      error: error.message
    });
  }
};





// exports.getAllClassAgencies = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const offset = (page - 1) * limit;
//     const search = req.query.search || '';
//     const status = req.query.status;

//     const whereClause = {
//       [Op.and]: [
//         search ? {
//           [Op.or]: [
//             { '$class.name$': { [Op.like]: `%${search}%` } },
//             { '$agency.name$': { [Op.like]: `%${search}%` } }
//           ]
//         } : {},
//         status ? { status } : {}
//       ]
//     };

//     const { count, rows } = await ClassAgency.findAndCountAll({
//       where: whereClause,
//       include: [
//         { model: Class, as: 'class' },
//         { model: Agency, as: 'agency' }
//       ],
//       attributes: ['id', 'price', 'status'],
//       limit,
//       offset,
//       order: [['createdAt', 'DESC']]
//     });

//     res.status(200).json({
//       success: true,
//       data: rows,
//       pagination: {
//         total: count,
//         page,
//         pages: Math.ceil(count / limit)
//       }
//     });
//   } catch (error) {
//     console.error('Error fetching classes:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

//exports.updateClassAgency = async (req, res) => {
 // try {
   // const { id } = req.params;
   // const updated = await ClassAgency.update(req.body, { where: { id } });
   // res.json({ message: "Mise à jour réussie", updated });
  //} catch (error) {
    //res.status(500).json({ error: error.message });
  //}
//};

// exports.getUserClassAgencies = async (req, res) => {
//   try {
//     const userId = req.user.id; // Assurez-vous que l'ID de l'utilisateur est disponible via l'authentification

//     // Vérifier si l'utilisateur est lié à une agence
//     const userAgency = await Agency.findOne({ where: { userId } });
//     if (!userAgency) {
//       return res.status(403).json({ error: "Vous n'êtes pas associé à une agence." });
//     }

//     // Récupérer les ClassAgency liées à l'agence de l'utilisateur
//     const classAgencies = await ClassAgency.findAll({
//       where: { agencyId: userAgency.id },
//       include: ["class", "agency"],
//     });

//     res.json(classAgencies);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// ============================================
// CONTROLLER: getClassAgenciesByFlight
// Récupère toutes les classes d'un vol spécifique
// ============================================
exports.getClassAgenciesByFlight = async (req, res) => {
  try {
    const { agencyVolId } = req.query;

    // Vérifier que l'ID du vol est fourni
    if (!agencyVolId) {
      return res.status(400).json({
        success: false,
        message: "L'ID du vol agence (agencyVolId) est requis"
      });
    }

    console.log(`🔍 Recherche des classes pour le vol agence ID: ${agencyVolId}`);

    // Vérifier que le vol existe
    const flightExists = await FlightAgency.findByPk(agencyVolId);
    if (!flightExists) {
      return res.status(404).json({
        success: false,
        message: "Vol agence non trouvé"
      });
    }

    // Récupérer toutes les classes pour ce vol
    const classAgencies = await ClassAgency.findAll({
      where: {
        agencyVolId: agencyVolId,
        status: 'active'
      },
      include: [
        {
          model: Class,
          as: "class",
          attributes: ['id', 'name']
        },
        {
          model: FlightAgency,
          as: "agencyVol",
          attributes: ['id', 'volId', 'agencyId', 'departureTime', 'arrivalTime'],
          include: [
            {
              model: Agency,
              as: "agency",
              attributes: ['id', 'name', 'logo']
            }
          ]
        }
      ],
      order: [['price', 'ASC']] // Trier par prix croissant
    });

    console.log(`✅ ${classAgencies.length} classes trouvées pour le vol ${agencyVolId}`);

    return res.status(200).json({
      success: true,
      count: classAgencies.length,
      data: classAgencies
    });

  } catch (error) {
    console.error("❌ Erreur dans getClassAgenciesByFlight:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des classes",
      error: error.message
    });
  }
};

// ============================================
// CONTROLLER: getClassAgencyByFlightAndClass
// Récupère une classe spécifique pour un vol
// ============================================
exports.getClassAgencyByFlightAndClass = async (req, res) => {
  try {
    const { agencyVolId, classId } = req.query;

    // Vérifier que les paramètres sont fournis
    if (!agencyVolId || !classId) {
      return res.status(400).json({
        success: false,
        message: "Les paramètres agencyVolId et classId sont requis"
      });
    }

    console.log(`🔍 Recherche de la classe ${classId} pour le vol ${agencyVolId}`);

    // Récupérer la classe spécifique
    const classAgency = await ClassAgency.findOne({
      where: {
        agencyVolId: agencyVolId,
        classId: classId,
        status: 'active'
      },
      include: [
        {
          model: Class,
          as: "class",
          attributes: ['id', 'name']
        },
        {
          model: FlightAgency,
          as: "agencyVol",
          attributes: ['id', 'volId', 'agencyId', 'departureTime', 'arrivalTime', 'price'],
          include: [
            {
              model: Agency,
              as: "agency",
              attributes: ['id', 'name', 'logo', 'rating']
            },
            {
              model: Vol,
              as: "flight",
              include: [
                {
                  model: Destination,
                  as: "origin"
                },
                {
                  model: Destination,
                  as: "destination"
                },
                {
                  model: Company,
                  as: "companyVol"
                }
              ]
            }
          ]
        }
      ]
    });

    if (!classAgency) {
      return res.status(404).json({
        success: false,
        message: `Aucune classe trouvée avec l'ID ${classId} pour le vol ${agencyVolId}`
      });
    }

    console.log(`✅ Classe trouvée: ${classAgency.class?.name} au prix de ${classAgency.price}`);

    return res.status(200).json({
      success: true,
      data: classAgency
    });

  } catch (error) {
    console.error("❌ Erreur dans getClassAgencyByFlightAndClass:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de la classe",
      error: error.message
    });
  }
};

// ============================================
// OPTIONNEL: Version pour récupérer une classe par son ID
// ============================================
exports.getClassAgencyById = async (req, res) => {
  try {
    const { id } = req.params;

    const classAgency = await ClassAgency.findByPk(id, {
      include: [
        {
          model: Class,
          as: "class"
        },
        {
          model: FlightAgency,
          as: "agencyVol",
          include: [
            {
              model: Agency,
              as: "agency"
            },
            {
              model: Vol,
              as: "flight",
              include: [
                { model: Destination, as: "origin" },
                { model: Destination, as: "destination" },
                { model: Company, as: "companyVol" }
              ]
            }
          ]
        }
      ]
    });

    if (!classAgency) {
      return res.status(404).json({
        success: false,
        message: "Classe non trouvée"
      });
    }

    return res.status(200).json({
      success: true,
      data: classAgency
    });

  } catch (error) {
    console.error("❌ Erreur dans getClassAgencyById:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de la classe",
      error: error.message
    });
  }
};
// ============================================
// CONTROLLER: getUserClassAgencies - CORRIGÉ
// ============================================
exports.getUserClassAgencies = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(403).json({ error: "User not authenticated" });
    }

    const userId = req.user.id;
    console.log(`🔍 Recherche des ClassAgency pour l'utilisateur ID: ${userId}`);

    // 1️⃣ Trouver l'agence de l'utilisateur
    const userAgency = await Agency.findOne({ where: { userId } });
    
    if (!userAgency) {
      return res.status(403).json({ 
        success: false,
        error: "Vous n'êtes pas associé à une agence." 
      });
    }

    console.log(`✅ Agence trouvée: ${userAgency.name} (ID: ${userAgency.id})`);

    // 2️⃣ Récupérer tous les FlightAgency de cette agence
    const flightAgencies = await FlightAgency.findAll({
      where: { agencyId: userAgency.id },
      attributes: ['id']
    });

    const flightAgencyIds = flightAgencies.map(fa => fa.id);
    
    if (flightAgencyIds.length === 0) {
      console.log('⚠️ Aucun vol trouvé pour cette agence');
      return res.json([]);
    }

    console.log(`✅ ${flightAgencyIds.length} vols trouvés pour l'agence`);

    // 3️⃣ Récupérer toutes les ClassAgency pour ces vols
    const classAgencies = await ClassAgency.findAll({
      where: {
        agencyVolId: { [Op.in]: flightAgencyIds },
        status: 'active'
      },
      include: [
        {
          model: Class,
          as: "class",
          attributes: ['id', 'name']
        },
        {
          model: FlightAgency,
          as: "agencyVol",
          required: true,
          attributes: ['id', 'volId', 'agencyId', 'departureTime', 'arrivalTime'],
          include: [
            {
              model: Agency,
              as: "agency",
              attributes: ['id', 'name', 'logo', 'rating']
            },
            {
              model: Vol,
              as: "flight",
              attributes: ['id', 'name'],
              include: [
                { model: Destination, as: "origin" },
                { model: Destination, as: "destination" },
                { model: Company, as: "companyVol" }
              ]
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log(`✅ ${classAgencies.length} ClassAgency trouvées pour l'agence ${userAgency.name}`);

    res.json({
      success: true,
      count: classAgencies.length,
      data: classAgencies
    });

  } catch (error) {
    console.error("❌ Error fetching class agencies:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch class agencies" 
    });
  }
};
exports.getUserClassAgenciesDebut = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(403).json({ error: "User not authenticated" });
    }

    const userId = req.user.id;

    // Vérifier si l'utilisateur est admin ou s'il a la permission "view_class_agencies"
    const hasPermission = req.isAdmin || req.hasPermission;

    let userAgency = null;
    if (!hasPermission) {
      userAgency = await Agency.findOne({ where: { userId } });
       console.log('clasAgenciesUser',userAgency)
      if (!userAgency) {
        return res.status(403).json({ error: "Vous n'êtes pas associé à une agence." });
      }
    }

    console.log("🔍 userAgency:", userAgency);

    // Définir la condition pour récupérer les ClassAgencies
    let whereCondition = hasPermission ? {} : { agencyId: userAgency.id };

    const classAgencies = await ClassAgency.findAll({
      where: whereCondition,
      include: ["class", "agency"],
    });

    res.status(200).json( classAgencies );
  } catch (error) {
    console.error("❌ Error fetching class agencies:", error);
    res.status(500).json({ error: "Failed to fetch class agencies" });
  }
};

exports.deleteClassAgencyTes = async (req, res) => {
  try {
    const { id } = req.params;
    await ClassAgency.destroy({ where: { id } });
    res.json({ message: "Suppression réussie" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getClassesByAgencyId = async (req, res) => {
  try {
    const { agencyId } = req.params;
    
    // Vérifier si l'agence existe
    const agency = await Agency.findByPk(agencyId);
    if (!agency) {
      return res.status(404).json({ error: "Agence non trouvée" });
    }

    const classAgencies = await ClassAgency.findAll({
      where: { agencyId },
      include: [
        { 
          model: Class, 
          as: "class",
          attributes: ['id', 'name',   'priceMultiplier']
        },
        { 
          model: Agency, 
          as: "agency",
          attributes: ['id', 'name']
        }
      ],
      order: [['classId', 'ASC']]
    });

    // Formater la réponse pour avoir un format plus lisible
    const formattedData = classAgencies.map(item => ({
      id: item.id,
      classId: item.classId,
      agencyId: item.agencyId,
      priceMultiplier: item.priceMultiplier,
      status: item.status,
      class: item.class ? {
        id: item.class.id,
        name: item.class.name,
        
   }:null,        
        // Calcul du prix final pour cette agence
       
      agency: item.agency ? {
        id: item.agency.id,
        name: item.agency.name,
        
        
      } : null
    }));

    res.json({
      success: true,
      count: formattedData.length,
      data: formattedData
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des classes par agencyId:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};
