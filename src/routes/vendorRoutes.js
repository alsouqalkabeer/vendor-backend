import express from 'express';
import vendorController from '../controllers/vendorController.js';

const router = express.Router();

// GET /api/vendors
router.get('/', vendorController.getAllVendors);

// GET /api/vendors/:id
router.get('/:id', vendorController.getVendorById);

// GET /api/vendors/slug/:slug
router.get('/slug/:slug', vendorController.getVendorBySlug);

// POST /api/vendors
router.post('/', vendorController.createVendor);

// PUT /api/vendors/:id
router.put('/:id', vendorController.updateVendor);

// DELETE /api/vendors/:id
router.delete('/:id', vendorController.deleteVendor);

// GET /api/vendors/:id/dashboard
router.get('/:id/dashboard', vendorController.getVendorDashboard);

export default router;