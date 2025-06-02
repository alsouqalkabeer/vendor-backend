// ===============================
// COUPONS CONTROLLER (couponsController.js)
// ===============================

import couponsService from '../services/couponsService.js';

const couponsController = {
  // GET /api/vendors/:vendorId/coupons
  getVendorCoupons: async (req, res) => {
    try {
      const { vendorId } = req.params;
      const { status, page = 1, limit = 10 } = req.query;
      
      if (!vendorId) {
        return res.status(400).json({
          success: false,
          message: 'Vendor ID is required'
        });
      }

      // Validate status filter if provided
      const validStatuses = ['available', 'unavailable', 'expired'];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status filter. Must be one of: available, unavailable, expired'
        });
      }

      // Validate pagination
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pagination parameters'
        });
      }

      const filters = {
        status,
        page: pageNum,
        limit: limitNum
      };

      const result = await couponsService.getVendorCoupons(vendorId, filters);
      
      res.status(200).json({
        success: true,
        message: 'Coupons retrieved successfully',
        data: {
          coupons: result.coupons,
          pagination: {
            currentPage: pageNum,
            totalPages: Math.ceil(result.total / limitNum),
            totalCoupons: result.total,
            hasNext: pageNum * limitNum < result.total,
            hasPrev: pageNum > 1
          }
        }
      });
    } catch (error) {
      console.error('Error getting vendor coupons:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // POST /api/vendors/:vendorId/coupons
  createCoupon: async (req, res) => {
    try {
      const { vendorId } = req.params;
      const { name, code, discount_type, discount_value, start_date, end_date, status, target_audience, coupon_sort, usage_limit } = req.body;

      // Validate required fields
      if (!vendorId) {
        return res.status(400).json({
          success: false,
          message: 'Vendor ID is required'
        });
      }

      if (!name || !code || !discount_type || !discount_value || !start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: 'Name, code, discount_type, discount_value, start_date, and end_date are required'
        });
      }

      // Validate discount_type
      if (!['percentage', 'fixed'].includes(discount_type)) {
        return res.status(400).json({
          success: false,
          message: 'Discount type must be either "percentage" or "fixed"'
        });
      }

      // Validate discount_value
      const discountVal = parseFloat(discount_value);
      if (isNaN(discountVal) || discountVal <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Discount value must be a positive number'
        });
      }

      if (discount_type === 'percentage' && discountVal > 100) {
        return res.status(400).json({
          success: false,
          message: 'Percentage discount cannot exceed 100%'
        });
      }

      // Validate dates
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format'
        });
      }

      if (endDate <= startDate) {
        return res.status(400).json({
          success: false,
          message: 'End date must be after start date'
        });
      }

      // Validate status if provided
      if (status && !['available', 'unavailable'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be either "available" or "unavailable"'
        });
      }

      // Validate usage_limit if provided
      if (usage_limit && (isNaN(parseInt(usage_limit)) || parseInt(usage_limit) <= 0)) {
        return res.status(400).json({
          success: false,
          message: 'Usage limit must be a positive integer'
        });
      }

      const couponData = {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        discount_type,
        discount_value: discountVal,
        start_date,
        end_date,
        status: status || 'available',
        target_audience: target_audience || 'all',
        coupon_sort: coupon_sort || '',
        usage_limit: usage_limit ? parseInt(usage_limit) : null
      };

      const newCoupon = await couponsService.createCoupon(vendorId, couponData);
      
      res.status(201).json({
        success: true,
        message: 'Coupon created successfully',
        data: newCoupon
      });
    } catch (error) {
      console.error('Error creating coupon:', error);
      if (error.message.includes('duplicate key')) {
        res.status(409).json({
          success: false,
          message: 'Coupon code already exists'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message
        });
      }
    }
  },

  // PUT /api/coupons/:id
  updateCoupon: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, code, discount_type, discount_value, start_date, end_date, status, target_audience, coupon_sort, usage_limit } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Coupon ID is required'
        });
      }

      // Check if coupon exists
      const existingCoupon = await couponsService.getCouponById(id);
      if (!existingCoupon) {
        return res.status(404).json({
          success: false,
          message: 'Coupon not found'
        });
      }

      const updateData = {};

      if (name) updateData.name = name.trim();
      if (code) updateData.code = code.trim().toUpperCase();
      
      if (discount_type) {
        if (!['percentage', 'fixed'].includes(discount_type)) {
          return res.status(400).json({
            success: false,
            message: 'Discount type must be either "percentage" or "fixed"'
          });
        }
        updateData.discount_type = discount_type;
      }

      if (discount_value !== undefined) {
        const discountVal = parseFloat(discount_value);
        if (isNaN(discountVal) || discountVal <= 0) {
          return res.status(400).json({
            success: false,
            message: 'Discount value must be a positive number'
          });
        }
        if ((updateData.discount_type || existingCoupon.discount_type) === 'percentage' && discountVal > 100) {
          return res.status(400).json({
            success: false,
            message: 'Percentage discount cannot exceed 100%'
          });
        }
        updateData.discount_value = discountVal;
      }

      if (start_date) {
        const startDate = new Date(start_date);
        if (isNaN(startDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid start date format'
          });
        }
        updateData.start_date = start_date;
      }

      if (end_date) {
        const endDate = new Date(end_date);
        if (isNaN(endDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid end date format'
          });
        }
        updateData.end_date = end_date;
      }

      // Validate date range if both dates are being updated
      if (updateData.start_date && updateData.end_date) {
        if (new Date(updateData.end_date) <= new Date(updateData.start_date)) {
          return res.status(400).json({
            success: false,
            message: 'End date must be after start date'
          });
        }
      }

      if (status) {
        if (!['available', 'unavailable', 'expired'].includes(status)) {
          return res.status(400).json({
            success: false,
            message: 'Status must be one of: available, unavailable, expired'
          });
        }
        updateData.status = status;
      }

      if (target_audience) updateData.target_audience = target_audience;
      if (coupon_sort) updateData.coupon_sort = coupon_sort;
      
      if (usage_limit !== undefined) {
        if (usage_limit && (isNaN(parseInt(usage_limit)) || parseInt(usage_limit) <= 0)) {
          return res.status(400).json({
            success: false,
            message: 'Usage limit must be a positive integer'
          });
        }
        updateData.usage_limit = usage_limit ? parseInt(usage_limit) : null;
      }

      const updatedCoupon = await couponsService.updateCoupon(id, updateData);
      
      res.status(200).json({
        success: true,
        message: 'Coupon updated successfully',
        data: updatedCoupon
      });
    } catch (error) {
      console.error('Error updating coupon:', error);
      if (error.message.includes('duplicate key')) {
        res.status(409).json({
          success: false,
          message: 'Coupon code already exists'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message
        });
      }
    }
  },

  // DELETE /api/coupons/:id
  deleteCoupon: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Coupon ID is required'
        });
      }

      const deleted = await couponsService.deleteCoupon(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Coupon not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Coupon deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting coupon:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // GET /api/coupons/:id - Get single coupon details
  getCouponDetails: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Coupon ID is required'
        });
      }

      const coupon = await couponsService.getCouponById(id);
      
      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: 'Coupon not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Coupon details retrieved successfully',
        data: coupon
      });
    } catch (error) {
      console.error('Error getting coupon details:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
};

export default couponsController;