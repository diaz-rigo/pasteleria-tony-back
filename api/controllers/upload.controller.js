
const path = require('path');
const fs = require('fs');
const cloudinary = require('../utils/cloudinary'); // Importa la configuración de Cloudinary



exports.uploadImagesToCloudinary = async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No se han enviado imágenes.' });
      }
  
      const uploadedImages = [];
      const uploadPromises = req.files.map(async (file) => {
        try {
          const result = await cloudinary.uploader.upload(file.path, { folder: 'productos' });
          uploadedImages.push(result.secure_url);
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (error) {
          console.error(`Error al subir ${file.originalname}:`, error);
        }
      });
  
      await Promise.all(uploadPromises);
      res.status(201).json({ images: uploadedImages });
    } catch (error) {
      console.error("Error al subir imágenes a Cloudinary:", error);
      res.status(500).json({ message: 'Ocurrió un error al subir las imágenes.', error });
    }
  };
  