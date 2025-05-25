import express from 'express';
import productController from '../controllers/productController.js';

const router = express.Router();

// Vendor-specific product routes
// GET /api/vendors/:vendorId/products - Get vendor's products (with pagination)
router.get('/vendors/:vendorId/products', productController.getVendorProducts);

// POST /api/vendors/:vendorId/products - Create new product
router.post('/vendors/:vendorId/products', productController.createProduct);

// General product routes
// PUT /api/products/:id - Update product
router.put('/:id', productController.updateProduct);

// DELETE /api/products/:id - Delete product
router.delete('/:id', productController.deleteProduct);

// PATCH /api/products/:id/status - Update product status
router.patch('/:id/status', productController.updateProductStatus);

// GET /api/products/:id - Get single product
router.get('/:id', productController.getProductById);

// GET /api/products - Get all products (with pagination and filters)
router.get('/', productController.getAllProducts);

// Image management routes
// POST /api/products/:id/images - Upload product images
router.post('/:id/images', productController.uploadProductImages);

// DELETE /api/products/:id/images/:imageId - Delete product image
router.delete('/:id/images/:imageId', productController.deleteProductImage);

export default router;