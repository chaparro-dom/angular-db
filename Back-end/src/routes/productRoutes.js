const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Rutas de productos
router.get('/', productController.getAllProducts);          // Ver todos los productos
router.get('/:id', productController.getProductById);      // Ver un producto específico
router.post('/', productController.createProduct);         // Crear producto
router.put('/:id', productController.updateProduct);       // Actualizar producto
router.delete('/:id', productController.deleteProduct);    // Eliminar producto

module.exports = router; 