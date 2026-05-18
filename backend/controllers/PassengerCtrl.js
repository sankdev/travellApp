const Passenger = require("../models/Passenger");
const Reservation = require("../models/booking");

const PassengerController = {
  // Créer un nouveau passager
  async create(req, res) {
    try {
      const { firstName, lastName, gender, birthDate, birthPlace, nationality, profession, address, documentType, documentNumber,  status, reservationId } = req.body;
      const document = req.files.map(file => file.path);
      // Vérifier si la réservation existe
      const reservation = await Reservation.findByPk(reservationId);
      if (!reservation) {
        return res.status(404).json({ message: "Reservation not found" });
      }

      const passenger = await Passenger.create({
        firstName,
        lastName,
        gender,
        birthDate,
        birthPlace,
        nationality,
        profession,
        address,
        documentType, documentNumber,
        document,
        status,
        reservationId
      });

      return res.status(201).json(passenger);
    } catch (error) {
      console.error("Error creating passenger:", error);
      return res.status(500).json({ message: error.message });
    }
  },

  // Obtenir tous les passagers
  async getAll(req, res) {
    try {
      const passengers = await Passenger.findAll({
        include: [
          {
            model: Reservation,
            as: "reservation", // Alias défini dans la relation
          }
        ]
      });
      return res.status(200).json(passengers);
    } catch (error) {
      console.error("Error fetching passengers:", error);
      return res.status(500).json({ message: error.message });
    }
  },

  // Obtenir un passager par ID
  async getById(req, res) {
    try {
      const passenger = await Passenger.findByPk(req.params.id, {
        include: [
          {
            model: Reservation,
            as: "reservation", // Alias défini dans la relation
          }
        ]
      });

      if (!passenger) {
        return res.status(404).json({ message: "Passenger not found" });
      }

      return res.status(200).json(passenger);
    } catch (error) {
      console.error("Error fetching passenger:", error);
      return res.status(500).json({ message: error.message });
    }
  },

  // Mettre à jour un passager
  async update(req, res) {
    try {
      const passenger = await Passenger.findByPk(req.params.id);
      if (!passenger) {
        return res.status(404).json({ message: "Passenger not found" });
      } 

      const { firstName, lastName, gender, birthDate, birthPlace, nationality, profession, address, documentType, documentNumber, document, status } = req.body;

      await passenger.update({
        firstName,
        lastName,
        gender,
        birthDate,
        birthPlace,
        nationality,
        profession,
        address,
        documentType, documentNumber,
        document,
        status,
      });

      return res.status(200).json(passenger);
    } catch (error) {
      console.error("Error updating passenger:", error);
      return res.status(500).json({ message: error.message });
    }
  },

  // Supprimer un passager
  async delete(req, res) {
    try {
      const passenger = await Passenger.findByPk(req.params.id);
      if (!passenger) {
        return res.status(404).json({ message: "Passenger not found" });
      }

      await passenger.destroy();
      return res.status(200).json({ message: "Passenger deleted successfully" });
    } catch (error) {
      console.error("Error deleting passenger:", error);
      return res.status(500).json({ message: error.message });
    }
  },

  // Obtenir les passagers par réservation
  async getByReservation(req, res) {
    try {
      const reservationId = req.params.reservationId;

      // Vérifier si la réservation existe
      const reservation = await Reservation.findByPk(reservationId);
      if (!reservation) {
        return res.status(404).json({ message: "Reservation not found" });
      }

      const passengers = await Passenger.findAll({
        where: { reservationId },
      });

      return res.status(200).json(passengers);
    } catch (error) {
      console.error("Error fetching passengers by reservation:", error);
      return res.status(500).json({ message: error.message });
    }
  },
};

module.exports = PassengerController;
