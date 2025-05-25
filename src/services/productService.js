import productRepository from '../data/productRepository.js';

const productService = {
  getVendorProducts: async (vendorId, filters) => {
    // Validate and sanitize filters
    const sanitizedFilters = {
      vendorId: parseInt(vendorId),
      status: filters.status?.trim(),
      classification: filters.classification?.trim(),
      search: filters.search?.trim(),
      page: Math.max(1, filters.page || 1),
      limit: Math.min(100, Math.max(1, filters.limit || 10))
    };

    return await productRepository.getVendorProducts(sanitizedFilters);
  },

  getAllProducts: async (filters) => {
    // Validate and sanitize filters
    const sanitizedFilters = {
      status: filters.status?.trim(),
      classification: filters.classification?.trim(),
      vendor_id: filters.vendor_id ? parseInt(filters.vendor_id) : null,
      search: filters.search?.trim(),
      page: Math.max(1, filters.page || 1),
      limit: Math.min(100, Math.max(1, filters.limit || 10))
    };

    return await productRepository.getAllProducts(sanitizedFilters);
  },

  getProductById: async (id) => {
    return await productRepository.getProductById(id);
  },

  createProduct: async (productData) => {
    // Sanitize and validate data
    const sanitizedData = {
      vendor_id: parseInt(productData.vendor_id),
      name: productData.name?.trim(),
      price: parseFloat(productData.price),
      stock: parseInt(productData.stock || 0),
      status: productData.status?.trim() || 'available',
      classification: productData.classification?.trim(),
      description: productData.description?.trim(),
      image_url: productData.image_url?.trim(),
      additional_images: productData.additional_images || []
    };

    // Validate required fields
    if (!sanitizedData.name || !sanitizedData.price || !sanitizedData.vendor_id) {
      throw new Error('Name, price, and vendor_id are required');
    }

    // Validate status
    if (!['available', 'unavailable'].includes(sanitizedData.status)) {
      sanitizedData.status = 'available';
    }

    // Validate price and stock
    if (isNaN(sanitizedData.price) || sanitizedData.price < 0) {
      throw new Error('Price must be a valid positive number');
    }

    if (isNaN(sanitizedData.stock) || sanitizedData.stock < 0) {
      sanitizedData.stock = 0;
    }

    return await productRepository.createProduct(sanitizedData);
  },

  updateProduct: async (id, productData) => {
    const sanitizedData = {};

    // Only include provided fields
    if (productData.name !== undefined) {
      sanitizedData.name = productData.name?.trim();
    }
    if (productData.price !== undefined) {
      sanitizedData.price = parseFloat(productData.price);
      if (isNaN(sanitizedData.price) || sanitizedData.price < 0) {
        throw new Error('Price must be a valid positive number');
      }
    }
    if (productData.stock !== undefined) {
      sanitizedData.stock = parseInt(productData.stock);
      if (isNaN(sanitizedData.stock) || sanitizedData.stock < 0) {
        sanitizedData.stock = 0;
      }
    }
    if (productData.status !== undefined) {
      if (['available', 'unavailable'].includes(productData.status?.trim())) {
        sanitizedData.status = productData.status.trim();
      }
    }
    if (productData.classification !== undefined) {
      sanitizedData.classification = productData.classification?.trim();
    }
    if (productData.description !== undefined) {
      sanitizedData.description = productData.description?.trim();
    }
    if (productData.image_url !== undefined) {
      sanitizedData.image_url = productData.image_url?.trim();
    }
    if (productData.additional_images !== undefined) {
      sanitizedData.additional_images = productData.additional_images || [];
    }

    // Remove undefined values
    Object.keys(sanitizedData).forEach(key => {
      if (sanitizedData[key] === undefined || sanitizedData[key] === null || sanitizedData[key] === '') {
        delete sanitizedData[key];
      }
    });

    if (Object.keys(sanitizedData).length === 0) {
      throw new Error('No valid fields to update');
    }

    return await productRepository.updateProduct(id, sanitizedData);
  },

  updateProductStatus: async (id, status) => {
    if (!['available', 'unavailable'].includes(status)) {
      throw new Error('Status must be either available or unavailable');
    }

    return await productRepository.updateProductStatus(id, status);
  },

  deleteProduct: async (id) => {
    return await productRepository.deleteProduct(id);
  },

  addProductImages: async (id, images) => {
    // Validate images array
    if (!Array.isArray(images) || images.length === 0) {
      throw new Error('Images must be a non-empty array');
    }

    // Sanitize image URLs
    const sanitizedImages = images
      .map(img => typeof img === 'string' ? img.trim() : null)
      .filter(img => img && img.length > 0);

    if (sanitizedImages.length === 0) {
      throw new Error('No valid images provided');
    }

    return await productRepository.addProductImages(id, sanitizedImages);
  },

  removeProductImage: async (id, imageId) => {
    return await productRepository.removeProductImage(id, imageId);
  }
};

export default productService;