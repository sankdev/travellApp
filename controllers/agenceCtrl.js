const { Agency } = require("../models/agenceModel");

const getAllAgencies = async (req, res) => {
  try {
    const agencies = await Agency.findAll();
    res.status(200).json(agencies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createAgency = async (req, res) => {
  try {
    const newAgency = await Agency.create(req.body);
    res.status(201).json(newAgency);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports={createAgency,getAllAgencies}