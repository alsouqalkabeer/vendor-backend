import { pool } from '../index.js';
import bcrypt from 'bcrypt'; // Make sure to install this: npm install bcrypt

const authRepository = {
  // Find vendor by email
  findVendorByEmail: async (email) => {
    const query = 'SELECT * FROM vendors WHERE main_email = $1';
    const { rows } = await pool.query(query, [email]);
    return rows[0];
  },
  
  // Check if password matches (if you store password in the vendors table)
  // Note: In production, you should store hashed passwords
  validateVendorPassword: async (vendor, password) => {
    // If you're using bcrypt for password hashing (recommended)
    // return await bcrypt.compare(password, vendor.password);
    
    // For development, if you're storing plain passwords (not recommended for production)
    return password === vendor.password;
  }
};

export default authRepository;