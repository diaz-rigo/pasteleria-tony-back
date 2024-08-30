const Product = require('../models/Product');

// Crear un nuevo producto
exports.createProduct = async (req, res) => {
    const { name, brand, category, material, description, variants } = req.body;

    // Imprimir los datos recibidos
    console.log('Datos recibidos:', JSON.stringify(req.body, null, 2));

    try {
        // Validar campos obligatorios
        const requiredFields = ['name', 'brand', 'category', 'material', 'variants'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({ error: `Faltan campos requeridos: ${missingFields.join(', ')}` });
        }

        // Establecer valores por defecto para variantes
        const defaultTexture = 'Suave'; // Valor por defecto para texture
        const defaultImages = ['default1.jpg', 'default2.jpg']; // Valor por defecto para imágenes
        const defaultFlavor = 'Sin especificar'; // Valor por defecto para flavor
        const defaultShape = 'Redondo'; // Valor por defecto para shape

        const validatedVariants = variants.map((variant, index) => {
            if (typeof variant.flavor !== 'string' || variant.flavor.trim().length === 0) {
                variant.flavor = defaultFlavor;
            }

            if (typeof variant.color !== 'string') {
                throw new Error(`La variante en el índice ${index} debe tener color como string.`);
            }

            // Establecer valor por defecto para texture
            if (typeof variant.texture !== 'string' || variant.texture.trim().length === 0) {
                variant.texture = defaultTexture;
            }

            // Establecer valor por defecto para shape
            if (typeof variant.shape !== 'string' || variant.shape.trim().length === 0) {
                variant.shape = defaultShape;
            }

            // Validar y establecer valor por defecto para images
            if (!Array.isArray(variant.images) || variant.images.some(image => typeof image !== 'string')) {
                variant.images = defaultImages;
            }

            // Validar sizeStock
            if (!Array.isArray(variant.sizeStock)) {
                throw new Error(`La variante en el índice ${index} debe tener un array de sizeStock.`);
            }
            variant.sizeStock.forEach((sizeStock, sizeIndex) => {
                if (typeof sizeStock.size !== 'number' || sizeStock.size <= 0) {
                    throw new Error(`El sizeStock en el índice ${sizeIndex} de la variante en el índice ${index} debe tener size como un número positivo.`);
                }
                if (typeof sizeStock.stock !== 'number' || sizeStock.stock < 0) {
                    throw new Error(`El sizeStock en el índice ${sizeIndex} de la variante en el índice ${index} debe tener stock como un número no negativo.`);
                }
                if (typeof sizeStock.price !== 'number' || sizeStock.price <= 0) {
                    throw new Error(`El sizeStock en el índice ${sizeIndex} de la variante en el índice ${index} debe tener price como un número positivo.`);
                }
            });

            return variant;
        });

        // Crear el producto
        const product = new Product({
            name,
            brand,
            category,
            material,
            description,
            variants: validatedVariants
        });

        // Guardar el producto en la base de datos
        const savedProduct = await product.save();

        // Imprimir el producto creado
        console.log('Producto creado:', savedProduct);

        // Responder con el ID del producto creado
        res.status(201).json({ productId: savedProduct._id, message: 'Producto creado exitosamente.' });

    } catch (error) {
        console.error('Error durante la creación del producto:', error.message);
        res.status(400).json({ error: error.message });
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
