import express from 'express';
import productController from '../controllers/productController.js';

const router = express.Router();

// GET /api/products/:id
router.get('/:id', productController.getProductById);

// POST /api/products
router.post('/', productController.createProduct);

// PUT /api/products/:id
router.put('/:id', productController.updateProduct);

// DELETE /api/products/:id
router.delete('/:id', productController.deleteProduct);

// GET /api/products/vendor/:vendorId
router.get('/vendor/:vendorId', productController.getProductsByVendor);

export default router;