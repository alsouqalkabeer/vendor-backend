import productService from '../services/productService.js';

const productController = {
  // GET /api/vendors/:vendorId/products
  getProductsByVendor: async (req, res) => {
    try {
      const { vendorId } = req.params;
      const products = await productService.getProductsByVendor(vendorId);
      
      res.status(200).json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error('Error getting products by vendor:', error);
      res.status(500).json({ 
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // GET /api/products/:id
  getProductById: async (req, res) => {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);
      
      if (!product) {
        return res.status(404).json({ 
          success: false,
          message: 'Product not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Error getting product by ID:', error);
      res.status(500).json({ 
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // POST /api/products
  createProduct: async (req, res) => {
    try {
      const productData = req.body;
      const newProduct = await productService.createProduct(productData);
      
      res.status(201).json({
        success: true,
        data: newProduct,
        message: 'Product created successfully'
      });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ 
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // PUT /api/products/:id
  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const productData = req.body;
      
      const updatedProduct = await productService.updateProduct(id, productData);
      
      res.status(200).json({
        success: true,
        data: updatedProduct,
        message: 'Product updated successfully'
      });
    } catch (error) {
      console.error('Error updating product:', error);
      
      if (error.message === 'Product not found') {
        return res.status(404).json({ 
          success: false,
          message: 'Product not found'
        });
      }
      
      res.status(500).json({ 
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // DELETE /api/products/:id
  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;
      
      const deletedProduct = await productService.deleteProduct(id);
      
      res.status(200).json({
        success: true,
        data: deletedProduct,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      
      if (error.message === 'Product not found') {
        return res.status(404).json({ 
          success: false,
          message: 'Product not found'
        });
      }
      
      res.status(500).json({ 
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
};

export default productController;