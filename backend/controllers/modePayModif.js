const  PaymentMode  = require("../models/paymentMode");

const paymentModeController = {
  async create(req, res) {
    try {
      const paymentMode = await PaymentMode.create(req.body);
      return res.status(201).json(paymentMode);
    } catch (error) {
      console.error("Error creating payment mode:", error);
      return res.status(500).json({ message: error.message });
    }
  },

  async getAll(req, res) {
    try {
      const paymentModes = await PaymentMode.findAll();
      return res.status(200).json(paymentModes);
    } catch (error) {
      console.error("Error fetching payment modes:", error);
      return res.status(500).json({ message: error.message });
    }
  },
  async getPaymentModes (req, res)  {
    const paymentModes = await PaymentMode.findAll({
        where: { status: 'active' }
    });
  
    res.status(200).json({
        status: 'success',
        data: paymentModes
    });
  }
};
exports.getPaymentModesByAgency= async (req, res)=> { try { const { agencyId } = req.params;
    
    const paymentModes = await PaymentMode.findAll({
      where: { 
        agencyId: agencyId,
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
};

exports.createPaymentMode =async (req, res) =>{
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
      createdBy: req.user.id
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
};
module.exports = paymentModeController;
