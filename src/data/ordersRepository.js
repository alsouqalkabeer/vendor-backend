// ===============================
// ORDERS REPOSITORY (ordersRepository.js)
// ===============================

import { pool } from '../index.js';

const ordersRepository = {
  // Get vendor orders with filters and pagination
  getVendorOrders: async (vendorId, filters) => {
    let query = `
      SELECT 
        id,
        vendor_id,
        order_number,
        customer_name,
        total_amount,
        status,
        created_at,
        updated_at
      FROM orders 
      WHERE vendor_id = $1
    `;
    
    const params = [vendorId];
    let paramIndex = 2;
    
    // Add status filter
    if (filters.status) {
      query += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }
    
    // Add sorting
    const validSortFields = ['created_at', 'total_amount', 'order_number', 'status'];
    const sortField = validSortFields.includes(filters.sort) ? filters.sort : 'created_at';
    const sortOrder = filters.order === 'asc' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY ${sortField} ${sortOrder}`;
    
    // Add pagination
    const offset = (filters.page - 1) * filters.limit;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(filters.limit, offset);
    
    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) FROM orders WHERE vendor_id = $1`;
    const countParams = [vendorId];
    
    if (filters.status) {
      countQuery += ` AND status = $2`;
      countParams.push(filters.status);
    }
    
    const [ordersResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, countParams)
    ]);
    
    return {
      orders: ordersResult.rows,
      total: parseInt(countResult.rows[0].count)
    };
  },

  // Update order status
  updateOrderStatus: async (id, status) => {
    const query = `
      UPDATE orders 
      SET status = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING 
        id,
        vendor_id,
        order_number,
        customer_name,
        total_amount,
        status,
        created_at,
        updated_at
    `;
    
    const { rows } = await pool.query(query, [id, status]);
    return rows[0];
  },

  // Get order by ID
  getOrderById: async (id) => {
    const query = `
      SELECT 
        id,
        vendor_id,
        order_number,
        customer_name,
        total_amount,
        status,
        created_at,
        updated_at
      FROM orders 
      WHERE id = $1
    `;
    
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },

  // Create new order (if needed)
  createOrder: async (vendorId, orderData) => {
    const query = `
      INSERT INTO orders (
        vendor_id,
        order_number,
        customer_name,
        total_amount,
        status
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING 
        id,
        vendor_id,
        order_number,
        customer_name,
        total_amount,
        status,
        created_at,
        updated_at
    `;
    
    const { rows } = await pool.query(query, [
      vendorId,
      orderData.order_number,
      orderData.customer_name,
      orderData.total_amount,
      orderData.status || 'pending'
    ]);
    
    return rows[0];
  },

  // Check if order belongs to vendor (for security)
  checkOrderOwnership: async (id, vendorId) => {
    const query = `SELECT id FROM orders WHERE id = $1 AND vendor_id = $2`;
    const { rows } = await pool.query(query, [id, vendorId]);
    return rows.length > 0;
  }
};

export default ordersRepository;