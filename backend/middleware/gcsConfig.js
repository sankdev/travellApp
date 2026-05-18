const { Storage } = require('@google-cloud/storage');
const path = require('path');

// Instanciez le client GCS
const storage = new Storage({
  keyFilename: path.join(__dirname, '../path-to-your-service-account.json'), // Fichier de compte de service
  projectId: process.env.GCLOUD_PROJECT_ID,
});

const bucket = storage.bucket(process.env.GCS_BUCKET_NAME); // Nom du bucket

module.exports = bucket;
// const multer = require('multer');
// const { Storage } = require('@google-cloud/storage');
// const path = require('path');

// const storage = new Storage({
//   keyFilename: path.join(__dirname, '../path-to-your-service-account.json'),
// });

// const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);

// const upload = multer({
//   storage: multer.memoryStorage(),
// });

// module.exports = upload;
// // controller
// exports.uploadToGCS = async (req, res) => {
//     try {
//       const file = req.file;
  
//       const blob = bucket.file(`documents/${Date.now()}_${file.originalname}`);
//       const blobStream = blob.createWriteStream({
//         resumable: false,
//       });
  
//       blobStream.on('error', (err) => {
//         console.error(err);
//         res.status(500).json({ error: "Erreur lors de l'upload du fichier" });
//       });
  
//       blobStream.on('finish', async () => {
//         const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
  
//         const newDocument = await Document.create({
//           relatedEntity: req.body.relatedEntity,
//           relatedEntityId: req.body.relatedEntityId,
//           typeDocument: req.body.typeDocument,
//           documentPath: publicUrl, // URL publique du fichier
//           createdBy: req.body.createdBy,
//         });
  
//         res.status(201).json({
//           message: "Document stocké dans Google Cloud Storage avec succès",
//           document: newDocument,
//         });
//       });
  
//       blobStream.end(file.buffer);
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "Erreur lors de l'upload du fichier" });
//     }
  };
  