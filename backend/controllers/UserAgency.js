//const { UserAgency, User, Agency } = require("../models");
const User=require('../models/userModel')
const Agency=require('../models/agenceModel')
const UserAgency=require('../models/userAgencies')
/**
 * ✅ Assigner un utilisateur à une agence
 */
exports.assignUserToAgency = async (req, res) => {
  try {
    const { userId, agencyId } = req.body;

    if (!userId || !agencyId) {
      return res.status(400).json({ error: "userId et agencyId sont requis" });
    }

    // Vérifier si l'assignation existe déjà
    const existingAssignment = await UserAgency.findOne({ where: { userId, agencyId } });
    if (existingAssignment) {
      return res.status(400).json({ error: "L'utilisateur est déjà assigné à cette agence" });
    }

    // Création de l'assignation
    await UserAgency.create({ userId, agencyId });

    res.status(201).json({ success: true, message: "Utilisateur assigné avec succès à l'agence" });

  } catch (error) {
    console.error("❌ Erreur assignation utilisateur à agence:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/**
 * ✅ Révoquer un utilisateur d’une agence
 */
exports.revokeUserFromAgency = async (req, res) => {
  try {
    const { userId, agencyId } = req.body;

    if (!userId || !agencyId) {
      return res.status(400).json({ error: "userId et agencyId sont requis" });
    }

    const assignment = await UserAgency.findOne({ where: { userId, agencyId } });
    if (!assignment) {
      return res.status(404).json({ error: "Aucune assignation trouvée pour cet utilisateur et cette agence" });
    }

    await assignment.destroy();

    res.status(200).json({ success: true, message: "Utilisateur révoqué avec succès de l'agence" });

  } catch (error) {
    console.error("❌ Erreur révocation utilisateur de l'agence:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/**
 * ✅ Récupérer toutes les agences d'un utilisateur
 */
/**
 * ✅ Récupérer toutes les agences d'un utilisateur
 */
exports.getUserAgencies = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId est requis" });
    }

    const user = await User.findByPk(userId, {
      include: {
        model: Agency,
        as: "assignedAgencies", // Utilisation du bon alias défini dans les associations
        through: { attributes: [] },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.status(200).json({ success: true, data: user.assignedAgencies });

  } catch (error) {
    console.error("❌ Erreur récupération agences utilisateur:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/**
 * ✅ Récupérer tous les utilisateurs d'une agence
 */
exports.getAgencyUsers = async (req, res) => {
  try {
    const { agencyId } = req.params;

    if (!agencyId) {
      return res.status(400).json({ error: "agencyId est requis" });
    }

    const agency = await Agency.findByPk(agencyId, {
      include: {
        model: User,
        as: "assignedUsers", // Utilisation du bon alias défini dans les associations
        through: { attributes: [] },
      },
    });

    if (!agency) {
      return res.status(404).json({ error: "Agence non trouvée" });
    }

    res.status(200).json({ success: true, data: agency.assignedUsers });

  } catch (error) {
    console.error("❌ Erreur récupération utilisateurs agence:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
exports.removeUserFromAgency = async (req, res) => {
  try {
    let { userId, agencyId } = req.params;
 console.log('userId:',req.params)
    // Vérifier et forcer les types
    userId = parseInt(userId, 10);
    agencyId = parseInt(agencyId, 10);

    if (isNaN(userId) || isNaN(agencyId)) {
      return res.status(400).json({ error: "Les identifiants fournis sont invalides." });
    }

    const userAgency = await UserAgency.findOne({ where: { userId, agencyId } });
 console.log('userAgency:',userAgency)
    if (!userAgency) {
      return res.status(404).json({ error: "Utilisateur non assigné à cette agence." });
    }

    await userAgency.destroy();
    res.status(200).json({ success: true, message: "Utilisateur supprimé de l'agence." });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur de l'agence:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

