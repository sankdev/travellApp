const Document = require("../models/document");

exports.createDocuments = async (req, res) => {
  try {
    const { relatedEntity, relatedEntityId, typeDocument, documentNumber, createdBy } = req.body;

    // Vérification de la présence des fichiers uploadés
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "Des fichiers documents sont requis" });
    }

    // Enregistrement des documents dans la base de données
    const documents = req.files.map(file => ({
      relatedEntity,
      relatedEntityId,
      typeDocument,
      documentNumber,
      documentPath: file.path, // Chemin du fichier uploadé
      createdBy,
    }));

    const newDocuments = await Document.bulkCreate(documents);

    res.status(201).json({
      message: "Documents créés avec succès",
      documents: newDocuments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la création des documents" });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const { relatedEntity, relatedEntityId } = req.params;

    const filter = {};
    if (relatedEntity) filter.relatedEntity = relatedEntity;
    if (relatedEntityId) filter.relatedEntityId = relatedEntityId;

    const documents = await Document.findAll({ where: filter });

    res.status(200).json({
      message: "Documents récupérés avec succès",
      documents,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la récupération des documents" });
  }
};

/**
 * Récupère un document par son ID.
 */
exports.getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findByPk(id);

    if (!document) {
      return res.status(404).json({ error: "Document non trouvé" });
    }

    res.status(200).json({
      message: "Document récupéré avec succès",
      document,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la récupération du document" });
  }
};

/**
 * Met à jour un document par son ID.
 */
exports.updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const document = await Document.findByPk(id);

    if (!document) {
      return res.status(404).json({ error: "Document non trouvé" });
    }

    // Mise à jour du document
    await document.update(updates);

    res.status(200).json({
      message: "Document mis à jour avec succès",
      document,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la mise à jour du document" });
  }
};

/**
 * Supprime un document par son ID.
 */
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findByPk(id);

    if (!document) {
      return res.status(404).json({ error: "Document non trouvé" });
    }

    // Suppression du document
    await document.destroy();

    res.status(200).json({
      message: "Document supprimé avec succès",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la suppression du document" });
  }
};

exports.getAllDocuments = async (req, res) => {
  try {
    const { relatedEntity, relatedEntityId } = req.query;

    const filter = {};
    if (relatedEntity) filter.relatedEntity = relatedEntity;
    if (relatedEntityId) filter.relatedEntityId = relatedEntityId;

    const documents = await Document.findAll({ where: filter });

    if (!documents || documents.length === 0) {
      return res.status(404).json({ message: "Aucun document trouvé." });
    }

    res.status(200).json({
      message: "Documents récupérés avec succès",
      documents,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des documents :", error);
    res.status(500).json({ error: "Erreur lors de la récupération des documents" });
  }
};