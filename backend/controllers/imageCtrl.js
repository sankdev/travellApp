const Image  = require("../models/image");
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const imageController = {
  // CREATE - Ajouter une nouvelle image
  createImage: async (req, res) => {
    try {
      const { image, type, size, status, campaignId, companyId, agencyId, destinationId, createdBy } = req.body;
                 console.log("images reqboy",req.body)
      // Validation : au moins une référence doit être spécifiée
      if (!campaignId && !companyId && !agencyId && !destinationId) {
        return res.status(400).json({ message: 'Image must be linked to at least one entity (campaign, company, agency, or destination).' });
      }

      const newImage = await Image.create({
        image,
        type,
        size,
        status,
        campaignId,
        companyId,
        agencyId,
        destinationId,
        createdBy
      });

      res.status(201).json(newImage);
    } catch (error) {
      res.status(500).json({ message: 'Error creating image', error });
    }
  },

  // CREATE - Ajouter des images pour une agence
  createImageForAgency: async (req, res) => {
    try {
      const { agencyId } = req.body;
      const imageFiles = req.files;

      if (!agencyId) {
        return res.status(400).json({ message: 'Agency ID is required' });
      }

      const images = await Promise.all(
        imageFiles.map(async (file) => {
          return await Image.create({
            url: file.path,
            type: file.mimetype,
            imageable_type: 'Agency',
            imageable_id: agencyId,
            createdBy: req.user.id,
          });
        })
      );

      res.status(201).json({ message: 'Images uploaded successfully', images });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to upload images' });
    }
  },


    createImageForEntity : async (req, res) => {
  try {
    const { entityId, entityType, images } = req.body;
    console.log("images reqboy",req.body)
    if (!entityId || !entityType) {
      return res.status(400).json({ message: 'Entity ID and type are required' });
    }

    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: 'No images provided' });
    }

    const columnMapping = {
      campaign: 'campaignId',
      company: 'companyId',
      agency: 'agencyId',
      destination: 'destinationId',
    };

    const column = columnMapping[entityType];
    if (!column) {
      return res.status(400).json({ message: 'Invalid entity type' });
    }

    console.log(`Creating images for entity: ${entityType} with ID: ${entityId}`);

    const savedImages = await Promise.all(
      images.map(async (img) => {
        const { base64, type } = img;
        if (!base64 || !type) {
          throw new Error('Invalid image format');
        }

        const extension = type.split('/')[1];
        const filename = `img_${uuidv4()}.${extension}`;
        const filePath = path.join(__dirname, '..', 'uploads', filename);

        fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));

        return await Image.create({
          url: `/uploads/${filename}`,
          type,
          [column]: parseInt(entityId, 10),
          createdBy: req.user.id,
        });
      })
    );

    res.status(201).json(savedImages);
  } catch (error) {
    console.error('createImageForEntity error:', error);
    res.status(400).json({ error: error.message });
  }
},

  // CREATE - Ajouter des images pour une entité
 // createImageForEntity: async (req, res) => {
   // try {
     // const { entityId, entityType } = req.body;
     // const imageFiles = req.files;
       //            console.log('req files',req.body);
     // if (!entityId || !entityType) {
      //  return res.status(400).json({ message: 'Entity ID and type are required' });
      //}

      //if (!imageFiles || imageFiles.length === 0) {
    //  return res.status(400).json({ message: 'No image files uploaded' });
  //  }

     // const columnMapping = {
      //  campaign: 'campaignId',
      //  company: 'companyId',
      //  agency: 'agencyId',
      //  destination: 'destinationId'
      //};

     // const column = columnMapping[entityType];
     // if (!column) {
      //  return res.status(400).json({ message: 'Invalid entity type' });
    //  }

     // console.log('Creating images for entity:', entityType, 'with ID:', entityId);

     // const images = await Promise.all(
       //  imageFiles.map(async (file) => {
        //  return await Image.create({
          //  url: file.path,
          //  type: file.mimetype,
        //    [column]: parseInt(entityId, 10), // Ensure entityId is an integer
    //        createdBy: req.user.id,
      //    });
  //      })
