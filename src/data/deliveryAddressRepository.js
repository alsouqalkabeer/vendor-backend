import { pool } from '../index.js';

const deliveryAddressRepository = {
  // Get all delivery addresses for a vendor
  getDeliveryAddresses: async (vendorId, status = null) => {
    let query = `
      SELECT 
        id,
        vendor_id,
        address,
        country,
        city,
        email,
        mobile,
        status,
        created_at,
        updated_at
      FROM delivery_addresses 
      WHERE vendor_id = $1
    `;
    
    const params = [vendorId];
    
    if (status) {
      query += ` AND status = $2`;
      params.push(status);
    }
    
    query += ` ORDER BY created_at DESC`;
    
    const { rows } = await pool.query(query, params);
    return rows;
  },

  // Create new delivery address
  createDeliveryAddress: async (vendorId, addressData) => {
    const query = `
      INSERT INTO delivery_addresses (
        vendor_id,
        address,
        country,
        city,
        email,
        mobile,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING 
        id,
        vendor_id,
        address,
        country,
        city,
        email,
        mobile,
        status,
        created_at,
        updated_at
    `;
    
    const { rows } = await pool.query(query, [
      vendorId,
      addressData.address,
      addressData.country,
      addressData.city,
      addressData.email,
      addressData.mobile,
      addressData.status
    ]);
    
    return rows[0];
  },

  // Update delivery address
  updateDeliveryAddress: async (id, updateData) => {
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);
    
    if (fields.length === 0) {
      return null;
    }

    const setClause = fields.map((field, index) => `${field} = ${index + 2}`).join(', ');
    
    const query = `
      UPDATE delivery_addresses 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING 
        id,
        vendor_id,
        address,
        country,
        city,
        email,
        mobile,
        status,
        created_at,
        updated_at
    `;
    
    const { rows } = await pool.query(query, [id, ...values]);
    return rows[0];
  },

  // Delete delivery address
  deleteDeliveryAddress: async (id) => {
    const query = `DELETE FROM delivery_addresses WHERE id = $1 RETURNING id`;
    const { rows } = await pool.query(query, [id]);
    return rows.length > 0;
  },

  // Update status only
  updateStatus: async (id, status) => {
    const query = `
      UPDATE delivery_addresses 
      SET status = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING 
        id,
        vendor_id,
        address,
        country,
        city,
        email,
        mobile,
        status,
        created_at,
        updated_at
    `;
    
    const { rows } = await pool.query(query, [id, status]);
    return rows[0];
  },

  // Get single delivery address by ID
  getDeliveryAddressById: async (id) => {
    const query = `
      SELECT 
        id,
        vendor_id,
        address,
        country,
        city,
        email,
        mobile,
        status,
        created_at,
        updated_at
      FROM delivery_addresses 
      WHERE id = $1
    `;
    
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },

  // Check if address belongs to vendor (for security)
  checkAddressOwnership: async (id, vendorId) => {
    const query = `SELECT id FROM delivery_addresses WHERE id = $1 AND vendor_id = $2`;
    const { rows } = await pool.query(query, [id, vendorId]);
    return rows.length > 0;
  }
};

export default deliveryAddressRepository;