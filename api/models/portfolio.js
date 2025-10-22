// models/portfolio.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const portfolioImageSchema = new Schema({
    imageUrl: { type: String, required: true },
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    // Categorías principales
    eventType: {
        type: String,
        enum: ['bautizo', 'boda', 'cumpleaños', 'aniversario', 'graduación', 'otro'],
        default: 'otro'
    },
    productType: {
        type: String,
        enum: ['pastel', 'mousse', 'gelatina', 'postre', 'decoracion', 'otro'],
        default: 'otro'
    },
    // Etiquetas para búsqueda flexible
    tags: [String],
    // Información de estilo/estética
    colors: [String],
    theme: { type: String, trim: true }, // "vintage", "moderno", "infantil", etc.
    // Metadatos
    isFeatured: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
    uploadDate: { type: Date, default: Date.now },
    // Si eventualmente identificas el producto
    estimatedProduct: { type: String, trim: true }, // "Pastel de Tres Leches", "Mousse de Fresa", etc.
    estimatedFlavor: { type: String, trim: true }
}, {
    timestamps: true
});

// Índices para filtrado rápido
portfolioImageSchema.index({ eventType: 1 });
portfolioImageSchema.index({ productType: 1 });
portfolioImageSchema.index({ tags: 1 });
portfolioImageSchema.index({ isFeatured: 1 });
portfolioImageSchema.index({ uploadDate: -1 });

const PortfolioImage = mongoose.model('PortfolioImage', portfolioImageSchema);
module.exports = PortfolioImage;