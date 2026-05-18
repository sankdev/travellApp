const { PaymentMode, Agency } = require("../models");

// ✅ Définir toutes les méthodes dans un seul objet
const paymentModeController = {
  // Créer un mode de paiement (version simple)
  async create(req, res) {
    try {
      const paymentMode = await PaymentMode.create(req.body);
      return res.status(201).json(paymentMode);
    } catch (error) {
      console.error("Error creating payment mode:", error);
      return res.status(500).json({ message: error.message });
    }
  },

  // Récupérer tous les modes de paiement
  async getAll(req, res) {
    try {
      const paymentModes = await PaymentMode.findAll();
      return res.status(200).json(paymentModes);
    } catch (error) {
      console.error("Error fetching payment modes:", error);
      return res.status(500).json({ message: error.message });
    }
  },

  // Récupérer les modes de paiement actifs
  async getPaymentModes(req, res) {
    try {
      const paymentModes = await PaymentMode.findAll({
        where: { status: 'active' }
      });
      res.status(200).json({
        status: 'success',
        data: paymentModes
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  // ✅ Créer un mode de paiement avec toutes les informations
  async createPaymentMode(req, res) {
    try {
      const { agencyId, type, organization, accountNumber, accountName, description, isDefault } = req.body;

      // Vérifier si l'agence existe
      const agency = await Agency.findByPk(agencyId);
      if (!agency) {
        return res.status(404).json({
          success: false,
          error: 'Agence non trouvée'
        });
      }

      // Si c'est le moyen par défaut, retirer le statut par défaut des autres
      if (isDefault) {
        await PaymentMode.update(
          { isDefault: false },
          { where: { agencyId, isDefault: true } }
        );
      }

      const paymentMode = await PaymentMode.create({
        agencyId,
        type,
        organization,
        accountNumber,
        accountName,
        description,
        isDefault: isDefault || false,
        createdBy: req.user?.id || null
      });

      res.status(201).json({
        success: true,
        data: paymentMode
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // ✅ Récupérer les modes de paiement par agence
  async getPaymentModesByAgency(req, res) {
    try {
      const { id } = req.params; // Utilisez 'id' au lieu de 'agencyId' pour correspondre à la route

      const paymentModes = await PaymentMode.findAll({
        where: {
          agencyId: id,
          status: 'active'
        },
        order: [
          ['isDefault', 'DESC'],
          ['type', 'ASC'],
          ['organization', 'ASC']
        ]
      });

      // Grouper par type pour faciliter l'affichage
      const grouped = {
        mobile_money: paymentModes.filter(pm => pm.type === 'mobile_money'),
        bank: paymentModes.filter(pm => pm.type === 'bank'),
        cash: paymentModes.filter(pm => pm.type === 'cash'),
        cheque: paymentModes.filter(pm => pm.type === 'cheque')
      };

      res.json({
        success: true,
        data: paymentModes,
        grouped: grouped
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // ✅ Mettre à jour un mode de paiement
  async updatePaymentMode(req, res) {
    try {
      const { id } = req.params;
      const { type, organization, accountNumber, accountName, description, isDefault, status } = req.body;

      const paymentMode = await PaymentMode.findByPk(id);
      if (!paymentMode) {
        return res.status(404).json({
          success: false,
          error: "Mode de paiement non trouvé"
        });
      }

      // Si c'est le moyen par défaut, retirer le statut par défaut des autres
      if (isDefault && !paymentMode.isDefault) {
        await PaymentMode.update(
          { isDefault: false },
          { where: { agencyId: paymentMode.agencyId, isDefault: true } }
        );
      }

      await paymentMode.update({
        type,
        organization,
        accountNumber,
        accountName,
        description,
        isDefault,
        status,
        updatedBy: req.user?.id || null
      });

      res.json({
        success: true,
        data: paymentMode
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // ✅ Supprimer (désactiver) un mode de paiement
  async deletePaymentMode(req, res) {
    try {
      const { id } = req.params;
      const paymentMode = await PaymentMode.findByPk(id);

      if (!paymentMode) {
        return res.status(404).json({
          success: false,
          error: "Mode de paiement non trouvé"
        });
      }

      // Soft delete (désactivation)
      await paymentMode.update({ status: 'inactive' });

      res.json({
        success: true,
        message: "Mode de paiement désactivé avec succès"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

// ✅ UN SEUL export à la fin
module.exports = paymentModeController;
