const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define el esquema para el stock y tamaño con disponibilidad individual
const sizeStockSchema = new Schema({
    size: { type: Number, required: true, min: 1 },
    stock: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    availabilityStatus: { 
        type: String, 
        enum: ["available", "on_demand", "out_of_stock"], 
        default: "available" 
    }
});

// Define el esquema para las variantes del producto con disponibilidad
const variantSchema = new Schema({
    flavor: { type: String, required: true }, 
    color: { type: String, required: true }, 
    texture: { type: String, required: true }, 
    shape: { type: String, required: true }, 
    description: { type: String },
    availabilityStatus: { 
        type: String, 
        enum: ["available", "on_demand", "out_of_stock"], 
        default: "available" 
    },
    sizeStock: {
        type: [sizeStockSchema],
        required: true
    },
    images: {
        type: [String],
        required: true,
        validate: {
            validator: function(images) {
                return Array.isArray(images) && images.every(img => typeof img === 'string' && img.startsWith('http'));
            },
            message: props => `${props.value} no es una URL válida.`
        }
    }
});

// Define el esquema principal del producto con disponibilidad global
const productSchema = new Schema({
    name: { type: String, required: true },
    brand: { type: String, default: "Pastelería Tony" },
    category: { type: String, required: true },
    ingredientes: { type: String, required: true },
    description: { type: String },
    dateAdded: { type: Date, default: Date.now },
    isFeatured: { type: Boolean, default: false },
    availabilityStatus: { 
        type: String, 
        enum: ["available", "on_demand", "out_of_stock"], 
        default: "available" 
    },
    ratings: {
        average: { type: Number, default: 0 },
        reviews: [
            {
                userId: { type: Schema.Types.ObjectId, ref: 'User' },
                rating: { type: Number, required: true, min: 1, max: 5 },
                comment: { type: String }
            }
        ]
    },
    variants: { type: [variantSchema], required: true }
});

// Exportar modelo
const Product = mongoose.model('Product', productSchema);
module.exports = Product;
