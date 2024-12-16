const { Product } = require('../models');

const productController = {
    // Obtener todos los productos
    getAllProducts: async (req, res) => {
        try {
            const products = await Product.findAll();
            return res.status(200).json({
                success: true,
                data: products
            });
        } catch (error) {
            console.error('Error al obtener productos:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener productos',
                error: error.message
            });
        }
    },

    // Obtener un producto específico
    getProductById: async (req, res) => {
        try {
            const { id } = req.params;
            console.log('Buscando producto con ID:', id);

            // Validar que el ID sea un número
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de producto inválido'
                });
            }

            const product = await Product.findByPk(id);
            console.log('Producto encontrado:', product);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró el producto con ID ${id}`
                });
            }

            return res.status(200).json({
                success: true,
                data: product
            });
        } catch (error) {
            console.error('Error al obtener producto:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener el producto',
                error: error.message
            });
        }
    },

    // Crear producto
    createProduct: async (req, res) => {
        try {
            const { name, description, price, stock, category, imageUrl } = req.body;

            if (!name || !price) {
                return res.status(400).json({
                    success: false,
                    message: 'Nombre y precio son requeridos'
                });
            }

            const newProduct = await Product.create({
                name,
                description,
                price,
                stock: stock || 0,
                category,
                imageUrl
            });

            return res.status(201).json({
                success: true,
                message: 'Producto creado exitosamente',
                data: newProduct
            });
        } catch (error) {
            console.error('Error al crear producto:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al crear producto',
                error: error.message
            });
        }
    },

    // Actualizar producto
    updateProduct: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, description, price, stock, category, imageUrl } = req.body;

            const product = await Product.findByPk(id);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            const updateData = {};
            if (name) updateData.name = name;
            if (description !== undefined) updateData.description = description;
            if (price) updateData.price = price;
            if (stock !== undefined) updateData.stock = stock;
            if (category !== undefined) updateData.category = category;
            if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

            await product.update(updateData);

            return res.status(200).json({
                success: true,
                message: 'Producto actualizado exitosamente',
                data: await product.reload()
            });
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al actualizar producto',
                error: error.message
            });
        }
    },

    // Eliminar producto
    deleteProduct: async (req, res) => {
        try {
            const { id } = req.params;
            console.log('Intentando eliminar producto con ID:', id);

            const product = await Product.findByPk(id);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            await product.destroy();
            console.log('Producto eliminado exitosamente');

            return res.status(200).json({
                success: true,
                message: 'Producto eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al eliminar producto',
                error: error.message
            });
        }
    }
};

module.exports = productController; 