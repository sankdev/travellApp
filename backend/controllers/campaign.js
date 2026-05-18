const Campaign = require("../models/compaign"); 
const Vol = require("../models/volModel");
const Image = require("../models/image");
const Company = require("../models/Company");
const Destination = require("../models/destinationModel");
const  Agency  = require("../models/agenceModel");
const sequelize=require('../config/bd')
const { Op } = require("sequelize");
const { v4: uuidv4 } = require('uuid'); // Pour générer des noms uniques
const fs = require('fs');
// exports.createCampaign = async (req, res) => {
//   const { title, type, description, condition, startAt, endAt, price, status, volId, agencyId } = req.body;

//   if (!agencyId) {
//     return res.status(400).json({ error: "Agency ID is required" });
//   }

//   try {
//     console.log('Request Body:', req.body); // Log request body for debugging
//     console.log('Agency ID:', agencyId); // Log agencyId for debugging
//     console.log('Files:', req.files); // Log files for debugging
//     const campaign = await Campaign.create({
//       title,
//       type,
//       description,
//       condition,
//       startAt,
//       endAt,
//       price,
//       status,
//       volId,
//       agencyId, // Include agencyId
//       createdBy: req.user.id, 
//     });

//     // Handle new images if provided
//     if (req.files) {
//       const newImages = await Promise.all(
//         Object.values(req.files).flat().map(async (file) => {
//           if (!file.path || !file.mimetype) {
//             throw new Error('File path or mimetype is missing.');
//           }

//           return await Image.create({
//             url: file.path,
//             type: file.mimetype,
//             campaignId: campaign.id,
//             createdBy: req.user.id,
//           });
//         })
//       );
//       campaign.images = newImages;
//     }

//     return res.status(201).json({ message: "Campaign created successfully", campaign });
//   } catch (error) {
//     console.error('Error creating campaign:', error);
//     return res.status(500).json({ error: "Failed to create campaign" });
//   }
// };
const path = require("path");

exports.createCampaign = async (req, res) => {
  const { title, type, description, condition, startAt, endAt, price, status, volId, agencyId, images } = req.body;

  if (!agencyId) {
    return res.status(400).json({ error: "Agency ID is required" });
  }

  try {
    console.log("Request Body:", req.body);

    const campaign = await Campaign.create({
      title,
      type,
      description,
      condition,
      startAt,
      endAt,
      price,
      status,
      volId: volId && volId !== "" ? parseInt(volId) : null,
      agencyId,
      createdBy: req.user.id,
    });

    // Traiter les images Base64
    if (images && images.length > 0) {
      const uploadDir = path.join(__dirname, '..', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const savedImages = await Promise.all(images.map(async (base64String) => {
        const matches = base64String.match(/^data:(.+);base64,(.+)$/);
        if (!matches) {
          throw new Error('Invalid base64 image format');
        }

        const mimeType = matches[1];
        const base64Data = matches[2];
        const extension = mimeType.split('/')[1];
        const filename = `image_${uuidv4()}.${extension}`;
        const filepath = path.join(uploadDir, filename);

        // Sauvegarder le fichier sur disque
        fs.writeFileSync(filepath, Buffer.from(base64Data, 'base64'));

        // Sauvegarder dans la base de données
        return await Image.create({
          url: `/uploads/${filename}`, // URL relative
          type: mimeType,
          campaignId: campaign.id,
          createdBy: req.user.id,
        });
      }));

      campaign.images = savedImages;
    }

    return res.status(201).json({ message: "Campaign created successfully", campaign });
  } catch (error) {
    console.error("Error creating campaign:", error);
    return res.status(500).json({ error: "Failed to create campaign" });
  }
};

exports.getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.findAll({
      include: [
        {
          model: Vol,
          as: "vol",
          include: [
            { model: Company, as: "companyVol" }, // Use the correct alias
            { model: Destination, as: "destination" }
          ]
        },
        { model: Image, as: "images" },
        { model: Agency, as: "associatedAgency" },

      ]
    });
    return res.status(200).json(campaigns);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch campaigns" });
  }
};
// exports.getCampaignsByUser = async (req, res) => {
//   try {
//     const userId = req.user.id; // Supposons que req.user contient l'utilisateur connecté après authentification

//     // Vérifier si l'utilisateur appartient à une agence
//     const agency = await Agency.findOne({ where: { userId } });

//     if (!agency) {
//       return res.status(403).json({ message: "Vous n'avez pas accès aux campagnes d'agence." });
//     }

//     // Récupérer uniquement les campagnes associées à cette agence
//     const campaigns = await Campaign.findAll({
//       where: { agencyId: agency.id }, 
//       include: [
//         {
//           model: Vol,
//           as: "vol",
//           include: [
//             { model: Company, as: "companyVol" },
//             { model: Destination, as: "destination" }
//           ]
//         },
//         { model: Image, as: "images" },
//         { model: Agency, as: "associatedAgency" },
//       ]
//     });

