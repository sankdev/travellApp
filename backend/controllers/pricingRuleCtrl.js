const PricingRule = require("../models/pricingRule");
const Agency = require("../models/agenceModel");
const Company = require("../models/Company");
const AgencyVol = require("../models/flightAgency");
const AgencyClass = require("../models/agencyClass");
const  Vol  = require("../models/volModel");
const Class=require('../models/classModel');
const Destination = require("../models/destinationModel");
// 📌 Créer une règle tarifaire
exports.createPricingRule = async (req, res) => {
  try {
    const { agencyClassId, typePassenger, price } = req.body;
    const userId = req.user.id;

    // 1️⃣ Trouver l'agence du user
    const userAgency = await Agency.findOne({ where: { userId } });
    if (!userAgency) {
      return res.status(403).json({ error: "Aucune agence associée." });
    }

    // 2️⃣ Vérifier que la classe appartient à son agence
    const agencyClass = await AgencyClass.findOne({
      where: { id: agencyClassId },
      include: {
        model: AgencyVol,
        as: "agencyVol",
        where: { agencyId: userAgency.id }
      }
    });

    if (!agencyClass) {
      return res.status(403).json({ error: "Classe invalide pour votre agence." });
    }

    // 3️⃣ Vérifier doublon
    const existing = await PricingRule.findOne({
      where: { agencyClassId, typePassenger }
    });

    if (existing) {
      return res.status(400).json({
        error: "Une règle existe déjà pour ce type de passager."
      });
    }

    const newRule = await PricingRule.create({
      agencyClassId,
      typePassenger,
      price
    });

    res.status(201).json(newRule);

  } catch (error) {
    console.error("Erreur création pricing rule:", error);
    res.status(500).json({ error: "Erreur interne serveur" });
  }
};
// 📌 Obtenir toutes les règles tarifaires avec les modèles associé

     exports.getAllPricingRules = async (req, res) => {
    try {
        const pricingRules = await PricingRule.findAll({
            include: [
                { 
                    model: AgencyClass, 
                    as: "agencyClass",
                    include: [
                        {
                            model: AgencyVol,
                            as: "agencyVol",
                            include: [
                                {
                                    model: Vol,
                                    as: "flight",
                                    include: [
                                        { model: Company, as: "companyVol" },
                                        { model: Destination, as: "origin" },
                                        { model: Destination, as: "destination" }
                                    ]
                                },
                                {
                                    model: Agency,
                                    as: "agency"
                                }
                            ]
                        },
                        {
                            model: Class,
                            as: "class"
                        }
                    ]
                }
            ]
        });

        console.log(`✅ ${pricingRules.length} règles de prix récupérées`);
        res.json(pricingRules);
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des règles tarifaires :", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.getAllPricingRulesAncien = async (req, res) => {
    try {
        const pricingRules = await PricingRule.findAll({
            include: [
                { model: Agency, as: "agency" },
               
                { model: AgencyVol, as: "vol",include:[{model:Vol,as:'flight'}] },
                { model: AgencyClass, as: "class",include:[{model:Class,as:'class'}] }
            ]
        });

        res.json(pricingRules);
    } catch (error) {
        console.error("Erreur lors de la récupération des règles tarifaires :", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};
exports.getUserPricingRules = async (req, res) => {
  try {
    const userId = req.user.id;

    const userAgency = await Agency.findOne({ where: { userId } });
    if (!userAgency) {
      return res.status(403).json({ error: "Aucune agence associée." });
    }

    const pricingRules = await PricingRule.findAll({
      include: [
        {
          model: AgencyClass,
          as: "agencyClass",
          include: [
            {
              model: AgencyVol,
              as: "agencyVol",
              where: { agencyId: userAgency.id },
              include: [
                {
                  model: Vol,
                  as: "flight"
                }
              ]
            },
            {
              model: Class,
              as: "class"
            }
          ]
        }
      ]
    });

    res.json(pricingRules);

  } catch (error) {
    console.error("Erreur récupération pricing rules:", error);
    res.status(500).json({ error: "Erreur interne serveur" });
  }
};


// 📌 Obtenir une règle par ID avec les modèles associés
exports.getPricingRuleById = async (req, res) => {
  try {
    const { id } = req.params;

    const rule = await PricingRule.findByPk(id, {
      include: {
        model: AgencyClass,
        as: "agencyClass"
      }
    });

    if (!rule) {
      return res.status(404).json({ error: "Règle non trouvée" });
    }

    res.json(rule);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur interne serveur" });
  }
};

// 📌 Mettre à jour une règle tarifaire
exports.updatePricingRule = async (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;

    const pricingRule = await PricingRule.findByPk(id);
    if (!pricingRule) {
      return res.status(404).json({ error: "Règle non trouvée" });
    }

    await pricingRule.update({ price });

    res.json(pricingRule);

  } catch (error) {
    console.error("Erreur update pricing rule:", error);
    res.status(500).json({ error: "Erreur interne serveur" });
  }
};

// 📌 Supprimer une règle tarifaire
exports.deletePricingRule = async (req, res) => {
    try {
        const { id } = req.params;
        const pricingRuleId = parseInt(id, 10);

        if (isNaN(pricingRuleId)) {
            return res.status(400).json({ error: "ID invalide" });
        }

        const pricingRule = await PricingRule.findByPk(pricingRuleId);

        if (!pricingRule) {
            return res.status(404).json({ error: "Règle tarifaire non trouvée" });
        }

        await pricingRule.destroy();
        res.json({ message: "Règle tarifaire supprimée avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression de la règle tarifaire :", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};
