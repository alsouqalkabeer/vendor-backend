// ===============================
// COUPONS SERVICE (couponsService.js)
// ===============================

import couponsRepository from '../data/couponsRepository.js';

const couponsService = {
  // Get vendor coupons with filters and pagination
  getVendorCoupons: async (vendorId, filters) => {
    try {
      return await couponsRepository.getVendorCoupons(vendorId, filters);
    } catch (error) {
      console.error('Service error getting vendor coupons:', error);
      throw new Error('Failed to retrieve vendor coupons');
    }
  },

  // Create new coupon
  createCoupon: async (vendorId, couponData) => {
    try {
      return await couponsRepository.createCoupon(vendorId, couponData);
    } catch (error) {
      console.error('Service error creating coupon:', error);
      throw new Error('Failed to create coupon');
    }
  },

  // Update coupon
  updateCoupon: async (id, updateData) => {
    try {
      return await couponsRepository.updateCoupon(id, updateData);
    } catch (error) {
      console.error('Service error updating coupon:', error);
      throw new Error('Failed to update coupon');
    }
  },

  // Delete coupon
  deleteCoupon: async (id) => {
    try {
      return await couponsRepository.deleteCoupon(id);
    } catch (error) {
      console.error('Service error deleting coupon:', error);
      throw new Error('Failed to delete coupon');
    }
  },

  // Get coupon by ID
  getCouponById: async (id) => {
    try {
      return await couponsRepository.getCouponById(id);
    } catch (error) {
      console.error('Service error getting coupon by id:', error);
      throw new Error('Failed to retrieve coupon');
    }
  },

  // Validate coupon by code (for checkout process)
  validateCouponByCode: async (code, vendorId = null) => {
    try {
      const coupon = await couponsRepository.getCouponByCode(code);
      
      if (!coupon) {
        return { valid: false, message: 'Coupon not found' };
      }

      // Check if vendor-specific
      if (vendorId && coupon.vendor_id !== vendorId) {
        return { valid: false, message: 'Coupon not valid for this vendor' };
      }

      // Check if coupon is available
      if (coupon.status !== 'available') {
        return { valid: false, message: 'Coupon is not available' };
      }

      // Check date validity
      const now = new Date();
      const startDate = new Date(coupon.start_date);
      const endDate = new Date(coupon.end_date);

      if (now < startDate) {
        return { valid: false, message: 'Coupon is not yet active' };
      }

      if (now > endDate) {
        return { valid: false, message: 'Coupon has expired' };
      }

      // Check usage limit
      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        return { valid: false, message: 'Coupon usage limit reached' };
      }

      return { 
        valid: true, 
        coupon,
        message: 'Coupon is valid'
      };
    } catch (error) {
      console.error('Service error validating coupon:', error);
      throw new Error('Failed to validate coupon');
    }
  },

  // Apply coupon (increment usage count)
  applyCoupon: async (id) => {
    try {
      return await couponsRepository.incrementUsageCount(id);
    } catch (error) {
      console.error('Service error applying coupon:', error);
      throw new Error('Failed to apply coupon');
    }
  }
};

export default couponsService;