//      );

      //res.status(201).json({ message: 'Images uploaded successfully', images });
    //} catch (error) {
      //console.error('Error creating images:', error);
     // res.status(500).json({ error: 'Failed to upload images' });
    //}
  //}, 

  // READ - Récupérer une image par son ID 
  getImageById: async (req, res) => {
    try {
      const { id } = req.params;
      const image = await Image.findByPk(id);

      if (!image) {
        return res.status(404).json({ message: 'Image not found.' });
      }

      res.status(200).json(image);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving image', error });
    }
  },

  // READ - Récupérer toutes les images associées à une entité spécifique
  getImagesByEntity: async (req, res) => {
    try {
      const { entityType, entityId } = req.params;

      const columnMapping = {
        campaign: 'campaignId',
        company: 'companyId',
        agency: 'agencyId',
        destination: 'destinationId'
      };

      const column = columnMapping[entityType];
      if (!column) {
        return res.status(400).json({ message: 'Invalid entity type.' });
      }

      const images = await Image.findAll({
        where: { [column]: entityId }
      });

      res.status(200).json(images);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving images', error });
    }
  },

  // UPDATE - Mettre à jour une image
  updateImage: async (req, res) => {
    try {
      const { id } = req.params;
      const { image, type, size, status, campaignId, companyId, agencyId, destinationId, updatedBy } = req.body;

      const existingImage = await Image.findByPk(id);

      if (!existingImage) {
        return res.status(404).json({ message: 'Image not found.' });
      }

      // Mise à jour des champs
      await existingImage.update({
        image,
        type,
        size,
        status,
        campaignId,
        companyId,
        agencyId,
        destinationId,
        updatedBy
      });

      res.status(200).json(existingImage);
    } catch (error) {
      res.status(500).json({ message: 'Error updating image', error });
    }
  },
   updateImagesByEntity: async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const images = req.body; // Tableau d'objets { base64, type }
   console.log("images reqboy",req.body)
    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: 'No images provided' });
    }

    const columnMapping = {
      campaign: 'campaignId',
      company: 'companyId',
      agency: 'agencyId',
      destination: 'destinationId'
    };

    const column = columnMapping[entityType];
    if (!column) {
      return res.status(400).json({ message: 'Invalid entity type' });
    }

    // Supprimer les images existantes pour cette entité
    await Image.destroy({ where: { [column]: entityId } });

    const savedImages = [];

    for (const img of images) {
      const { base64, type } = img;

      if (!base64 || !type) {
        return res.status(400).json({ message: 'Missing base64 or type in one of the images' });
      }

      const extension = type.split('/')[1];
      const filename = `${entityType}_${uuidv4()}.${extension}`;
      const filePath = path.join(__dirname, '..', 'uploads', filename);

      // Sauvegarde locale du fichier
      const base64Data = base64.startsWith('data:') ? base64.split(',')[1] : base64;
      fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

      const newImage = await Image.create({
        url: `/uploads/${filename}`,
        type,
        [column]: parseInt(entityId, 10),
        createdBy: req.user.id
      });

      savedImages.push(newImage);
    }

    res.status(200).json({
      message: 'Images updated successfully',
      images: savedImages
    });

  } catch (error) {
    console.error('Error updating base64 images:', error);
    res.status(500).json({ message: 'Failed to update images', error: error.message });
  }
},  

  // DELETE - Supprimer une image
  deleteImage: async (req, res) => {
    try {
      const { id } = req.params;

      const image = await Image.findByPk(id);

      if (!image) {
        return res.status(404).json({ message: 'Image not found.' });
      }

      await image.destroy();

      res.status(200).json({ message: 'Image deleted successfully.' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting image', error });
    }
  } 
}; 

module.exports = imageController;
