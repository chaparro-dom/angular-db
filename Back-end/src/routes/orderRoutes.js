const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Rutas de órdenes
router.get('/', orderController.getAllOrders);                // Ver todas las órdenes
router.get('/:id', orderController.getOrderById);            // Ver una orden específica
router.post('/', orderController.createOrder);               // Crear nueva orden
router.put('/:id/status', orderController.updateOrderStatus); // Actualizar estado de orden
router.delete('/:id', orderController.cancelOrder);          // Cancelar orden

module.exports = router; 