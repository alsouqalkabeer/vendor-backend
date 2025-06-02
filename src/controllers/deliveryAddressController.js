import deliveryAddressService from '../services/deliveryAddressService.js';

const deliveryAddressController = {
  // GET /api/vendors/:vendorId/delivery-addresses
  getDeliveryAddresses: async (req, res) => {
    try {
      const { vendorId } = req.params;
      const { status } = req.query; // Optional filter by status
      
      if (!vendorId) {
        return res.status(400).json({
          success: false,
          message: 'Vendor ID is required'
        });
      }

      const addresses = await deliveryAddressService.getDeliveryAddresses(vendorId, status);
      
      res.status(200).json({
        success: true,
        message: 'Delivery addresses retrieved successfully',
        data: {
          addresses,
          total: addresses.length
        }
      });
    } catch (error) {
      console.error('Error getting delivery addresses:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // POST /api/vendors/:vendorId/delivery-addresses
  createDeliveryAddress: async (req, res) => {
    try {
      const { vendorId } = req.params;
      const { address, country, city, email, mobile, status } = req.body;

      // Validate required fields
      if (!vendorId) {
        return res.status(400).json({
          success: false,
          message: 'Vendor ID is required'
        });
      }

      if (!address || !country || !city || !email || !mobile) {
        return res.status(400).json({
          success: false,
          message: 'Address, country, city, email, and mobile are required'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      // Validate mobile format (basic validation)
      const mobileRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!mobileRegex.test(mobile.replace(/[\s\-\(\)]/g, ''))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid mobile number format'
        });
      }

      // Validate status if provided
      if (status && !['available', 'unavailable'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be either "available" or "unavailable"'
        });
      }

      const addressData = {
        address: address.trim(),
        country: country.trim(),
        city: city.trim(),
        email: email.trim().toLowerCase(),
        mobile: mobile.trim(),
        status: status || 'available'
      };

      const newAddress = await deliveryAddressService.createDeliveryAddress(vendorId, addressData);
      
      res.status(201).json({
        success: true,
        message: 'Delivery address created successfully',
        data: newAddress
      });
    } catch (error) {
      console.error('Error creating delivery address:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // PUT /api/delivery-addresses/:id
  updateDeliveryAddress: async (req, res) => {
    try {
      const { id } = req.params;
      const { address, country, city, email, mobile, status } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Address ID is required'
        });
      }

      // Validate at least one field is provided
      if (!address && !country && !city && !email && !mobile && !status) {
        return res.status(400).json({
          success: false,
          message: 'At least one field must be provided for update'
        });
      }

      const updateData = {};
      
      if (address) updateData.address = address.trim();
      if (country) updateData.country = country.trim();
      if (city) updateData.city = city.trim();
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid email format'
          });
        }
        updateData.email = email.trim().toLowerCase();
      }
      if (mobile) {
        const mobileRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!mobileRegex.test(mobile.replace(/[\s\-\(\)]/g, ''))) {
          return res.status(400).json({
            success: false,
            message: 'Invalid mobile number format'
          });
        }
        updateData.mobile = mobile.trim();
      }
      if (status) {
        if (!['available', 'unavailable'].includes(status)) {
          return res.status(400).json({
            success: false,
            message: 'Status must be either "available" or "unavailable"'
          });
        }
        updateData.status = status;
      }

      const updatedAddress = await deliveryAddressService.updateDeliveryAddress(id, updateData);
      
      if (!updatedAddress) {
        return res.status(404).json({
          success: false,
          message: 'Delivery address not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Delivery address updated successfully',
        data: updatedAddress
      });
    } catch (error) {
      console.error('Error updating delivery address:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // DELETE /api/delivery-addresses/:id
  deleteDeliveryAddress: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Address ID is required'
        });
      }

      const deleted = await deliveryAddressService.deleteDeliveryAddress(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Delivery address not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Delivery address deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting delivery address:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // PATCH /api/delivery-addresses/:id/status
  toggleStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Address ID is required'
        });
      }

      if (!status || !['available', 'unavailable'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Valid status is required (available or unavailable)'
        });
      }

      const updatedAddress = await deliveryAddressService.updateStatus(id, status);
      
      if (!updatedAddress) {
        return res.status(404).json({
          success: false,
          message: 'Delivery address not found'
        });
      }

      res.status(200).json({
        success: true,
        message: `Delivery address status updated to ${status}`,
        data: updatedAddress
      });
    } catch (error) {
      console.error('Error updating delivery address status:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
};

export default deliveryAddressController;