//     return res.status(200).json(campaigns);
//   } catch (error) {
//     console.error("Error fetching campaigns:", error);
//     return res.status(500).json({ error: "Failed to fetch campaigns" });
//   }
// };


exports.getCampaignsByUser = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(403).json({ message: "User ID is missing" });
    }

    // Si admin, il peut voir toutes les campagnes
    if (req.isAdmin) {
      const campaigns = await Campaign.findAll({
        include: [
          {
            model: Vol,
            as: "vol",
            include: [
              { model: Company, as: "companyVol" },
              { model: Destination, as: "destination" }
            ]
          },
          { model: Image, as: "images" },
          { model: Agency, as: "associatedAgency" },
        ]
      });

      return res.status(200).json(campaigns);
    }

    // Vérifie si une agence est liée à l'utilisateur
    const agency = await Agency.findOne({ where: { userId: req.user.id } });

    // Prépare la clause "where" dynamique
    const whereClause = {
      [Op.or]: []
    };

    // Inclure les campagnes associées à l'agence si elle existe
    if (agency) {
      whereClause[Op.or].push({ agencyId: agency.id });
    }

    // Toujours inclure les campagnes créées par l'utilisateur
    whereClause[Op.or].push({ createdBy: req.user.id });

    // Si aucune condition, refuser l'accès
    if (whereClause[Op.or].length === 0) {
      return res.status(403).json({ message: "Vous n'avez pas accès aux campagnes." });
    }

    // Récupérer les campagnes
    const campaigns = await Campaign.findAll({
      where: whereClause,
      include: [
        {
          model: Vol,
          as: "vol",
          include: [
            { model: Company, as: "companyVol" },
            { model: Destination, as: "destination" }
          ]
        },
        { model: Image, as: "images" },
        { model: Agency, as: "associatedAgency" },
      ]
    });

    return res.status(200).json(campaigns);

  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return res.status(500).json({ error: "Failed to fetch campaigns" });
  }
};


//exports.getCampaignsByUser = async (req, res) => {
 // try {
   // if (!req.user || !req.user.id) {
   //   return res.status(403).json({ message: "User ID is missing" });
    //}

    // Si admin, il peut voir toutes les campagnes
   // if (req.isAdmin) {
    //  const campaigns = await Campaign.findAll({
       // include: [
         // {
          //  model: Vol,
           // as: "vol",
            //include: [
             // { model: Company, as: "companyVol" },
             // { model: Destination, as: "destination" }
           // ]
         // },
       //   { model: Image, as: "images" },
        //  { model: Agency, as: "associatedAgency" },
      //  ]
    //  });

  //    return res.status(200).json(campaigns);
  //  }

    // Si utilisateur normal, récupérer l'agence associée
//    const agency = await Agency.findOne({ where: { userId: req.user.id } });

   // if (!agency) {
     // return res.status(403).json({ message: "Vous n'avez pas accès aux campagnes d'agence." });
   // }

    // Récupérer uniquement les campagnes associées à cette agence
   // const campaigns = await Campaign.findAll({
     // where: { agencyId: agency.id },
     // include: [
      //  {
      //    model: Vol,
      //    as: "vol",
        //  include: [
          //  { model: Company, as: "companyVol" },
           // { model: Destination, as: "destination" }
         // ]
       // },
     //   { model: Image, as: "images" },
     //   { model: Agency, as: "associatedAgency" },
   //   ]
 //   });

 //   return res.status(200).json(campaigns);
 // } catch (error) {
 //   console.error("Error fetching campaigns:", error);
 //   return res.status(500).json({ error: "Failed to fetch campaigns" });
 // }
//};

exports.getCampaignByIdTest = async (req, res) => {
  const { id } = req.params;
  try {
    const campaign = await Campaign.findByPk(id, {
      include: [
        {
          model: Vol,
          as: "vol",
          include: [
            { model: Company, as: "companyVol" },
            { model: Destination, as: "destination" },
          ],
        },
        { model: Image, as: "images" },
        { model: Agency, as: "associatedAgency" },
      ],


    });
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    return res.status(200).json(campaign);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch campaign" });
  }
};
exports.getCampaignById = async (req, res) => {
  const { id } = req.params;
  try {
    // Utiliser findOne au lieu de findByPk
    const campaign = await Campaign.findOne({
      where: { id },
      include: [
        {
          model: Vol,
          as: "vol",
          include: [
            { 
              model: Company, 
              as: "companyVol" 
            },
            { 
              model: Destination, 
              as: "destination" 
            },
            {
              model: Destination,
              as: "origin"
            },

          ],
        },
        { 
          model: Image, 
          as: "images" 
        },
        { 
          model: Agency, 
          as: "associatedAgency" 
        },
      ],
    });

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    // Si l'agence n'est toujours pas incluse, la récupérer manuellement
    if (!campaign.associatedAgency && campaign.agencyId) {
      const agency = await Agency.findByPk(campaign.agencyId);
      campaign.dataValues.associatedAgency = agency;
    }

    return res.status(200).json(campaign);
  } catch (error) {
    console.error('Error in getCampaignById:', error);
    return res.status(500).json({ error: "Failed to fetch campaign" });
  }
}; 
             
