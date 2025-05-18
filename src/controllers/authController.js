import authService from '../services/authService.js';

const authController = {
  // POST /api/auth/login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Validate request
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }
      
      // Attempt login
      const { vendor, token } = await authService.loginVendor(email, password);
      
      // Return response with vendor data and token
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          vendor: {
            id: vendor.id,
            name: vendor.name,
            email: vendor.main_email,
            marketName: vendor.market_name,
            primaryColor: vendor.primary_color,
            slug: vendor.slug,
            country: vendor.country,
            city: vendor.city
          },
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.message === 'Invalid credentials') {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  },
  
  // POST /api/auth/validate
  validateToken: async (req, res) => {
    try {
      // The user data is already attached to the request by the auth middleware
      res.status(200).json({
        success: true,
        message: 'Token is valid',
        data: {
          user: req.user
        }
      });
    } catch (error) {
      console.error('Token validation error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
};

export default authController;