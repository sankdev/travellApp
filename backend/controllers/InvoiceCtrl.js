const Invoice  = require("../models/invoice");
const Payment=require('../models/payment')

const invoiceController = {
  async create(req, res) {
    try {
      const invoice = await Invoice.create(req.body);
      return res.status(201).json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      return res.status(500).json({ message: error.message });
    }
  },

  async getAll(req, res) {
    try {
      const invoices = await Invoice.findAll({ include: [{ model: Payment, as: "payments" }] });
      return res.status(200).json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      return res.status(500).json({ message: error.message });
    }
  },

  async getById(req, res) {
    try {
      const invoice = await Invoice.findByPk(req.params.id, { include: [{ model: Payment, as: "payments" }] });
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      return res.status(200).json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      return res.status(500).json({ message: error.message });
    }
  },
};

module.exports = invoiceController;
