const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middlewares/auth');

// Rutas para órdenes
router.get('/', auth, orderController.getOrders);
router.post('/', auth, orderController.createOrder);
router.get('/:id', auth, orderController.getOrderById);
router.put('/:id/status', auth, orderController.updateOrderStatus);

module.exports = router; 