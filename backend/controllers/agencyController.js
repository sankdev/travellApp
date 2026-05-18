const Agency = require('../models/agenceModel');
const AgencyFlight=require('../models/flightAgency.js')
const AgencyClass=require('../models/agencyClass')
const AgencyStatusHistory=require('../models/AgencyStatusHistory')
//const AgencyAssociation=require('../models/agencyAssociation.js)
const Reservation=require('../models/booking.js')
const User=require('../models/userModel')
const Image = require('../models/image');
const { sequelize } = require('../models'); // Import correct de l'instance
const { Op } = require('sequelize');
const path = require('path');
const checkPermission =require('../middleware/servicePermission.js')
const UserAgency=require('../models/userAgencies.js')
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');



// controllers/agencyController.js

exports.updateAgencyStatus = async (req, res) => {
  try {
    const { agencyId } = req.params;
    const { status } = req.body;
    const adminId = req.user.id; // ID de l'admin qui fait la modification

    // Validation du statut
    const allowedStatuses = ['active', 'inactive', 'suspended', 'pending'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide. Les statuts autorisés sont: active, inactive, suspended, pending'
      });
    }

    // Trouver l'agence
    const agency = await Agency.findByPk(agencyId, {
      include: [{
        model: Image,
        as: 'agencyImages',
        required: false
      }]
    });

    if (!agency) {
      return res.status(404).json({
        success: false,
        message: 'Agence non trouvée'
      });
    }

    // Sauvegarder l'ancien statut pour les logs
    const oldStatus = agency.status;

    // Mettre à jour le statut
    await agency.update({
      status,
      updatedBy: adminId
    });

    // Journaliser l'action
    console.log(`Admin ${adminId} a changé le statut de l'agence ${agencyId} de ${oldStatus} à ${status}`);

    res.status(200).json({
      success: true,
      message: `Statut de l'agence mis à jour avec succès de ${oldStatus} à ${status}`,
      data: {
        id: agency.id,
        name: agency.name,
        oldStatus,
        newStatus: status,
        updatedAt: agency.updatedAt
      }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du statut'
    });
  }
};

// Version étendue avec raison du changement
exports.updateAgencyStatusWithReason = async (req, res) => {
  try {
    const { agencyId } = req.params;
    const { status, reason } = req.body;
    const adminId = req.user.id;

    const allowedStatuses = ['active', 'inactive', 'suspended', 'pending'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }

    const agency = await Agency.findByPk(agencyId);
    if (!agency) {
      return res.status(404).json({
        success: false,
        message: 'Agence non trouvée'
      });
    }

    const oldStatus = agency.status;
    
    await agency.update({
      status,
      updatedBy: adminId
    });

    // Sauvegarder dans l'historique avec raison
    await AgencyStatusHistory.create({
      agencyId: agency.id,
      oldStatus,
      newStatus: status,
      changedBy: adminId,
      reason: reason || 'Changement manuel avec raison',
      changedAt: new Date()
    });

    console.log(`Admin ${adminId} a changé le statut de l'agence ${agencyId} de ${oldStatus} à ${status}. Raison: ${reason}`);

    res.status(200).json({
      success: true,
      message: `Statut mis à jour avec succès`,
      data: {
        id: agency.id,
        name: agency.name,
        oldStatus,
        newStatus: status,
        reason,
        updatedAt: agency.updatedAt
      }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Controller pour la mise à jour en lot des statuts
exports.bulkUpdateAgencyStatus = async (req, res) => {
  try {
    const { agencyIds, status, reason } = req.body;
    const adminId = req.user.id;

    // Validation des données
    if (!agencyIds || !Array.isArray(agencyIds) || agencyIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'La liste des IDs d\'agences est requise'
      });
    }

    const allowedStatuses = ['active', 'inactive', 'suspended', 'pending'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide. Les statuts autorisés sont: active, inactive, suspended, pending'
      });
    }

    // Trouver toutes les agences
    const agencies = await Agency.findAll({
      where: {
        id: agencyIds
      }
    });

    if (agencies.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Aucune agence trouvée avec les IDs fournis'
      });
    }

    const results = [];
    const failedUpdates = [];

    // Mettre à jour chaque agence
    for (const agency of agencies) {
      try {
        const oldStatus = agency.status;
        
        await agency.update({
          status,
          updatedBy: adminId
        });

        // Sauvegarder dans l'historique
        await AgencyStatusHistory.create({
          agencyId: agency.id,
          oldStatus,
          newStatus: status,
          changedBy: adminId,
          reason: reason || 'Mise à jour en lot',
          changedAt: new Date()
        });

        results.push({
          agencyId: agency.id,
          name: agency.name,
          oldStatus,
          newStatus: status,
          success: true
        });

      } catch (error) {
        console.error(`Erreur lors de la mise à jour de l'agence ${agency.id}:`, error);
        failedUpdates.push({
          agencyId: agency.id,
          name: agency.name,
          error: error.message
        });
      }
    }

    console.log(`Admin ${adminId} a mis à jour ${results.length} agences vers le statut ${status}`);

    res.status(200).json({
      success: true,
      message: `Mise à jour en lot terminée. ${results.length} agences mises à jour, ${failedUpdates.length} échecs`,
      data: {
        updated: results,
        failed: failedUpdates,
        totalProcessed: agencies.length,
        successful: results.length,
        failedCount: failedUpdates.length
      }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour en lot des statuts:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour en lot'
    });
  }
};

