import accountService from '../services/accountService.js';

const accountController = {
  // GET /api/account/:id/settings
  getAccountSettings: async (req, res) => {
    try {
      const { id } = req.params;
      const accountSettings = await accountService.getAccountSettings(id);
      
      if (!accountSettings) {
        return res.status(404).json({
          success: false,
          message: 'Account settings not found'
        });
      }

      res.status(200).json({
        success: true,
        data: accountSettings
      });
    } catch (error) {
      console.error('Error getting account settings:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // PUT /api/account/:id/settings
  updateAccountSettings: async (req, res) => {
    try {
      const { id } = req.params;
      const settingsData = req.body;

      // Validate required fields
      if (!settingsData.name) {
        return res.status(400).json({
          success: false,
          message: 'Name is required'
        });
      }

      const updatedSettings = await accountService.updateAccountSettings(id, settingsData);
      
      if (!updatedSettings) {
        return res.status(404).json({
          success: false,
          message: 'Account not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Account settings updated successfully',
        data: updatedSettings
      });
    } catch (error) {
      console.error('Error updating account settings:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // PUT /api/account/:id/profile
  updateProfile: async (req, res) => {
    try {
      const { id } = req.params;
      const profileData = req.body;

      const updatedProfile = await accountService.updateProfile(id, profileData);
      
      if (!updatedProfile) {
        return res.status(404).json({
          success: false,
          message: 'Account not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedProfile
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // PUT /api/account/:id/contact
  updateContact: async (req, res) => {
    try {
      const { id } = req.params;
      const contactData = req.body;

      // Validate email format if provided
      if (contactData.main_email && !isValidEmail(contactData.main_email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      const updatedContact = await accountService.updateContact(id, contactData);
      
      if (!updatedContact) {
        return res.status(404).json({
          success: false,
          message: 'Account not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Contact information updated successfully',
        data: updatedContact
      });
    } catch (error) {
      console.error('Error updating contact:', error);
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

export default accountController;