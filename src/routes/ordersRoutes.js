import express from 'express';
import ordersController from '../controllers/ordersController.js';

const router = express.Router();

// GET /api/vendors/:vendorId/orders - Get vendor's orders (with filters)
router.get('/:vendorId/orders', ordersController.getVendorOrders);

// PUT /api/orders/:id/status - Update order status
router.put('/orders/:id/status', ordersController.updateOrderStatus);

// GET /api/orders/:id - Get order details
router.get('/orders/:id', ordersController.getOrderDetails);

export default router;