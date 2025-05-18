import productRepository from '../data/productRepository.js';

const productService = {
  getProductsByVendor: async (vendorId) => {
    return await productRepository.getProductsByVendor(vendorId);
  },

  getProductById: async (id) => {
    return await productRepository.getProductById(id);
  },

  createProduct: async (productData) => {
    // Generate slug if not provided
    if (!productData.slug) {
      productData.slug = productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }
    
    return await productRepository.createProduct(productData);
  },

  updateProduct: async (id, productData) => {
    // Check if product exists
    const existingProduct = await productRepository.getProductById(id);
    if (!existingProduct) {
      throw new Error('Product not found');
    }
    
    return await productRepository.updateProduct(id, productData);
  },

  deleteProduct: async (id) => {
    // Check if product exists
    const existingProduct = await productRepository.getProductById(id);
    if (!existingProduct) {
      throw new Error('Product not found');
    }
    
    return await productRepository.deleteProduct(id);
  }
};

export default productService;