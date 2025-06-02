import express from 'express';
import deliveryAddressController from '../controllers/deliveryAddressController.js';

const router = express.Router();

// GET /api/vendors/:vendorId/delivery-addresses - Get all delivery addresses
router.get('/:vendorId/delivery-addresses', deliveryAddressController.getDeliveryAddresses);

// POST /api/vendors/:vendorId/delivery-addresses - Add new delivery address
router.post('/:vendorId/delivery-addresses', deliveryAddressController.createDeliveryAddress);

// PUT /api/delivery-addresses/:id - Update delivery address
router.put('/delivery-addresses/:id', deliveryAddressController.updateDeliveryAddress);

// DELETE /api/delivery-addresses/:id - Delete delivery address
router.delete('/delivery-addresses/:id', deliveryAddressController.deleteDeliveryAddress);

// PATCH /api/delivery-addresses/:id/status - Toggle availability status
router.patch('/delivery-addresses/:id/status', deliveryAddressController.toggleStatus);

export default router;