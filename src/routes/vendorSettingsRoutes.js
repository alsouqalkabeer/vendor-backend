import express from 'express';
import vendorSettingsController from '../controllers/vendorSettingsController.js';

const router = express.Router();

// GET /api/vendors/:vendorId/settings - Get all vendor store settings
router.get('/:vendorId/settings', vendorSettingsController.getVendorSettings);

// PUT /api/vendors/:vendorId/settings - Update all vendor store settings
router.put('/:vendorId/settings', vendorSettingsController.updateVendorSettings);

// PUT /api/vendors/:vendorId/settings/basic - Update basic settings only
router.put('/:vendorId/settings/basic', vendorSettingsController.updateBasicSettings);

// PUT /api/vendors/:vendorId/settings/shipping - Update shipping & delivery settings
router.put('/:vendorId/settings/shipping', vendorSettingsController.updateShippingSettings);

// PUT /api/vendors/:vendorId/settings/payment - Update payment methods
router.put('/:vendorId/settings/payment', vendorSettingsController.updatePaymentSettings);

export default router;