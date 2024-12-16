const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/roleAuth');

router.get('/', productController.getAllProducts);
router.post('/', auth, checkRole(['create_product']), productController.createProduct);
router.put('/:id', auth, checkRole(['edit_product']), productController.updateProduct);
router.delete('/:id', auth, checkRole(['delete_product']), productController.deleteProduct);

module.exports = router; 