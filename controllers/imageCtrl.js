const Image  = require("../models/image");

exports.uploadImage = async (req, res) => {
  const { imageable_type, imageable_id, status } = req.body;

  try {
    const image = await Image.create({
      image_path: req.file.path, // Assurez-vous que req.file est configuré via multer ou une bibliothèque similaire
      imageable_type,
      imageable_id,
      status: status || "active",
      createdBy: req.user.id,
    });

    return res.status(201).json({ message: "Image uploaded successfully", image });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to upload image" });
  }
};

exports.getImagesForEntity = async (req, res) => {
  const { imageable_type, imageable_id } = req.params;

  try {
    const images = await Image.findAll({
      where: { imageable_type, imageable_id },
    });

    return res.status(200).json(images);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch images" });
  }
};
