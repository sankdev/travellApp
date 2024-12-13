const  Visa  = require("../models/visas");

exports.createVisa = async (req, res) => {
  const { reservationId, name, typeDocument, numDocument, document, status } = req.body;

  try {
    const visa = await Visa.create({
      reservationId,
      name,
      typeDocument,
      numDocument,
      document,
      status,
      createdBy: req.user.id,
    });

    return res.status(201).json({ message: "Visa created successfully", visa });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create visa" });
  }
};

exports.getVisasByReservation = async (req, res) => {
  const { reservationId } = req.params;

  try {
    const visas = await Visa.findAll({ where: { reservationId } });
    return res.status(200).json(visas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch visas" });
  }
};

exports.updateVisa = async (req, res) => {
  const { id } = req.params;
  const { name, typeDocument, numDocument, document, status } = req.body;

  try {
    const visa = await Visa.findByPk(id);

    if (!visa) {
      return res.status(404).json({ error: "Visa not found" });
    }

    visa.set({
      name,
      typeDocument,
      numDocument,
      document,
      status,
      updatedBy: req.user.id,
    });
    await visa.save();

    return res.status(200).json({ message: "Visa updated successfully", visa });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to update visa" });
  }
};

exports.deleteVisa = async (req, res) => {
  const { id } = req.params;

  try {
    const visa = await Visa.findByPk(id);

    if (!visa) {
      return res.status(404).json({ error: "Visa not found" });
    }

    await visa.destroy();
    return res.status(200).json({ message: "Visa deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to delete visa" });
  }
};
