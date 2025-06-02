// ===============================
// COUPONS REPOSITORY (couponsRepository.js)
// ===============================

import { pool } from '../index.js';

const couponsRepository = {
  // Get vendor coupons with filters and pagination
  getVendorCoupons: async (vendorId, filters) => {
    let query = `
      SELECT 
        id,
        vendor_id,
        name,
        code,
        discount_type,
        discount_value,
        start_date,
        end_date,
        status,
        target_audience,
        coupon_sort,
        created_at,
        updated_at
      FROM discount_coupons 
      WHERE vendor_id = $1
    `;
        console.log('vendorIdvendorIdvendorId->>>>', vendorId);
    const params = [Number(vendorId)];
    let paramIndex = 2;
    
    // Add status filter
    if (filters.status) {
      query += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }
    
    // Add sorting by created_at DESC
    query += ` ORDER BY created_at DESC`;
    
    // Add pagination
    const offset = (filters.page - 1) * filters.limit;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(filters.limit, offset);
    
    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) FROM discount_coupons WHERE vendor_id = $1`;
    const countParams = [vendorId];
    
    if (filters.status) {
      countQuery += ` AND status = $2`;
      countParams.push(filters.status);
    }
    console.log('queryqueryqueryqueryquery',query)
    const [couponsResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, countParams)
    ]);
    
    return {
      coupons: couponsResult.rows,
      total: parseInt(countResult.rows[0].count)
    };
  },

  // Create new coupon
  createCoupon: async (vendorId, couponData) => {
    const query = `
      INSERT INTO coupons (
        vendor_id,
        name,
        code,
        discount_type,
        discount_value,
        start_date,
        end_date,
        status,
        target_audience,
        coupon_sort,
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING 
        id,
        vendor_id,
        name,
        code,
        discount_type,
        discount_value,
        start_date,
        end_date,
        status,
        target_audience,
        coupon_sort,
        created_at,
        updated_at
    `;
    
    const { rows } = await pool.query(query, [
      vendorId,
      couponData.name,
      couponData.code,
      couponData.discount_type,
      couponData.discount_value,
      couponData.start_date,
      couponData.end_date,
      couponData.status,
      couponData.target_audience,
      couponData.coupon_sort,
    ]);
    
    return rows[0];
  },

  // Update coupon
  updateCoupon: async (id, updateData) => {
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);
    
    if (fields.length === 0) {
      return null;
    }

    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    
    const query = `
      UPDATE discount_coupons 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING 
        id,
        vendor_id,
        name,
        code,
        discount_type,
        discount_value,
        start_date,
        end_date,
        status,
        target_audience,
        coupon_sort,
        created_at,
        updated_at
    `;
    
    const { rows } = await pool.query(query, [id, ...values]);
    return rows[0];
  },

  // Delete coupon
  deleteCoupon: async (id) => {
    const query = `DELETE FROM discount_coupons WHERE id = $1 RETURNING id`;
    const { rows } = await pool.query(query, [id]);
    return rows.length > 0;
  },

  // Get coupon by ID
  getCouponById: async (id) => {
    const query = `
      SELECT 
        id,
        vendor_id,
        name,
        code,
        discount_type,
        discount_value,
        start_date,
        end_date,
        status,
        target_audience,
        coupon_sort,
        created_at,
        updated_at
      FROM discount_coupons 
      WHERE id = $1
    `;
    
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },

  // Get coupon by code (for validation)
  getCouponByCode: async (code) => {
    const query = `
      SELECT 
        id,
        vendor_id,
        name,
        code,
        discount_type,
        discount_value,
        start_date,
        end_date,
        status,
        target_audience,
        coupon_sort,
        created_at,
        updated_at
      FROM discount_coupons 
      WHERE code = $1
    `;
    
    const { rows } = await pool.query(query, [code]);
    return rows[0];
  },

  // Update coupon usage count
  incrementUsageCount: async (id) => {
    const query = `
      UPDATE discount_coupons 
      SET used_count = used_count + 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING used_count
    `;
    
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },

  // Check if coupon belongs to vendor (for security)
  checkCouponOwnership: async (id, vendorId) => {
    const query = `SELECT id FROM discount_coupons WHERE id = $1 AND vendor_id = $2`;
    const { rows } = await pool.query(query, [id, vendorId]);
    return rows.length > 0;
  },

  // Get active coupons for a vendor
  getActiveCoupons: async (vendorId) => {
    const query = `
      SELECT 
        id,
        vendor_id,
        name,
        code,
        discount_type,
        discount_value,
        start_date,
        end_date,
        status,
        target_audience,
        coupon_sort,
        created_at,
        updated_at
      FROM discount_coupons 
      WHERE vendor_id = $1 
        AND status = 'available' 
        AND start_date <= CURRENT_DATE 
        AND end_date >= CURRENT_DATE
      ORDER BY created_at DESC
    `;
    
    const { rows } = await pool.query(query, [vendorId]);
    return rows;
  }
};

export default couponsRepository;