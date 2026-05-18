const { Payment, Invoice, PaymentMode } = require("../models");

const paymentController = {
  async create(req, res) {
    try {
      const payment = await Payment.create(req.body);
      return res.status(201).json(payment);
    } catch (error) {
      console.error("Error creating payment:", error);
      return res.status(500).json({ message: error.message });
    }
  },

  async getAll(req, res) {
    try {
      const payments = await Payment.findAll({
        include: [
          { model: Invoice, as: "invoice" },
          { model: PaymentMode, as: "paymentMode" },
        ],
      });
      return res.status(200).json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      return res.status(500).json({ message: error.message });
    }
  },
};

module.exports = paymentController;
