const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for size and stock
const sizeStockSchema = new Schema({
    size: { type: Number, required: true },
    stock: { type: Number, required: true },
    price: { type: Number, required: true }
});

// Define the schema for product variants
const variantSchema = new Schema({
    flavor: { type: String, required: true }, // Sabor de la variante
    color: { type: String, required: true }, // Color de la variante
    texture: { type: String, required: true }, // Textura de la variante
    shape: { type: String, required: true }, // Forma de la variante (e.g., redondo, cuadrado, de corazón)
    description: { type: String }, // Descripción adicional
    sizeStock: {
        type: [sizeStockSchema],
        required: true
    },
    images: {
        type: [String],
        required: true,
        validate: {
            validator: function(images) {
                return Array.isArray(images) && images.every(img => typeof img === 'string');
            },
            message: props => `${props.value} should be an array of strings!`
        }
    }
});

// Define the main product schema
const productSchema = new Schema({
    name: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    material: { type: String, required: true },
    description: { type: String },
    dateAdded: { type: Date, default: Date.now },
    isFeatured: { type: Boolean, default: false },
    ratings: {
        average: { type: Number, default: 0 },
        reviews: [
            {
                userId: { type: Schema.Types.ObjectId, ref: 'User' },
                rating: { type: Number, required: true },
                comment: { type: String }
            }
        ]
    },
    variants: { type: [variantSchema], required: true }
});

// Create and export the Product model
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
