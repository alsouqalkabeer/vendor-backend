import vendorSettingsService from '../services/vendorSettingsService.js';

const vendorSettingsController = {
  // GET /api/vendors/:vendorId/settings
  getVendorSettings: async (req, res) => {
    try {
      const { vendorId } = req.params;
      
      // Validate vendorId
      if (!vendorId) {
        return res.status(400).json({
          success: false,
          message: 'Vendor ID is required'
        });
      }

      const vendorSettings = await vendorSettingsService.getVendorSettings(vendorId);
      
      if (!vendorSettings) {
        return res.status(404).json({
          success: false,
          message: 'Vendor settings not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Vendor settings retrieved successfully',
        data: vendorSettings
      });
    } catch (error) {
      console.error('Error getting vendor settings:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // PUT /api/vendors/:vendorId/settings
  updateVendorSettings: async (req, res) => {
    try {
      const { vendorId } = req.params;
      const settingsData = req.body;

      // Validate vendorId
      if (!vendorId) {
        return res.status(400).json({
          success: false,
          message: 'Vendor ID is required'
        });
      }

      // Validate request body
      if (!settingsData || Object.keys(settingsData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Settings data is required'
        });
      }

      // Validate store name if provided
      if (settingsData.store_name !== undefined && (!settingsData.store_name || !settingsData.store_name.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Store name cannot be empty'
        });
      }

      // Validate email format if provided
      if (settingsData.store_email && !isValidEmail(settingsData.store_email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      // Validate store status if provided
      const validStatuses = ['active', 'inactive', 'suspended', 'pending'];
      if (settingsData.store_status && !validStatuses.includes(settingsData.store_status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid store status. Must be one of: active, inactive, suspended, pending'
        });
      }

      // Validate currency format if provided
      if (settingsData.default_currency && settingsData.default_currency.length !== 3) {
        return res.status(400).json({
          success: false,
          message: 'Currency code must be 3 characters (e.g., USD, EUR)'
        });
      }

      // Validate free shipping threshold if provided
      if (settingsData.free_shipping_threshold !== undefined && settingsData.free_shipping_threshold < 0) {
        return res.status(400).json({
          success: false,
          message: 'Free shipping threshold cannot be negative'
        });
      }

      // Validate rating threshold if provided
      if (settingsData.min_rating_threshold !== undefined && 
          (settingsData.min_rating_threshold < 1 || settingsData.min_rating_threshold > 5)) {
        return res.status(400).json({
          success: false,
          message: 'Rating threshold must be between 1 and 5'
        });
      }

      // Validate domain format if provided
      if (settingsData.custom_domain && !isValidDomain(settingsData.custom_domain)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid domain format'
        });
      }

      const updatedSettings = await vendorSettingsService.updateVendorSettings(vendorId, settingsData);
      
      if (!updatedSettings) {
        return res.status(404).json({
          success: false,
          message: 'Vendor not found or no changes made'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Vendor settings updated successfully',
        data: updatedSettings
      });
    } catch (error) {
      console.error('Error updating vendor settings:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // PUT /api/vendors/:vendorId/settings/basic
  updateBasicSettings: async (req, res) => {
    try {
      const { vendorId } = req.params;
      const basicData = req.body;

      // Validate required fields
      if (basicData.store_name !== undefined && (!basicData.store_name || !basicData.store_name.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Store name cannot be empty'
        });
      }

      // Validate email format if provided
      if (basicData.store_email && !isValidEmail(basicData.store_email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      const updatedSettings = await vendorSettingsService.updateBasicSettings(vendorId, basicData);
      
      if (!updatedSettings) {
        return res.status(404).json({
          success: false,
          message: 'Vendor not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Basic settings updated successfully',
        data: updatedSettings
      });
    } catch (error) {
      console.error('Error updating basic settings:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // PUT /api/vendors/:vendorId/settings/shipping
  updateShippingSettings: async (req, res) => {
    try {
      const { vendorId } = req.params;
      const shippingData = req.body;

      // Validate shipping threshold if provided
      if (shippingData.free_shipping_threshold !== undefined && shippingData.free_shipping_threshold < 0) {
        return res.status(400).json({
          success: false,
          message: 'Free shipping threshold cannot be negative'
        });
      }

      const updatedSettings = await vendorSettingsService.updateShippingSettings(vendorId, shippingData);
      
      if (!updatedSettings) {
        return res.status(404).json({
          success: false,
          message: 'Vendor not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Shipping settings updated successfully',
        data: updatedSettings
      });
    } catch (error) {
      console.error('Error updating shipping settings:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // PUT /api/vendors/:vendorId/settings/payment
  updatePaymentSettings: async (req, res) => {
    try {
      const { vendorId } = req.params;
      const paymentData = req.body;

      const updatedSettings = await vendorSettingsService.updatePaymentSettings(vendorId, paymentData);
      
      if (!updatedSettings) {
        return res.status(404).json({
          success: false,
          message: 'Vendor not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Payment settings updated successfully',
        data: updatedSettings
      });
    } catch (error) {
      console.error('Error updating payment settings:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
};

// Helper function to validate email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to validate domain
const isValidDomain = (domain) => {
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/;
  return domainRegex.test(domain);
};

export default vendorSettingsController;