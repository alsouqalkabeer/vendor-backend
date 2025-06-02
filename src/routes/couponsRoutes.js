// ===============================
// COUPONS ROUTES (couponsRoutes.js)
// ===============================

import express from 'express';
import couponsController from '../controllers/couponsController.js';

const router = express.Router();

// GET /api/vendors/:vendorId/coupons - Get all coupons
router.get('/:vendorId/coupons', couponsController.getVendorCoupons);

// POST /api/vendors/:vendorId/coupons - Create new coupon
router.post('/:vendorId/coupons', couponsController.createCoupon);

// PUT /api/coupons/:id - Update coupon
router.put('/coupons/:id', couponsController.updateCoupon);

// DELETE /api/coupons/:id - Delete coupon
router.delete('/coupons/:id', couponsController.deleteCoupon);

// GET /api/coupons/:id - Get single coupon (optional)
router.get('/coupons/:id', couponsController.getCouponDetails);

export default router;