exports.updateCampaign = async (req, res) => {
  const { id } = req.params;
  const { title, type, description, condition, startAt, endAt, price, status, volId, images } = req.body;

  try {
    const campaign = await Campaign.findByPk(id, {
      include: [{ model: Image, as: 'images' }]
    });

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    // Mise à jour des champs principaux
    await campaign.update({
      title,
      type,
      description,
      condition,
      startAt,
      endAt,
      price,
      status,
      volId,
      updatedBy: req.user.id,
    });

    const uploadDir = path.join(__dirname, '..', 'uploads');

    // 🧹 1. Supprimer les anciennes images
    if (campaign.images && campaign.images.length > 0) {
      for (const img of campaign.images) {
        // Supprimer le fichier physique s'il existe
        const filePath = path.join(uploadDir, path.basename(img.url));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        // Supprimer l'enregistrement en base de données
        await img.destroy();
      }
    }

    // 🎨 2. Enregistrer les nouvelles images (Base64)
    if (images && images.length > 0) {
      const savedImages = await Promise.all(images.map(async (base64String) => {
        const matches = base64String.match(/^data:(.+);base64,(.+)$/);
        if (!matches) {
          throw new Error('Invalid base64 image format');
        }

        const mimeType = matches[1];
        const base64Data = matches[2];
        const extension = mimeType.split('/')[1];
        const filename = `image_${uuidv4()}.${extension}`;
        const filepath = path.join(uploadDir, filename);

        // Sauvegarder l'image sur disque
        fs.writeFileSync(filepath, Buffer.from(base64Data, 'base64'));

        // Créer l'entrée image en BDD
        return await Image.create({
          url: `/uploads/${filename}`,
          type: mimeType,
          campaignId: campaign.id,
          createdBy: req.user.id,
        });
      }));

      campaign.images = savedImages; // Remet à jour les images du campaign
    }

    return res.status(200).json({ message: "Campaign updated successfully with new images", campaign });
  } catch (error) {
    console.error("Error updating campaign:", error);
    return res.status(500).json({ error: "Failed to update campaign" });
  }
};

exports.deleteCampaign = async (req, res) => {
  const { id } = req.params;

  try {
    const campaign = await Campaign.findByPk(id);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    await campaign.destroy();
    return res.status(200).json({ message: "Campaign deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to delete campaign" });
  } 
};
  
exports.getActiveCampaigns = async (req, res) => {
  try {
    // Récupérer les campagnes où `endAt` est supérieur à la date du jour
    const activeCampaigns = await Campaign.findAll({
      where: {
        endAt: {
          [Op.gt]: new Date(), // Récupère les campagnes avec une date de fin future
        },
      },
      include: [
        {
          model: Vol,
          as: "vol",
          include: [
            { model: Company, as: "companyVol" }, 
            { model: Destination, as: "destination" },{
              model: Destination,
              as: "origin"
            },
          ],
        },
        { model: Image, as: "images" },
        { model: Agency, as: "associatedAgency" },
      ],
      order: [["endAt", "ASC"]], // Trie les campagnes par date de fin la plus proche
    });

    return res.status(200).json(activeCampaigns);
  } catch (error) {
    console.error("Error fetching active campaigns:", error);
    return res.status(500).json({ error: "Failed to fetch active campaigns" });
  }
};

// exports.getActiveCampaigns = async (req, res) => { 
//   try {
//     const today = new Date();

//     const activeCampaigns = await Campaign.findAll({
//       where: {
//         endAt: { [Op.gte]: today } // Récupère les campagnes dont endAt est >= à aujourd'hui
//       },
//       include: [
//         {
//           model: Vol,
//           as: "vol",
//           include: [
//             { model: Company, as: "companyVol" },
//             { model: Destination, as: "destination" }
//           ]
//         },
//         { model: Image, as: "images" },
//         { model: Agency, as: "associatedAgency" },
//       ],
//       order: [['endAt', 'ASC']] // Trie les campagnes par date de fin croissante
//     });

//     return res.status(200).json(activeCampaigns);
//   } catch (error) {
//     console.error("Error fetching active campaigns:", error);
//     return res.status(500).json({ error: "Failed to fetch active campaigns" });
//   }
// };