// Controller pour récupérer l'historique des statuts
exports.getStatusHistory = async (req, res) => {
  try {
    const { agencyId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Vérifier que l'agence existe
    const agency = await Agency.findByPk(agencyId);
    if (!agency) {
      return res.status(404).json({
        success: false,
        message: 'Agence non trouvée'
      });
    }

    // Récupérer l'historique avec pagination
    const { count, rows: history } = await AgencyStatusHistory.findAndCountAll({
      where: { agencyId },
      include: [{
        model: User,
        as: 'changedByUser',
        attributes: ['id', 'name', 'email'],
        required: false
      }],
      order: [['changedAt', 'DESC']],
      limit,
      offset
    });

    // Formater la réponse
    const formattedHistory = history.map(record => ({
      id: record.id,
      agencyId: record.agencyId,
      oldStatus: record.oldStatus,
      newStatus: record.newStatus,
      reason: record.reason,
      changedBy: record.changedBy,
      changedByUser: record.changedByUser ? {
        id: record.changedByUser.id,
        name: record.changedByUser.name,
        email: record.changedByUser.email
      } : null,
      changedAt: record.changedAt
    }));

    res.status(200).json({
      success: true,
      data: formattedHistory,
      pagination: {
        total: count,
        page,
        pages: Math.ceil(count / limit),
        limit
      },
      agencyInfo: {
        id: agency.id,
        name: agency.name,
        currentStatus: agency.status
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique des statuts:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération de l\'historique'
    });
  }
};
exports.createAgency = async (req, res) => {
  try {
    const {
      name, description, location, status, address,
      phone1, phone2, phone3, manager, secretary,
      logo, images // Maintenant nous utilisons un tableau 'images'
    } = req.body;

    if (!req.user?.id) {
      return res.status(400).json({ 
        success: false,
        message: 'User ID is missing' 
      });
    }
     // Vérification si l'utilisateur a déjà une agence
    const existingAgency = await Agency.findOne({ 
      where: { userId: req.user.id } 
    });

    if (existingAgency) {
      return res.status(400).json({
        success: false,
        message: 'You can only create one agency per user account'
      });
    }
    // Vérification des champs obligatoires
    if (!name || !location || !address) {
      return res.status(400).json({
        success: false,
        message: 'Name, location and address are required fields'
      });
    }

    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Traitement du logo
    let logoPath = null;
    if (logo && typeof logo === 'string' && logo.startsWith('data:image')) {
      try {
        const logoResult = await processBase64Image(logo, 'agency_logo', uploadDir);
        logoPath = `/uploads/${logoResult.filename}`;
      } catch (error) {
        console.error('Error processing logo:', error);
        return res.status(400).json({
          success: false,
          message: 'Invalid logo format',
          error: error.message
        });
      }
    }

    // Création de l'agence
    const newAgency = await Agency.create({
      name, 
      description, 
      location, 
      status: status || 'active', // Valeur par défaut
      address,
      phone1, 
      phone2, 
      phone3, 
      manager, 
      secretary,
      logo: logoPath, 
      userId: req.user.id,
      createdBy: req.user.id,
      updatedBy: req.user.id
    });

    // Traitement des images
    if (images && Array.isArray(images)) {
      for (const [index, imgData] of images.entries()) {
        if (imgData && typeof imgData === 'string' && imgData.startsWith('data:image')) {
          try {
            const imgResult = await processBase64Image(imgData, `agency_image_${index}`, uploadDir);
            
            await Image.create({
              url: `/uploads/${imgResult.filename}`,
              type: imgResult.mimeType,
              agencyId: newAgency.id,
              createdBy: req.user.id,
              updatedBy: req.user.id,
            });
          } catch (error) {
            console.error(`Error processing image ${index}:`, error);
            // Continuer même si une image échoue
          }
        }
      }
    }

    // Récupérer l'agence avec ses images pour la réponse
    const agencyWithImages = await Agency.findByPk(newAgency.id, {
      include: [{ model: Image, as: 'agencyImages' }]
    });

    return res.status(201).json({
      success: true,
      message: "Agency created successfully",
      agency: agencyWithImages
    });

  } catch (error) {
    console.error('createAgency error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to create agency',
      error: error.message 
    });
  }
};

// Fonction utilitaire pour traiter les images base64 (identique à celle de update)
async function processBase64Image(base64String, prefix, uploadDir) {
  const matches = base64String.match(/^data:(.+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid base64 image format');
  }

  const mimeType = matches[1];
  const base64Data = matches[2];
  const extension = mimeType.split('/')[1] || 'png';
  const filename = `${prefix}_${uuidv4()}.${extension}`;
  const filepath = path.join(uploadDir, filename);

  await fs.promises.writeFile(filepath, Buffer.from(base64Data, 'base64'));

  return { filename, mimeType, filepath };
}

//exports.createAgency = async (req, res) => {
 // try {
  //  const { name, description, location, status, address, phone1, phone2, phone3, manager, secretary } = req.body;
// console.log('req body',req.body)    
    // Correction : Stocker un chemin relatif
   // const logo = req.files?.logo ? `/uploads/${req.files.logo[0].filename}` : null;
 //     console('req body',req.body);
 // console('logo',logo);

   // if (!req.user || !req.user.id) {
    //  return res.status(400).json({ message: 'User ID is missing' });
  //  }

   // const newAgency = await Agency.create({
    //  name,
     // userId: req.user.id,
     // description,
   //   logo, // Correction ici
   //   location,
      //status,
    //  address,
    //  phone1,
    //  phone2,
     // manager,
     // secretary,
   // });

   // console.log('newAgency', newAgency);

    // Gérer les nouvelles images si elles sont fournies
   // if (req.files) {
     // const newImages = await Promise.all(
       // Object.values(req.files).flat().map(async (file) => {
         // if (!file.filename || !file.mimetype) {
          //  throw new Error('File path or mimetype is missing.');
        //  }

         // return await Image.create({
          //  url: `/uploads/${file.filename}`, // Correction ici
          //  type: file.mimetype,
          //  agencyId: newAgency.id,
          //  createdBy: req.user.id,
        //  });
      //  })
    //  );
    //  newAgency.images = newImages;
    //}

  //  res.status(201).json(newAgency);
    
//  } catch (error) {
  //  console.error(error);
  //  res.status(400).json({ error: error.message });
 // }
//};

// Obtenir toutes les agences avec pagination et filtres
exports.getAgenciesTes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status;
    const location = req.query.location;

    const whereClause = {
      [Op.and]: [
        search ? {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { description: { [Op.like]: `%${search}%` } }
          ]
        } : {},
        status ? { status } : {},
        location ? { location } : {}
      ]
    };

    const { count, rows } = await Agency.findAndCountAll({
      where: whereClause,
      include: [{
        model: Image,
        as: 'agencyImages', // Use the correct alias
        required: false
      }],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
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
    console.error('Error fetching agencies:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.getAgenciesProfile = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status;
    const location = req.query.location;

    const whereClause = {
      [Op.and]: [
        search ? {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { description: { [Op.like]: `%${search}%` } }
          ]
        } : {},
        status ? { status } : {},
        location ? { location } : {}
      ]
    };

    const { count, rows } = await Agency.findAndCountAll({
      where: whereClause,
      include: [{
        model: Image,
        as: 'agencyImages', // Use the correct alias
        required: false
      }],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
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
    console.error('Error fetching agencies:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Obtenir une agence spécifique
exports.getAgency = async (req, res) => {
  try {
    const agency = await Agency.findByPk(req.params.id, {
      include: [{
        model: Image,
        as: 'agencyImages', // Use the correct alias
        required: false
      }]
    });

    if (!agency) {
      return res.status(404).json({
        success: false,
        message: 'Agency not found'
      });
    }

    res.status(200).json({
      success: true,
      data: agency
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.getAgencies = async (req, res) => {
  try {
    const { Op } = require('sequelize');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status || 'active'; // Par défaut 'active'
    const location = req.query.location;
    const includeInactive = req.query.includeInactive === 'true'; // Option pour inclure les inactives

    const whereClause = {
      [Op.and]: [
        search ? {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { description: { [Op.like]: `%${search}%` } }
          ]
        } : {},
        // Si includeInactive est false, on filtre par status
        !includeInactive ? { status: 'active' } : 
          status ? { status } : {},

        location ? { location: { [Op.like]: `%${location}%` } } : {},

        // Exclure les agences soft delete si nécessaire
        { deletedAt: null }
      ].filter(condition => Object.keys(condition).length > 0) // Supprime les conditions vides
    };

    const { count, rows } = await Agency.findAndCountAll({
      where: whereClause,
      include: [{
        model: Image,
        as: 'agencyImages',
        required: false
      }],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page,
        pages: Math.ceil(count / limit)
      },
      filters: {
        search,
        status: includeInactive ? status : 'active',
        location,
        includeInactive
      }
    });
  } catch (error) {
    console.error('Error fetching agencies:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// exports.getUserAgencies = async (req, res) => { 

//   console.log("✅ getUserAgencies appelé !");
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(400).json({ error: "User ID is missing" });
//     }

//     let whereCondition = {};
    
//     // Si l'utilisateur N'EST PAS admin, filtrer par userId
//     if (!req.admin) {
//       whereCondition.userId = req.user.id;
//     }

//     const userAgencies = await Agency.findAll({
//       where: whereCondition,
//       include: [{
//         model: Image,
//         as: "agencyImages",
//         required: false
//       }],
//       order: [["createdAt", "DESC"]],
//     });

//     if (!userAgencies || userAgencies.length === 0) {
//       return res.status(404).json({ error: "No agencies found for this user" });
//     }

//     const formattedAgencies = userAgencies.map(agency => ({
//       ...agency.toJSON(),
//       logo: agency.logo ? `/uploads/${path.basename(agency.logo)}` : null
//     }));

//     res.status(200).json({
//       success: true,
//       data: formattedAgencies,
//     });
//   } catch (error) {
//     console.error("Error fetching user agencies:", error);
//     res.status(500).json({ error: "Failed to fetch agencies" });
//   }
// };

// exports.getUserAgencies = async (req, res) => {
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(400).json({ error: "User ID is missing" });
//     }

//     const userAgencies = await Agency.findAll({
//       where: { userId: req.user.id },
//       include: [{
//         model: Image,
//         as: 'agencyImages',
//         required: false
//       }], 
//       order: [['createdAt', 'DESC']],
//     });

//     if (!userAgencies || userAgencies.length === 0) {
//       return res.status(404).json({ error: "No agencies found for this user" });
//     }

//     // Transformer les chemins des logos
//     const formattedAgencies = userAgencies.map(agency => ({
//       ...agency.toJSON(),
//       logo: agency.logo ? `/uploads/${path.basename(agency.logo)}` : null
//     }));

//     res.status(200).json({
//       success: true,
//       data: formattedAgencies,
//     });
//   } catch (error) {
//     console.error("Error fetching user agencies:", error);
//     res.status(500).json({ error: "Failed to fetch agencies" });
//   }
// };
// exports.getUserAgencies = async (req, res) => {
//   try {
//     const connectedUserId = req.user.id;
//     const { userId } = req.query; // Permet d'afficher les agences d'un autre utilisateur si l'on a la permission

//     // Vérifier si l'utilisateur connecté a la permission "view_all_agencies"
//     const canViewAll = await checkPermission(connectedUserId, "view_all_agencies");

//     let agencies;
    
//     if (canViewAll && userId) {
//       // Si l'utilisateur a la permission spéciale et veut voir les agences d'un autre utilisateur
//       agencies = await Agency.findAll({
//         where: { userId },
//         include: [{ model: Image, as: "agencyImages", required: false }],
//         order: [["createdAt", "DESC"]],
//       });
//     } else {
//       // Sinon, il ne peut voir que ses propres agences
//       agencies = await Agency.findAll({
//         where: { userId: connectedUserId },
//         include: [{ model: Image, as: "agencyImages", required: false }],
//         order: [["createdAt", "DESC"]],
//       });
//     }

//     if (!agencies || agencies.length === 0) {
//       return res.status(404).json({ error: "Aucune agence trouvée." });
//     }

//     // Transformer les chemins des logos
//     const formattedAgencies = agencies.map((agency) => ({
//       ...agency.toJSON(),
//       logo: agency.logo ? `/uploads/${path.basename(agency.logo)}` : null,
//     }));

//     return res.status(200).json({
//       success: true,
//       data: formattedAgencies,
//     });
//   } catch (error) {
//     console.error("Erreur lors de la récupération des agences:", error);
//     return res.status(500).json({ error: "Erreur interne du serveur." });
//   }
// };
// Mettre à jour une agence
// exports.getUserAgencies = async (req, res) => {
//   console.log("✅ getUserAgencies appelé !");
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(403).json({ error: "User ID is missing" });
//     }

//     const userId = req.params.userId || req.user.id;  

//     // Vérifier si l'utilisateur est admin ou s'il accède à ses propres données
//     if (userId !== req.user.id && !req.isAdmin) {
//       return res.status(403).json({ error: "Access denied: User does not have permission" });
//     }

//     // Condition de filtrage : Si admin, il peut voir toutes les agences
//     let whereCondition = req.isAdmin ? {} : { userId }; 

//     const userAgencies = await Agency.findAll({
//       where: whereCondition,
//       include: [{
//         model: Image,
//         as: "agencyImages",
//         required: false
//       }],
//       order: [["createdAt", "DESC"]],
//     });

//     if (!userAgencies || userAgencies.length === 0) {
//       return res.status(404).json({ error: "No agencies found" });
//     }

//     const formattedAgencies = userAgencies.map(agency => ({
//       ...agency.toJSON(),
//       logo: agency.logo ? `/uploads/${path.basename(agency.logo)}` : null
//     }));

//     res.status(200).json({
//       success: true,
//       data: formattedAgencies,
//     });
//   } catch (error) {
//     console.error("Error fetching user agencies:", error);
//     res.status(500).json({ error: "Failed to fetch agencies" });
//   }
// };
// exports.getUserAgencies = async (req, res) => {
//   console.log("✅ getUserAgencies appelé !");
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(403).json({ error: "User not authenticated" });
//     }

//     const userId = req.user.id;

//     // Vérifier si l'utilisateur est admin ou s'il a la permission "view_user_agencies"
//     const hasPermission = req.isAdmin || req.hasPermission;

//     let userAgency = null;
//     if (!hasPermission) {
//       userAgency = await Agency.findOne({ where: { userId } });

//       if (!userAgency) {
//         return res.status(403).json({ error: "Vous n'êtes pas associé à une agence." });
//       }
//     }

//     console.log("🔍 userAgency:", userAgency);

//     // Condition pour récupérer les agences
//     let whereCondition = hasPermission ? {} : { id: userAgency.id };

//     const userAgencies = await Agency.findAll({
//       where: whereCondition,
//       include: [{
//         model: Image,
//         as: "agencyImages",
//         required: false
//       }],
//       order: [["createdAt", "DESC"]],
//     });

//     if (!userAgencies || userAgencies.length === 0) {
//       return res.status(404).json({ error: "No agencies found" });
//     }

//     const formattedAgencies = userAgencies.map(agency => ({
//       ...agency.toJSON(),
//       logo: agency.logo ? `/uploads/${path.basename(agency.logo)}` : null
//     }));

//     res.status(200).json({
//       success: true,
//       data: formattedAgencies,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching user agencies:", error);
//     res.status(500).json({ error: "Failed to fetch agencies" });
//   }
// };
// exports.getUserAgencies = async (req, res) => {
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(403).json({ error: "User not authenticated" });
//     }

//     const userId = req.user.id;
//     const hasPermission = req.isAdmin || req.hasPermission;

//     let agencyIds = [];

//     if (!hasPermission) {
//       const userAgencies = await UserAgency.findAll({ 
//         where: { userId },
//         attributes: ["agencyId"]
//       });

//       agencyIds = userAgencies.map(ua => ua.agencyId);
      
//       if (agencyIds.length === 0) {
//         return res.status(403).json({ error: "Vous n'êtes pas associé à une agence." });
//       }
//     }  

//     const whereCondition = hasPermission ? {} : { id: agencyIds };

//     const userAgencies = await Agency.findAll({
//       where: whereCondition,
//       include: [{ model: Image, as: "agencyImages", required: false }],
//       order: [["createdAt", "DESC"]],
//     });

//     if (!userAgencies.length) {
//       return res.status(404).json({ error: "Aucune agence trouvée" });
//     }

//     const formattedAgencies = userAgencies.map(agency => ({
//       ...agency.toJSON(),
//       logo: agency.logo ? `/uploads/${path.basename(agency.logo)}` : null
//     }));

//     res.status(200).json({ success: true, data: formattedAgencies });

//   } catch (error) {
//     console.error("❌ Erreur lors de la récupération des agences:", error);
//     res.status(500).json({ error: "Erreur serveur" });
//   }
// };
// exports.getUserAgencies = async (req, res) => {
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(403).json({ error: "Utilisateur non authentifié" });
//     }

//     const userId = req.user.id;
//     const hasPermission = req.isAdmin || req.hasPermission;
//     let agencyIds = [];

//     if (!hasPermission) {
//       const userAgencies = await UserAgency.findAll({
//         where: { userId },
//         attributes: ["agencyId"],
//       });

//       agencyIds = userAgencies.map((ua) => ua.agencyId);

//       if (agencyIds.length === 0) {
//         return res
//           .status(403)
//           .json({ error: "Vous n'êtes pas associé à une agence." });
//       }
//     }

//     const whereCondition = hasPermission ? {} : { id: agencyIds };

//     const userAgencies = await Agency.findAll({
//       where: whereCondition,
//       include: [{ model: Image, as: "agencyImages", required: false }],
//       order: [["createdAt", "DESC"]],
//     });

//     if (!userAgencies.length) {
//       return res.status(404).json({ error: "Aucune agence trouvée." });
//     }

//     const formattedAgencies = userAgencies.map((agency) => ({
//       ...agency.toJSON(),
//       logo: agency.logo ? `/uploads/${path.basename(agency.logo)}` : null,
//     }));

//     res.status(200).json({ success: true, data: formattedAgencies });
//   } catch (error) {
//     console.error("❌ Erreur lors de la récupération des agences:", error);
//     res.status(500).json({ error: "Erreur serveur" });
//   }
// };
// exports.getUserAgencies = async (req, res) => {
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(403).json({ error: "Utilisateur non authentifié" });
//     }

//     const userId = req.user.id;
//     const isAdmin = req.isAdmin;
//     let agencyIds = [];

//     if (isAdmin) {
//       // ✅ L'admin a accès à toutes les agences
//       agencyIds = [];
//     } else {
//       // ✅ Récupérer les agences créées par l'utilisateur
//       const createdAgencies = await Agency.findAll({
//         where: { userId },
//         attributes: ["id"],
//       });

//       // ✅ Récupérer les agences où l'utilisateur est affecté via UserAgency
//       const userAgencies = await UserAgency.findAll({
//         where: { userId },
//         attributes: ["agencyId"],
//       });
//       console.log('userAgencies',userAgencies)

//       agencyIds = [
//         ...new Set([
//           ...createdAgencies.map((a) => a.id),
//           ...userAgencies.map((ua) => ua.agencyId),
//         ]),
//       ];
//  console.log('agencyIds',agencyIds)
//       if (agencyIds.length === 0) {
//         return res.status(403).json({ error: "Vous n'êtes pas associé à une agence." });
//       }
//     }

//     // ✅ Filtrer les agences auxquelles l'utilisateur a accès
//     const whereCondition = isAdmin ? {} : { id: agencyIds };

//     const agencies = await Agency.findAll({
//       where: whereCondition,
//       include: [{ model: Image, as: "agencyImages", required: false }],
//       order: [["createdAt", "DESC"]],
//     });

//     if (!agencies.length) {
//       return res.status(404).json({ error: "Aucune agence trouvée." });
//     }

//     const formattedAgencies = agencies.map((agency) => ({
//       ...agency.toJSON(),
//       logo: agency.logo ? `/uploads/${path.basename(agency.logo)}` : null,
//     }));

//     res.status(200).json({ success: true, data: formattedAgencies });
//   } catch (error) {
//     console.error("❌ Erreur lors de la récupération des agences:", error);
//     res.status(500).json({ error: "Erreur serveur" });
//   }
// };
exports.getUserAgencies = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(403).json({ error: "Utilisateur non authentifié" });
    }

    const isAdmin = req.isAdmin;
    const agencyIds = isAdmin ? [] : req.accessibleAgencyIds;

    if (!isAdmin && (!agencyIds || agencyIds.length === 0)) {
      return res.status(403).json({ error: "Vous n'êtes pas associé à une agence." });
    }

    const whereCondition = isAdmin ? {} : { id: agencyIds };

    const agencies = await Agency.findAll({
      where: whereCondition,
      include: [{ model: Image, as: "agencyImages", required: false }],
      order: [["createdAt", "DESC"]],
    });

    if (!agencies.length) {
      return res.status(404).json({ error: "Aucune agence trouvée." });
    }

    const formattedAgencies = agencies.map((agency) => ({
      ...agency.toJSON(),
      logo: agency.logo ? `/uploads/${path.basename(agency.logo)}` : null,
    }));

    res.status(200).json({ success: true, data: formattedAgencies });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des agences:", error);
    res.status(500).json({ error: "Erreur serveur" });
}
 };

      
     exports.updateAgency = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    location,
    status,
    address,
    phone1,
    phone2,
    phone3,
    manager,
    secretary,
    logo,
    images // Supposons que c'est un tableau d'images
  } = req.body;

  console.log('req.body Agency', req.body);

  try {
    const agency = await Agency.findByPk(id, {
      include: [{ model: Image, as: 'agencyImages' }],
    });

    if (!agency) {
      return res.status(404).json({ success: false, message: 'Agency not found' });
    }

    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const updateData = {
      name,
      description,
      location,
      status,
      address,
      phone1,
      phone2,
      phone3,
      manager,
      secretary,
      updatedBy: req.user?.id,
      updatedAt: new Date(),
    };

    // 🖼️ Gestion du Logo
    if (logo && typeof logo === 'string' && logo.startsWith('data:image')) {
      try {
        const logoResult = await processBase64Image(logo, 'logo', uploadDir);
        updateData.logo = `/uploads/${logoResult.filename}`;

        // Supprimer ancien logo
        if (agency.logo) {
          await deleteOldFile(agency.logo);
        }
      } catch (error) {
        console.error('Error processing logo:', error);
        return res.status(400).json({
          success: false,
          message: 'Invalid logo format',
          error: error.message,
        });
      }
    }

    // ✍️ Mise à jour de l'agence
    await agency.update(updateData);

    // 🖼️ Gestion des Images
    if (images && Array.isArray(images)) {
      // 🧹 Suppression des anciennes images
      if (agency.agencyImages?.length > 0) {
        for (const img of agency.agencyImages) {
          await deleteOldFile(img.url);
          await img.destroy();
        }
      }

      // 📸 Sauvegarde des nouvelles images
      for (const [index, imgData] of images.entries()) {
        if (imgData && typeof imgData === 'string' && imgData.startsWith('data:image')) {
          try {
            const imgResult = await processBase64Image(imgData, `agency_image_${index}`, uploadDir);
            
            await Image.create({
              url: `/uploads/${imgResult.filename}`,
              type: imgResult.mimeType,
              agencyId: agency.id,
              createdBy: req.user?.id,
              updatedBy: req.user?.id,
            });
          } catch (error) {
            console.error(`Error processing image ${index}:`, error);
            // Continuer avec les autres images même si une échoue
          }
        }
      }
    }

    // Récupérer l'agence mise à jour avec ses images
    const updatedAgency = await Agency.findByPk(id, {
      include: [{ model: Image, as: 'agencyImages' }],
    });

    return res.status(200).json({
      success: true,
      message: 'Agency updated successfully',
      agency: updatedAgency,
    });

  } catch (error) {
    console.error('updateAgency error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update agency',
      error: error.message,
    });
  }
};

// Fonction utilitaire pour traiter les images base64
async function processBase64Image(base64String, prefix, uploadDir) {
  const matches = base64String.match(/^data:(.+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid base64 image format');
  }

  const mimeType = matches[1];
  const base64Data = matches[2];
  const extension = mimeType.split('/')[1] || 'png';
  const filename = `${prefix}_${uuidv4()}.${extension}`;
  const filepath = path.join(uploadDir, filename);

  await fs.promises.writeFile(filepath, Buffer.from(base64Data, 'base64'));

  return { filename, mimeType, filepath };
}

// Fonction utilitaire pour supprimer les anciens fichiers
async function deleteOldFile(filePath) {
  if (!filePath) return;

  const fullPath = path.join(__dirname, '..', filePath);
  try {
    await fs.promises.access(fullPath, fs.constants.F_OK);
    await fs.promises.unlink(fullPath);
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
  }
}

 
exports.deleteAgencyDef = async (req, res) => {
  try {
    const { userId } = req.user;
    const agency = await Agency.findByPk(req.params.id);

    if (!agency) {
      return res.status(404).json({
        success: false,
        message: 'Agency not found'
      });
    }

    // Vérifier les permissions (propriétaire ou admin)
    if (agency.userId !== req.user.id ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this agency'
      });
    }

    // Soft delete
    await agency.update({
      status: 'deleted',
      updatedBy: userId,
      updatedAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Agency deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.deleteAgency = async (req, res) => {
//  const t = await sequelize.transaction(); // Début de transaction

  try {
    const { userId } = req.user;
    const agency = await Agency.findByPk(req.params.id, {
      include: [
        { model: Image ,as: 'agencyImages'},
        { model: User,as:'User' },
        { model: Reservation , as:'agencyReservations' }
      ],
      //transaction: t
    });

    if (!agency) {
      //await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Agency not found'
      });
    }

    // Vérification des permissions (propriétaire ou admin)
    if (agency.userId !== userId ) {
      //await t.rollback();
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this agency'
      });
    }

    // Vérifier s'il y a des réservations actives
    const activeReservations = await Reservation.count({
      where: { 
        agencyId: agency.id,
        //status: { [Op.notIn]: ['cancelled', 'completed'] }
      },
     // transaction: t
    });

    //if (activeReservations > 0) {
     // await t.rollback();
    //  return res.status(400).json({
      //  success: false,
       // message: 'Cannot delete agency with active reservations'
     // });
    //}

    // Suppression des fichiers physiques
    const uploadDir = path.join(__dirname, '..', 'uploads');
    
    // Supprimer le logo
    if (agency.logo) {
      const logoPath = path.join(uploadDir, agency.logo.replace('/uploads/', ''));
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
      }
    }

    // Supprimer les images
    for (const image of agency.AgencyImages) {
      const imagePath = path.join(uploadDir, image.url.replace('/uploads/', ''));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
      await image.destroy();
    }

    // Supprimer toutes les associations
    await AgencyFlight.destroy({ where: { agencyId: agency.id } });
    await AgencyClass.destroy({ where: { agencyId: agency.id } });
    await AgencyAssociation.destroy({ where: { agencyId: agency.id } });

    // Supprimer les réservations associées (si soft delete n'est pas nécessaire)
   // await Reservation.destroy({ where: { agencyId: agency.id } });

    // Finalement supprimer l'agence
    await agency.destroy();

    // Si l'utilisateur est spécifique à cette agence, le supprimer aussi
    if (agency.User && agency.User.role === 'agency_owner') {
      await agency.User.destroy();
    }

    //await t.commit(); // Validation de la transaction

    res.status(200).json({
      success: true,
      message: 'Agency and all associated data deleted permanently'
    });

  } catch (error) {
//    await t.rollback();
    console.error('Error deleting agency:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete agency',
      error: error.message
    });
  }
};
// Statistiques des agences
exports.getAgencyStats = async (req, res) => {
  try {
    const totalAgencies = await Agency.count();
    const activeAgencies = await Agency.count({ where: { status: 'active' } });
    const recentAgencies = await Agency.findAll({
      where: {
        createdAt: {
          [Op.gte]: new Date(new Date() - 30 * 24 * 60 * 60 * 1000) // 30 derniers jours
        }
      },
      attributes: ['createdAt'],
      order: [['createdAt', 'DESC']]
    });

    const stats = {
      total: totalAgencies,
      active: activeAgencies,
      recent: recentAgencies.length,
      growthRate: ((recentAgencies.length / totalAgencies) * 100).toFixed(2)
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Recherche avancée d'agences
exports.searchAgencies = async (req, res) => {
  try {
    const {
      name,
      location,
      rating,
      status,
      startDate,
      endDate
    } = req.query;

    const whereClause = {
      [Op.and]: [
        name ? { name: { [Op.like]: `%${name}%` } } : {},
        location ? { location: { [Op.like]: `%${location}%` } } : {},
        rating ? { rating: { [Op.gte]: parseFloat(rating) } } : {},
        status ? { status } : {},
        startDate && endDate ? {
          createdAt: {
            [Op.between]: [new Date(startDate), new Date(endDate)]
          }
        } : {}
      ]
    };

    const agencies = await Agency.findAll({
      where: whereClause,
      include: [{
        model: Image,
        as: 'agencyImages', // Use the correct alias
        required: false
      }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: agencies
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
