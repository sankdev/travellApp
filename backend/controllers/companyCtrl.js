const Company = require("../models/Company");
const Image = require('../models/image');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');


exports.createCompany = async (req, res) => {
  const { name, status, image1, image2, image3 } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Company name is required" });
  }

  try {
    const company = await Company.create({
      name,
      status,
      createdBy: req.user.id,
    });

    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const imageFields = [image1, image2, image3];
    for (const base64 of imageFields) {
      if (base64 && typeof base64 === 'string' && base64.startsWith('data:image')) {
        const matches = base64.match(/^data:(.+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          throw new Error('Invalid base64 image format');
        }

        const mimeType = matches[1];
        const base64Data = matches[2];
        const extension = mimeType.split('/')[1];
        const filename = `company_image_${uuidv4()}.${extension}`;
        const filepath = path.join(uploadDir, filename);

        fs.writeFileSync(filepath, Buffer.from(base64Data, 'base64'));

        await Image.create({
          url: `/uploads/${filename}`,
          type: mimeType,
          companyId: company.id,
          createdBy: req.user.id,
          updatedBy: req.user.id,
        });
      }
    }

    return res.status(201).json({ message: "Company created successfully", company });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
};

exports.getCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll({
      include: [{
        model: Image,
        as: 'companyImages', // Use the correct alias
        required: false
      }]
    });
    return res.status(200).json(companies);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch companies" });
  }
};

exports.getCompanyById = async (req, res) => {
  const { id } = req.params;

  try {
    const company = await Company.findByPk(id, {
      include: [{
        model: Image,
        as: 'companyImages', // Use the correct alias
        required: false
      }]
    });
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }
    return res.status(200).json(company);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch company" });
  }
};

exports.updateCompany = async (req, res) => {
  const { id } = req.params;
  const { name, status, image1, image2, image3 } = req.body;

  try {
    const company = await Company.findByPk(id, {
      include: [{ model: Image,as:'companyImages' }],
    });

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    // 🧹 Supprimer les anciennes images de la base + disque
    if (company.companyImages && company.companyImages.length > 0) {
      for (const img of company.companyImages) {
        const imgPath = path.join(__dirname, '..', img.url);
        if (fs.existsSync(imgPath)) {
          fs.unlinkSync(imgPath); // supprime fichier
        }
        await img.destroy(); // supprime DB
      }
    }

    // ✅ Mettre à jour les infos de la société
    company.name = name || company.name;
    company.status = status || company.status;
    company.updatedBy = req.user.id;
    await company.save();

    // 📁 Créer le dossier si nécessaire
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 🖼️ Enregistrer les nouvelles images base64
    const imageFields = [image1, image2, image3];
    for (const base64 of imageFields) {
      if (base64 && typeof base64 === 'string' && base64.startsWith('data:image')) {
        const matches = base64.match(/^data:(.+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          throw new Error('Invalid base64 image format');
        }

        const mimeType = matches[1];
        const base64Data = matches[2];
        const extension = mimeType.split('/')[1];
        const filename = `company_image_${uuidv4()}.${extension}`;
        const filepath = path.join(uploadDir, filename);

        fs.writeFileSync(filepath, Buffer.from(base64Data, 'base64'));

        await Image.create({
          url: `/uploads/${filename}`,
          type: mimeType,
          companyId: company.id,
          createdBy: req.user.id,
          updatedBy: req.user.id,
        });
      }
    }

    return res.status(200).json({ message: "Company updated successfully", company });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
};
exports.deleteCompany = async (req, res) => {
  const { id } = req.params;

  try {
    const company = await Company.findByPk(id);
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    await company.update({
      status: 'deleted',
      updatedBy: req.user.id,
      updatedAt: new Date()
    });

    return res.status(200).json({ message: "Company deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to delete company" });
  }
};
