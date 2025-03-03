const Product = require('../models/Product');

// Crear un nuevo producto
exports.createProduct = async (req, res) => {
    try {
        const { name, category, ingredientes, description, variants, availabilityStatus } = req.body;

        console.log('Datos recibidos:', JSON.stringify(req.body, null, 2));

        // Validación de campos obligatorios
        if (!name || !category || !ingredientes || !variants || !Array.isArray(variants)) {
            return res.status(400).json({ error: 'Faltan campos obligatorios o el formato es incorrecto.' });
        }

        // Extraer valores normalizados
        const categoryValue = typeof category === 'object' && category.value ? category.value : category;
        const availabilityStatusValue = typeof availabilityStatus === 'object' && availabilityStatus.value ? availabilityStatus.value : availabilityStatus || 'available';

        // Validación y normalización de variantes
        const validatedVariants = variants.map((variant, index) => {
            if (!variant.flavor || !variant.color || !variant.texture || !variant.shape || !variant.sizeStock) {
                return res.status(400).json({ error: `La variante en el índice ${index} tiene datos incompletos.` });
            }

            if (!Array.isArray(variant.sizeStock)) {
                return res.status(400).json({ error: `La variante en el índice ${index} debe tener un array de sizeStock.` });
            }

            // Validación de sizeStock
            variant.sizeStock = variant.sizeStock.map((sizeStock, sizeIndex) => {
                if (typeof sizeStock.size !== 'number' || sizeStock.size <= 0) {
                    return res.status(400).json({ error: `El sizeStock en el índice ${sizeIndex} de la variante en el índice ${index} debe tener size como un número positivo.` });
                }
                if (typeof sizeStock.stock !== 'number' || sizeStock.stock < 0) {
                    return res.status(400).json({ error: `El sizeStock en el índice ${sizeIndex} de la variante en el índice ${index} debe tener stock como un número no negativo.` });
                }
                if (typeof sizeStock.price !== 'number' || sizeStock.price <= 0) {
                    return res.status(400).json({ error: `El sizeStock en el índice ${sizeIndex} de la variante en el índice ${index} debe tener price como un número positivo.` });
                }

                return {
                    ...sizeStock,
                    availabilityStatus: sizeStock.availabilityStatus?.value || sizeStock.availabilityStatus || 'available'
                };
            });

            // Validación de imágenes
            if (variant.images && (!Array.isArray(variant.images) || !variant.images.every(img => typeof img === 'string' && img.startsWith('http')))) {
                return res.status(400).json({ error: `Las imágenes de la variante en el índice ${index} deben ser URLs válidas.` });
            }

            return {
                ...variant,
                availabilityStatus: variant.availabilityStatus?.value || variant.availabilityStatus || 'available'
            };
        });

        // Crear producto
        const product = new Product({
            name,
            category: categoryValue,
            ingredientes,
            description,
            availabilityStatus: availabilityStatusValue,
            variants: validatedVariants
        });

        // Guardar en la BD
        const savedProduct = await product.save();

        console.log('Producto creado:', savedProduct);
        res.status(201).json({ productId: savedProduct._id, message: 'Producto creado exitosamente.' });

    } catch (error) {
        console.error('Error durante la creación del producto:', error.message);
        res.status(500).json({ error: 'Error en el servidor. Intenta nuevamente.' });
    }
};


















// Obtener todos los productos
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener un producto por ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar un producto por ID
exports.updateProduct = async (req, res) => {
    console.log(req.body)
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Eliminar un producto por ID
exports.deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.status(200).json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
