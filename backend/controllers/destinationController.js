const { Destination, Reservation } = require('../models');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Image = require('../models/image');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path =require('path')

exports.createDestination = async (req, res) => {
  const {
    name,
    location,
    address,
    city,
    country,
    continent,
    status,
    image1,
    image2,
    image3
  } = req.body;

  if (!name || !location || !address || !continent) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Création de la destination
  const destination = await Destination.create({
    name,
    location,
    address,
    city,
    country,
    continent,
    status: status || 'active',
    createdBy: req.user.id,
  });

  // Gestion des images base64
  const base64Images = [image1, image2, image3];
  const uploadDir = path.join(__dirname, '..', 'uploads');

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const imagePromises = base64Images.map(async (base64) => {
    if (
      base64 &&
      typeof base64 === 'string' &&
      base64.startsWith('data:image')
    ) {
      const matches = base64.match(/^data:(.+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        console.warn('Image ignorée (format base64 invalide)');
        return;
      }

      const mimeType = matches[1];
      const base64Data = matches[2];
      const extension = mimeType.split('/')[1];
      const filename = `destination_${uuidv4()}.${extension}`;
      const filepath = path.join(uploadDir, filename);

      fs.writeFileSync(filepath, Buffer.from(base64Data, 'base64'));

      return await Image.create({
        url: `/uploads/${filename}`,
        type: mimeType,
        destinationId: destination.id,
        createdBy: req.user.id,
      });
    }
  });

  await Promise.all(imagePromises);

  return res.status(201).json({
    status: 'success',
    data: destination,
  });
};
  


exports.getDestinationsRecherche = catchAsync(async (req, res) => {
    const { country, city, minPrice, maxPrice, search } = req.query;
    
    // Construire les conditions de recherche
    const where = { status: 'active' };
    if (country) where.country = country;
    if (city) where.city = city;
    if (minPrice) where.price = { [Op.gte]: minPrice };
    if (maxPrice) where.price = { ...where.price, [Op.lte]: maxPrice };
    if (search) {
        where[Op.or] = [
            { name: { [Op.like]: `%${search}%` } },
            { description: { [Op.like]: `%${search}%` } }
        ];
    }

    const destinations = await Destination.findAll({
        where,
        include: [
            {
                model: Reservation,
                as: 'reservations',
                attributes: ['id', 'status']
            }
        ]
    });

    res.status(200).json({
        status: 'success',
        results: destinations.length,
        data: destinations
    });
});
// all Destination
exports.getDestinations = async (req, res) => {
    try {
      const destinations = await Destination.findAll();
      return res.status(200).json(destinations);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to fetch destinations" });
    }
  };

exports.getDestination = catchAsync(async (req, res) => {
    const destination = await Destination.findByPk(req.params.id, {
        include: [
            {
                model: Reservation,
                as: 'reservations',
                attributes: ['id', 'status', 'startAt', 'endAt']
            }
        ]
    });

    if (!destination) {
        throw new AppError('Destination not found', 404);
    }

    res.status(200).json({
        status: 'success',
        data: destination
    });
});

exports.updateDestination = async (req, res) => {
  const { name, location, address, city, country, continent, status, image1, image2, image3 } = req.body;

  const destination = await Destination.findByPk(req.params.id);
  if (!destination) {
    throw new AppError('Destination not found', 404);
  }

  // Mise à jour des champs
  destination.name = name || destination.name;
  destination.location = location || destination.location;
  destination.address = address || destination.address;
  destination.city = city || destination.city;
  destination.country = country || destination.country;
  destination.continent = continent || destination.continent;
  destination.status = status || destination.status;
  destination.updatedBy = req.user.id;
  await destination.save();

  // Supprimer les anciennes images
  const oldImages = await Image.findAll({ where: { destinationId: destination.id } });
  for (const image of oldImages) {
    const filePath = path.join(__dirname, '..', image.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    await image.destroy();
  }

  // Traiter les nouvelles images en base64
  const base64Images = [image1, image2, image3];
  const uploadDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  for (const base64 of base64Images) {
    if (base64 && typeof base64 === 'string' && base64.startsWith('data:image')) {
      const matches = base64.match(/^data:(.+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error('Invalid base64 image format');
      }

      const mimeType = matches[1];
      const base64Data = matches[2];
      const extension = mimeType.split('/')[1];
      const filename = `destination_${uuidv4()}.${extension}`;
      const filepath = path.join(uploadDir, filename);

      fs.writeFileSync(filepath, Buffer.from(base64Data, 'base64'));

      await Image.create({
        url: `/uploads/${filename}`,
        type: mimeType,
        destinationId: destination.id,
        createdBy: req.user.id,
        updatedBy: req.user.id,
      });
    }
  }

  res.status(200).json({
    status: 'success',
    data: destination,
  });
};


exports.deleteDestination = catchAsync(async (req, res) => {
    const destination = await Destination.findByPk(req.params.id);
    if (!destination) {
        throw new AppError('Destination not found', 404);
    }

    // Soft delete - changer le statut plutôt que de supprimer
    destination.status = 'inactive';
    destination.updatedBy = req.user.id;
    await destination.save();

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.getDestinationStats = catchAsync(async (req, res) => {
    const stats = await Reservation.findAll({
        where: { destinationId: req.params.id },
        attributes: [
            'status',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status']
    });

    res.status(200).json({
        status: 'success',
        data: stats
    });
});
