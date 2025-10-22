// controllers/galleryController.js
const GalleryItem = require('../models/gallery');

const galleryController = {
    // Crear nuevo item en galería
    createGalleryItem: async(req, res) => {
        try {
            const galleryItem = new GalleryItem(req.body);
            await galleryItem.save();
            res.status(201).json(galleryItem);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Obtener galería con filtros
    getGallery: async(req, res) => {
        try {
            const { category, tag, featured } = req.query;
            let filter = { isActive: true };

            if (category) filter.categories = category;
            if (tag) filter.tags = tag;
            if (featured !== undefined) filter.featured = featured === 'true';

            const galleryItems = await GalleryItem.find(filter)
                .sort({ featured: -1, createdAt: -1 });

            res.json(galleryItems);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Buscar en galería
    searchGallery: async(req, res) => {
        try {
            const { q } = req.query;
            const results = await GalleryItem.find({
                isActive: true,
                $or: [
                    { title: { $regex: q, $options: 'i' } },
                    { description: { $regex: q, $options: 'i' } },
                    { tags: { $in: [new RegExp(q, 'i')] } },
                    { categories: { $in: [new RegExp(q, 'i')] } }
                ]
            });
            res.json(results);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = galleryController;