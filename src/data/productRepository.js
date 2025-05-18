import { pool } from '../index.js';

const productRepository = {
  // Get all products for a vendor
  getProductsByVendor: async (vendorId) => {
    const query = 'SELECT * FROM products WHERE vendor_id = $1';
    const { rows } = await pool.query(query, [vendorId]);
    return rows;
  },

  // Get product by ID
  getProductById: async (id) => {
    const query = 'SELECT * FROM products WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },

  // Create new product
  createProduct: async (productData) => {
    const {
      vendor_id, name, slug, description, price,
      stock, image_url, additional_images, classification, status
    } = productData;

    const query = `
      INSERT INTO products (
        vendor_id, name, slug, description, price,
        stock, image_url, additional_images, classification, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      vendor_id, name, slug, description, price,
      stock, image_url, additional_images, classification, status
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  // Update product
  updateProduct: async (id, productData) => {
    const {
      name, slug, description, price,
      stock, image_url, additional_images, classification, status
    } = productData;

    const query = `
      UPDATE products
      SET name = $1, slug = $2, description = $3, price = $4,
          stock = $5, image_url = $6, additional_images = $7, classification = $8,
          status = $9, updated_at = NOW()
      WHERE id = $10
      RETURNING *
    `;

    const values = [
      name, slug, description, price,
      stock, image_url, additional_images, classification, status, id
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  // Delete product
  deleteProduct: async (id) => {
    const query = 'DELETE FROM products WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
};

export default productRepository;