const Destination=require('../models/destinationModel.js')

exports.createDestination = async (req, res) => {
  const { name, location, address, city, country, continent, status } = req.body;

  try {
    const destination = await Destination.create({
      name,
      location,
      address,
      city,
      country,
      continent,
      status,
      createdBy: req.user.id,
    });

    return res.status(201).json({ message: "Destination created successfully", destination });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create destination" });
  }
};

exports.getAllDestinations = async (req, res) => {
  try {
    const destinations = await Destination.findAll();
    return res.status(200).json(destinations);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch destinations" });
  }
};

exports.updateDestination = async (req, res) => {
  const { id } = req.params;
  const { name, location, address, city, country, continent, status } = req.body;

  try {
    const destination = await Destination.findByPk(id);

    if (!destination) {
      return res.status(404).json({ error: "Destination not found" });
    }

    destination.set({
      name,
      location,
      address,
      city,
      country,
      continent,
      status,
      updatedBy: req.user.id,
    });
    await destination.save();

    return res.status(200).json({ message: "Destination updated successfully", destination });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to update destination" });
  }
};

exports.deleteDestination = async (req, res) => {
  const { id } = req.params;

  try {
    const destination = await Destination.findByPk(id);

    if (!destination) {
      return res.status(404).json({ error: "Destination not found" });
    }

    await destination.destroy();
    return res.status(200).json({ message: "Destination deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to delete destination" });
  }
};
