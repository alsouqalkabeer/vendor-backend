import { pool } from '../index.js';

const productRepository = {
  // Get vendor's products with pagination and filters
  getVendorProducts: async (filters) => {
    let query = `
      SELECT 
        p.id,
        p.vendor_id,
        p.name,
        p.price,
        p.stock,
        p.status,
        p.classification,
        p.description,
        p.image_url,
        p.additional_images,
        p.created_at,
        p.updated_at,
        v.first_name || ' ' || v.last_name as vendor_name
      FROM products p
      LEFT JOIN users v ON p.vendor_id = v.id
      WHERE p.vendor_id = $1
    `;
    
    const queryParams = [filters.vendorId];
    let paramCount = 1;

    // Add filters
    if (filters.status) {
      paramCount++;
      query += ` AND p.status = $${paramCount}`;
      queryParams.push(filters.status);
    }

    if (filters.classification) {
      paramCount++;
      query += ` AND p.classification ILIKE $${paramCount}`;
      queryParams.push(`%${filters.classification}%`);
    }

    if (filters.search) {
      paramCount++;
      query += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      queryParams.push(`%${filters.search}%`);
    }

    // Get total count
    const countQuery = query.replace(
      /SELECT[\s\S]*?FROM/,
      'SELECT COUNT(*) as total FROM'
    );
    const { rows: countRows } = await pool.query(countQuery, queryParams);
    const total = parseInt(countRows[0].total);

    // Add pagination
    query += ` ORDER BY p.created_at DESC`;
    const offset = (filters.page - 1) * filters.limit;
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    queryParams.push(filters.limit);
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    queryParams.push(offset);

    const { rows } = await pool.query(query, queryParams);

    return {
      products: rows,
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit)
    };
  },

  // Get all products with pagination and filters
  getAllProducts: async (filters) => {
    let query = `
      SELECT 
        p.id,
        p.vendor_id,
        p.name,
        p.price,
        p.stock,
        p.status,
        p.classification,
        p.description,
        p.image_url,
        p.additional_images,
        p.created_at,
        p.updated_at,
        v.first_name || ' ' || v.last_name as vendor_name
      FROM products p
      LEFT JOIN users v ON p.vendor_id = v.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 0;

    // Add filters
    if (filters.vendor_id) {
      paramCount++;
      query += ` AND p.vendor_id = $${paramCount}`;
      queryParams.push(filters.vendor_id);
    }

    if (filters.status) {
      paramCount++;
      query += ` AND p.status = $${paramCount}`;
      queryParams.push(filters.status);
    }

    if (filters.classification) {
      paramCount++;
      query += ` AND p.classification ILIKE $${paramCount}`;
      queryParams.push(`%${filters.classification}%`);
    }

    if (filters.search) {
      paramCount++;
      query += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      queryParams.push(`%${filters.search}%`);
    }

    // Get total count
    const countQuery = query.replace(
      /SELECT[\s\S]*?FROM/,
      'SELECT COUNT(*) as total FROM'
    );
    const { rows: countRows } = await pool.query(countQuery, queryParams);
    const total = parseInt(countRows[0].total);

    // Add pagination
    query += ` ORDER BY p.created_at DESC`;
    const offset = (filters.page - 1) * filters.limit;
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    queryParams.push(filters.limit);
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    queryParams.push(offset);

    const { rows } = await pool.query(query, queryParams);

    return {
      products: rows,
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit)
    };
  },

  // Get single product by ID
  getProductById: async (id) => {
    const query = `
      SELECT 
        p.id,
        p.vendor_id,
        p.name,
        p.price,
        p.stock,
        p.status,
        p.classification,
        p.description,
        p.image_url,
        p.additional_images,
        p.created_at,
        p.updated_at,
        v.first_name || ' ' || v.last_name as vendor_name,
        v.email as vendor_email
      FROM products p
      LEFT JOIN users v ON p.vendor_id = v.id
      WHERE p.id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },

  // Create new product
  createProduct: async (productData) => {
    const query = `
      INSERT INTO products (
        vendor_id,
        name,
        price,
        stock,
        status,
        classification,
        description,
        image_url,
        additional_images
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING 
        id,
        vendor_id,
        name,
        price,
        stock,
        status,
        classification,
        description,
        image_url,
        additional_images,
        created_at,
        updated_at
    `;

    // Handle additional_images - convert to JSONB
    const additionalImages = productData.additional_images || [];

    const values = [
      productData.vendor_id,
      productData.name,
      productData.price,
      productData.stock || 0,
      productData.status || 'available',
      productData.classification,
      productData.description,
      productData.image_url,
      JSON.stringify(additionalImages) // This will be cast to JSONB automatically
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  // Update product
  updateProduct: async (id, productData) => {
    const fields = Object.keys(productData);
    const values = Object.values(productData);

    if (fields.length === 0) {
      return null;
    }

    // Handle additional_images - convert to JSON string for JSONB
    if (productData.additional_images !== undefined) {
      const index = fields.indexOf('additional_images');
      values[index] = JSON.stringify(productData.additional_images || []);
    }

    // Build dynamic SET clause
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');

    const query = `
      UPDATE products 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING 
        id,
        vendor_id,
        name,
        price,
        stock,
        status,
        classification,
        description,
        image_url,
        additional_images,
        updated_at
    `;

    const { rows } = await pool.query(query, [id, ...values]);
    return rows[0];
  },

  // Update product status only
  updateProductStatus: async (id, status) => {
    const query = `
      UPDATE products 
      SET status = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING 
        id,
        status,
        updated_at
    `;

    const { rows } = await pool.query(query, [id, status]);
    return rows[0];
  },

  // Delete product
  deleteProduct: async (id) => {
    const query = 'DELETE FROM products WHERE id = $1 RETURNING id';
    const { rows } = await pool.query(query, [id]);
    return rows.length > 0;
  },

  // Add images to product
  addProductImages: async (id, images) => {
    // First get current additional_images
    const getCurrentQuery = 'SELECT additional_images FROM products WHERE id = $1';
    const { rows: currentRows } = await pool.query(getCurrentQuery, [id]);
    
    if (currentRows.length === 0) {
      return null;
    }

    // JSONB is automatically parsed by pg
    const currentImages = currentRows[0].additional_images || [];
    const updatedImages = [...currentImages, ...images];

    const query = `
      UPDATE products 
      SET additional_images = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING 
        id,
        image_url,
        additional_images,
        updated_at
    `;

    const { rows } = await pool.query(query, [id, JSON.stringify(updatedImages)]);
    return rows[0];
  },

  // Remove image from product
  removeProductImage: async (id, imageId) => {
    // First get current additional_images
    const getCurrentQuery = 'SELECT additional_images FROM products WHERE id = $1';
    const { rows: currentRows } = await pool.query(getCurrentQuery, [id]);
    
    if (currentRows.length === 0) {
      return null;
    }

    // JSONB is automatically parsed by pg
    let currentImages = currentRows[0].additional_images || [];

    // Remove image by index or URL
    const imageIndex = parseInt(imageId);
    if (!isNaN(imageIndex) && imageIndex >= 0 && imageIndex < currentImages.length) {
      currentImages.splice(imageIndex, 1);
    } else {
      // Try to remove by URL
      currentImages = currentImages.filter(img => img !== imageId);
    }

    const query = `
      UPDATE products 
      SET additional_images = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING 
        id,
        image_url,
        additional_images,
        updated_at
    `;

    const { rows } = await pool.query(query, [id, JSON.stringify(currentImages)]);
    return rows[0];
  }
};

export default productRepository;