// routes/gallery.js
const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');

router.post('/gallery', galleryController.createGalleryItem);
router.get('/gallery', galleryController.getGallery);
router.get('/gallery/search', galleryController.searchGallery);

module.exports = router;