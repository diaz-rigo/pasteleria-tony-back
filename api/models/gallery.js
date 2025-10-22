// models/gallery.js
const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const galleryItemSchema = new Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    images: [{
        url: { type: String, required: true },
        caption: { type: String, trim: true },
        category: { type: String, trim: true }, // "bautizo", "bodas", "cumpleaños", etc.
        tags: [String], // ["bautizo", "pastel", "decorado", "flores"]
        uploadDate: { type: Date, default: Date.now }
    }],
    categories: [String],
    tags: [String],
    isActive: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    // Opcional: referencia al producto si eventualmente identificas de cuál es
    relatedProductId: { type: Types.ObjectId, ref: 'Product' },
    relatedFlavor: { type: String } // "fresa", "chocolate", etc.
}, {
    timestamps: true
});

// Índices para búsquedas
galleryItemSchema.index({ categories: 1 });
galleryItemSchema.index({ tags: 1 });
galleryItemSchema.index({ featured: 1 });
galleryItemSchema.index({ isActive: 1 });

const GalleryItem = mongoose.model('GalleryItem', galleryItemSchema);
module.exports = GalleryItem;