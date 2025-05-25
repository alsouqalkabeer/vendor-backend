import productService from '../services/productService.js';

const productController = {
  // GET /api/vendors/:vendorId/products
  getVendorProducts: async (req, res) => {
    try {
      const { vendorId } = req.params;
      const { page = 1, limit = 10, status, classification, search } = req.query;

      const filters = {
        status,
        classification,
        search,
        page: parseInt(page),
        limit: parseInt(limit)
      };

      const result = await productService.getVendorProducts(vendorId, filters);

      res.status(200).json({
        success: true,
        data: result.products,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      console.error('Error getting vendor products:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // POST /api/vendors/:vendorId/products
  createProduct: async (req, res) => {
    try {
      const { vendorId } = req.params;
      const productData = { ...req.body, vendor_id: vendorId };

      // Validate required fields
      if (!productData.name || !productData.price) {
        return res.status(400).json({
          success: false,
          message: 'Product name and price are required'
        });
      }

      const newProduct = await productService.createProduct(productData);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: newProduct
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
      console.error('Error getting product:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // GET /api/products
  getAllProducts: async (req, res) => {
    try {
      const { page = 1, limit = 10, status, classification, vendor_id, search } = req.query;

      const filters = {
        status,
        classification,
        vendor_id,
        search,
        page: parseInt(page),
        limit: parseInt(limit)
      };

      const result = await productService.getAllProducts(filters);

      res.status(200).json({
        success: true,
        data: result.products,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      console.error('Error getting all products:', error);
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

      if (!updatedProduct) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct
      });
    } catch (error) {
      console.error('Error updating product:', error);
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
      const deleted = await productService.deleteProduct(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // PATCH /api/products/:id/status
  updateProductStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['available', 'unavailable'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Valid status is required (available or unavailable)'
        });
      }

      const updatedProduct = await productService.updateProductStatus(id, status);

      if (!updatedProduct) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Product status updated successfully',
        data: updatedProduct
      });
    } catch (error) {
      console.error('Error updating product status:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // POST /api/products/:id/images
  uploadProductImages: async (req, res) => {
    try {
      const { id } = req.params;
      const { images } = req.body; // Array of image URLs or base64 strings

      if (!images || !Array.isArray(images)) {
        return res.status(400).json({
          success: false,
          message: 'Images array is required'
        });
      }

      const updatedProduct = await productService.addProductImages(id, images);

      if (!updatedProduct) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Product images uploaded successfully',
        data: updatedProduct
      });
    } catch (error) {
      console.error('Error uploading product images:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // DELETE /api/products/:id/images/:imageId
  deleteProductImage: async (req, res) => {
    try {
      const { id, imageId } = req.params;

      const updatedProduct = await productService.removeProductImage(id, imageId);

      if (!updatedProduct) {
        return res.status(404).json({
          success: false,
          message: 'Product or image not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Product image deleted successfully',
        data: updatedProduct
      });
    } catch (error) {
      console.error('Error deleting product image:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
};

export default productController;