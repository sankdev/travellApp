// controllers/volController.js
const  Vol  = require("../models/volModel");
const db = require("../models");
const notificationService = require("../services/notification.service");
const Class=require('../models/classModel')
const Reservation=require('../models/booking')

const volController = {
  // Créer un nouveau vol
  create: async (req, res) => {
    try {
      const vol = await Vol.create({
        ...req.body,
        createdBy: req.user?.id
      });

      // Notifier les agences actives
      const agencies = await db.Agency.findAll({
        include: [{ model: db.User }],
        where: { status: "active" }
      });

      const notifications = agencies.map((agency) =>
        notificationService.notify(
          agency.User.id,
          "NEW_FLIGHT",
          `New flight ${vol.name} has been added to the system`,
          agency.User.email
        )
      );
      await Promise.all(notifications);

      return res.status(201).json(vol);
    } catch (error) {
      console.error("Error creating flight:", error);
      return res.status(500).json({ message: error.message });
    }
  },

  // Obtenir tous les vols
  getAll: async (req, res) => {
    try {
      const vols = await Vol.findAll();
      return res.status(200).json(vols);
    } catch (error) {
      console.error("Error fetching flights:", error);
      return res.status(500).json({ message: error.message });
    }
  },

  // Obtenir un vol par ID
  getOne: async (req, res) => {
    try {
      const vol = await Vol.findByPk(req.params.id);
      if (!vol) {
        return res.status(404).json({ message: "Vol not found" });
      }
      return res.status(200).json(vol);
    } catch (error) {
      console.error("Error fetching flight:", error);
      return res.status(500).json({ message: error.message });
    }
  },

  // Mettre à jour un vol
  update: async (req, res) => {
    try {
      const vol = await Vol.findByPk(req.params.id);
      if (!vol) {
        return res.status(404).json({ message: "Vol not found" });
      }

      await vol.update({
        ...req.body,
        updatedBy: req.user?.id
      });
      return res.status(200).json(vol);
    } catch (error) {
      console.error("Error updating flight:", error);
      return res.status(500).json({ message: error.message });
    }
  },

  // Supprimer un vol
  delete: async (req, res) => {
    try {
      const vol = await Vol.findByPk(req.params.id);
      if (!vol) {
        return res.status(404).json({ message: "Vol not found" });
      }

      await vol.destroy();
      return res.status(200).json({ message: "Vol deleted successfully" });
    } catch (error) {
      console.error("Error deleting flight:", error);
      return res.status(500).json({ message: error.message });
    }
  },

  // Mettre à jour le statut d'un vol
  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const vol = await Vol.findByPk(id, {
        include: [
          {
            model: db.Reservation,
            include: [{ model: db.Customer, include: [{ model: db.User }] }]
          }
        ]
      });

      if (!vol) {
        return res.status(404).json({ message: "Flight not found" });
      }

      await vol.update({ status, updatedBy: req.user?.id });

      // Notifier les clients si le vol est annulé ou retardé
      if (["cancelled", "delayed"].includes(status)) {
        const notifications = vol.Reservations.map((reservation) =>
          notificationService.notify(
            reservation.Customer.User.id,
            `FLIGHT_${status.toUpperCase()}`,
            `Your flight ${vol.name} has been ${status}`,
            reservation.Customer.User.email
          )
        );
        await Promise.all(notifications);
      }

      return res.status(200).json({ message: "Flight status updated successfully" });
    } catch (error) {
      console.error("Error updating flight status:", error);
      return res.status(500).json({ message: error.message });
    }
  },

  // Obtenir les sièges disponibles pour un vol
  getAvailableSeats: async (req, res) => {
    try {
      const { id } = req.params;
      const vol = await Vol.findByPk(id, {
        include: [
          { model: Class },
          {
            model: Reservation,
            where: { status: "active" },
            required: false
          }
        ]
      });

      if (!vol) {
        return res.status(404).json({ message: "Flight not found" });
      }

      // Calculer les sièges disponibles
      const totalSeats = vol.totalSeats || 100; // Par défaut
      const bookedSeats = vol.Reservations.length;
      const availableSeats = totalSeats - bookedSeats;

      return res.status(200).json({
        totalSeats,
        bookedSeats,
        availableSeats
      });
    } catch (error) {
      console.error("Error fetching available seats:", error);
      return res.status(500).json({ message: error.message });
    }
  }
};

module.exports = volController;
