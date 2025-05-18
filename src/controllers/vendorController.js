import vendorService from '../services/vendorService.js';

const vendorController = {
  // GET /api/vendors
  getAllVendors: async (req, res) => {
    try {
      const vendors = await vendorService.getAllVendors();
      res.status(200).json({
        success: true,
        data: vendors
      });
    } catch (error) {
      console.error('Error getting all vendors:', error);
      res.status(500).json({ 
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // GET /api/vendors/:id
  getVendorById: async (req, res) => {
    try {
      const { id } = req.params;
      const vendor = await vendorService.getVendorById(id);
      
      if (!vendor) {
        return res.status(404).json({ 
          success: false,
          message: 'Vendor not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: vendor
      });
    } catch (error) {
      console.error('Error getting vendor by ID:', error);
      res.status(500).json({ 
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // GET /api/vendors/slug/:slug
  getVendorBySlug: async (req, res) => {
    try {
      const { slug } = req.params;
      const vendor = await vendorService.getVendorBySlug(slug);
      
      if (!vendor) {
        return res.status(404).json({ 
          success: false,
          message: 'Vendor not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: vendor
      });
    } catch (error) {
      console.error('Error getting vendor by slug:', error);
      res.status(500).json({ 
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // POST /api/vendors
  createVendor: async (req, res) => {
    try {
      const vendorData = req.body;
      const newVendor = await vendorService.createVendor(vendorData);
      
      res.status(201).json({
        success: true,
        data: newVendor,
        message: 'Vendor created successfully'
      });
    } catch (error) {
      console.error('Error creating vendor:', error);
      res.status(500).json({ 
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // PUT /api/vendors/:id
  updateVendor: async (req, res) => {
    try {
      const { id } = req.params;
      const vendorData = req.body;
      
      const updatedVendor = await vendorService.updateVendor(id, vendorData);
      
      res.status(200).json({
        success: true,
        data: updatedVendor,
        message: 'Vendor updated successfully'
      });
    } catch (error) {
      console.error('Error updating vendor:', error);
      
      if (error.message === 'Vendor not found') {
        return res.status(404).json({ 
          success: false,
          message: 'Vendor not found'
        });
      }
      
      res.status(500).json({ 
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // DELETE /api/vendors/:id
  deleteVendor: async (req, res) => {
    try {
      const { id } = req.params;
      
      const deletedVendor = await vendorService.deleteVendor(id);
      
      res.status(200).json({
        success: true,
        data: deletedVendor,
        message: 'Vendor deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting vendor:', error);
      
      if (error.message === 'Vendor not found') {
        return res.status(404).json({ 
          success: false,
          message: 'Vendor not found'
        });
      }
      
      res.status(500).json({ 
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // GET /api/vendors/:id/dashboard
  getVendorDashboard: async (req, res) => {
    try {
      const { id } = req.params;
      const dashboardData = await vendorService.getVendorDashboardData(id);
      
      if (!dashboardData) {
        return res.status(404).json({ 
          success: false,
          message: 'Vendor not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      console.error('Error getting vendor dashboard:', error);
      res.status(500).json({ 
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
};

export default vendorController;