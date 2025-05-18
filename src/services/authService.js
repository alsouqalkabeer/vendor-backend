import authRepository from '../data/authRepository.js';
import jwt from 'jsonwebtoken'; // Make sure to install this: npm install jsonwebtoken

const authService = {
  loginVendor: async (email, password) => {
    // Find the vendor by email
    const vendor = await authRepository.findVendorByEmail(email);
    
    // If vendor doesn't exist
    if (!vendor) {
      throw new Error('Invalid credentials');
    }
    
    // Validate password (this depends on how you've stored passwords)
    const isValidPassword = await authRepository.validateVendorPassword(vendor, password);
    
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: vendor.id,
        email: vendor.main_email,
        name: vendor.name,
        role: 'vendor'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );
    
    return {
      vendor,
      token
    };
  }
};

export default authService;