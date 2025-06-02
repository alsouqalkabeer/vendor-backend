// ===============================
// GENERAL COUPONS ROUTES (generalCouponsRoutes.js)
// ===============================

import express from 'express';
import couponsController from '../controllers/couponsController.js';

const router = express.Router();

// General coupon routes (these will be prefixed with /api/coupons)
// PUT /api/coupons/:id - Update coupon
router.put('/:id', couponsController.updateCoupon);

// DELETE /api/coupons/:id - Delete coupon
router.delete('/:id', couponsController.deleteCoupon);

// GET /api/coupons/:id - Get single coupon details
router.get('/:id', couponsController.getCouponDetails);

export default router;