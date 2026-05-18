const Destination = require('../models/destinationModel.js');
const Image = require('../models/image');

exports.createDestination = async (req, res) => {
  const { name, location, address, city, country, continent, status } = req.body;
  
  console.log(req.body)
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

    // Handle new images if provided
    if (req.files) {
      const newImages = await Promise.all(
        Object.values(req.files).flat().map(async (file) => {
          if (!file.path || !file.mimetype) {
            throw new Error('File path or mimetype is missing.');
          }

          return await Image.create({
            url: file.path,
            type: file.mimetype,
            destinationId: destination.id,
            createdBy: req.user.id,
          });
        })
      );
      destination.images = newImages;
    }

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

    destination.name = name || destination.name;
    destination.location = location || destination.location;
    destination.address = address || destination.address;
    destination.city = city || destination.city;
    destination.country = country || destination.country;
    destination.continent = continent || destination.continent;
    destination.status = status || destination.status;
    destination.updatedBy = req.user.id;

    await destination.save();

    // Handle new images if provided
    if (req.files) {
      const newImages = await Promise.all(
        Object.values(req.files).flat().map(async (file) => {
          if (!file.path || !file.mimetype) {
            throw new Error('File path or mimetype is missing.');
          }

          return await Image.create({
            url: file.path,
            type: file.mimetype,
            destinationId: destination.id,
            createdBy: req.user.id,
          });
        })
      );
      destination.images = [...(destination.images || []), ...newImages];
    }

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
