import { pool } from '../index.js';

const vendorRepository = {
  // Get all vendors
  getAllVendors: async () => {
    const query = 'SELECT * FROM vendors';
    const { rows } = await pool.query(query);
    return rows;
  },

  // Get vendor by ID
  getVendorById: async (id) => {
    const query = 'SELECT * FROM vendors WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },

  // Get vendor by slug
  getVendorBySlug: async (slug) => {
    const query = 'SELECT * FROM vendors WHERE slug = $1';
    const { rows } = await pool.query(query, [slug]);
    return rows[0];
  },

  // Create new vendor
  createVendor: async (vendorData) => {
    const {
      name, slug, logo_url, description, primary_color,
      user_id, market_name, main_phone, sub_phone, whatsapp,
      address, main_email, sub_email, country, city, about_me, market_location
    } = vendorData;

    const query = `
      INSERT INTO vendors (
        name, slug, logo_url, description, primary_color,
        user_id, market_name, main_phone, sub_phone, whatsapp,
        address, main_email, sub_email, country, city, about_me, market_location
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `;

    const values = [
      name, slug, logo_url, description, primary_color,
      user_id, market_name, main_phone, sub_phone, whatsapp,
      address, main_email, sub_email, country, city, about_me, market_location
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  // Update vendor
  updateVendor: async (id, vendorData) => {
    const {
      name, slug, logo_url, description, primary_color,
      market_name, main_phone, sub_phone, whatsapp,
      address, main_email, sub_email, country, city, about_me, market_location
    } = vendorData;

    const query = `
      UPDATE vendors
      SET name = $1, slug = $2, logo_url = $3, description = $4, primary_color = $5,
          market_name = $6, main_phone = $7, sub_phone = $8, whatsapp = $9,
          address = $10, main_email = $11, sub_email = $12, country = $13, city = $14,
          about_me = $15, market_location = $16, updated_at = NOW()
      WHERE id = $17
      RETURNING *
    `;

    const values = [
      name, slug, logo_url, description, primary_color,
      market_name, main_phone, sub_phone, whatsapp,
      address, main_email, sub_email, country, city, about_me, market_location, id
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  // Delete vendor
  deleteVendor: async (id) => {
    const query = 'DELETE FROM vendors WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },

  // Get vendor dashboard data
  getVendorDashboardData: async (vendorId) => {
    const query = `
      SELECT 
        v.id, v.name, v.slug, v.logo_url, v.primary_color,
        (SELECT COUNT(*) FROM products WHERE vendor_id = v.id) AS product_count,
        (SELECT COUNT(*) FROM orders WHERE vendor_id = v.id) AS order_count,
        (SELECT SUM(total_amount) FROM orders WHERE vendor_id = v.id) AS total_sales,
        (SELECT SUM(active_sales) FROM analytics WHERE vendor_id = v.id AND date = CURRENT_DATE) AS active_sales,
        (SELECT SUM(product_revenue) FROM analytics WHERE vendor_id = v.id AND date = CURRENT_DATE) AS product_revenue,
        (SELECT SUM(daily_income) FROM analytics WHERE vendor_id = v.id AND date = CURRENT_DATE) AS daily_income
      FROM vendors v
      WHERE v.id = $1
    `;
    const { rows } = await pool.query(query, [vendorId]);
    return rows[0];
  }
};

export default vendorRepository;