import express from 'express';
import jwt from 'jsonwebtoken'; // Make sure to install: npm install jsonwebtoken
import bcrypt from 'bcrypt'; // Make sure to install: npm install bcrypt
import { pool } from '../index.js';

const router = express.Router();

// Find vendor in PostgreSQL database
const findVendorByEmail = async (email) => {
  try {
    const query = 'SELECT * FROM vendors WHERE main_email = $1';
    const { rows } = await pool.query(query, [email]);
    return rows[0];
  } catch (error) {
    console.error('Error finding vendor in database:', error);
    return null;
  }
};

// Login route
router.post('/login', async (req, res) => {
  try {
    console.log('Login request received');
    console.log('Request body:', req.body);
    
    // Check if the body is undefined or null
    if (!req.body) {
      console.error('Request body is undefined or null');
      return res.status(400).json({ 
        success: false, 
        message: 'Missing request body' 
      });
    }
    
    const { email, password } = req.body;
    
    // Log received credentials
    console.log('Email received:', email);
    console.log('Password length:', password ? password.length : 0);
    
    // Validate input
    if (!email || !password) {
      console.error('Missing email or password');
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Find the vendor in the PostgreSQL database
    const vendor = await findVendorByEmail(email);
    
    if (!vendor) {
      console.log(`Vendor not found with email: ${email}`);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }
    
    // Check if password field exists in the vendor record
    if (!vendor.password) {
      console.log(`Vendor has no password set: ${email}`);
      
      // Temporary fallback during transition: check against hardcoded password
      if (password !== 'Password123') {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }
    } else {
      // Compare the provided password with the stored hash
      const isPasswordValid = await bcrypt.compare(password, vendor.password);
      
      if (!isPasswordValid) {
        console.log(`Invalid password for vendor: ${email}`);
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }
    }
    
    console.log(`Vendor authenticated successfully: ${vendor.name}`);
    
    // Extract first and last name from market_name
    let firstName = 'Vendor';
    let lastName = '';
    
    if (vendor.market_name && vendor.market_name.includes(' ')) {
      [firstName, ...lastName] = vendor.market_name.split(' ');
      lastName = lastName.join(' ');
    } else if (vendor.market_name) {
      firstName = vendor.market_name;
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: vendor.id,
        email: vendor.main_email,
        name: vendor.name,
        role: 'vendor'
      },
      process.env.JWT_SECRET || 'vendor-backend-secret',
      { expiresIn: '1d' }
    );
    
    // Return success with vendor data in the format expected by the frontend
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: vendor.id,
        firstName,
        lastName,
        email: vendor.main_email,
        marketName: vendor.market_name,
        marketLocation: `${vendor.city}, ${vendor.country}`,
        role: 'vendor',
        primaryColor: vendor.primary_color,
        slug: vendor.slug
      },
      token
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Registration route
router.post('/register', async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    
    const { firstName, lastName, email, marketName, marketLocation, password } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }
    
    // Check if email already exists in PostgreSQL
    const existingVendor = await findVendorByEmail(email);
    if (existingVendor) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }
    
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Generate default marketName and marketLocation if not provided
    const finalMarketName = marketName || `${firstName}'s Store`;
    let city = 'Cairo'; // Default city
    let country = 'Egypt'; // Default country
    
    // Extract city and country from marketLocation if provided
    if (marketLocation && marketLocation.includes(',')) {
      const locationParts = marketLocation.split(',');
      city = locationParts[0].trim();
      country = locationParts[1].trim();
    }
    
    // Create base slug from market name
    let baseSlug = finalMarketName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    // Check if the slug already exists and generate a unique one if needed
    let slug = baseSlug;
    let slugExists = true;
    let counter = 1;
    
    while (slugExists) {
      // Check if the current slug exists
      const slugQuery = 'SELECT id FROM vendors WHERE slug = $1';
      const { rows } = await pool.query(slugQuery, [slug]);
      
      if (rows.length === 0) {
        // Slug is unique, we can use it
        slugExists = false;
      } else {
        // Slug exists, try with a counter
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }
    
    // Create entry in PostgreSQL vendors table
    const insertQuery = `
      INSERT INTO vendors (
        name, 
        slug, 
        description, 
        primary_color,
        market_name, 
        main_email, 
        country, 
        city,
        status,
        password
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const values = [
      finalMarketName,
      slug, // Now using the unique slug
      `${finalMarketName} - A vendor on our platform`,
      '#3F51B5', // Default blue color
      finalMarketName,
      email,
      country,
      city,
      'active',
      hashedPassword // Store the hashed password
    ];
    
    const { rows } = await pool.query(insertQuery, values);
    const newVendor = rows[0];
    console.log('New vendor created in PostgreSQL with ID:', newVendor.id);
    console.log('Using unique slug:', slug);
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: newVendor.id,
        email: newVendor.main_email,
        name: newVendor.name,
        role: 'vendor'
      },
      process.env.JWT_SECRET || 'vendor-backend-secret',
      { expiresIn: '1d' }
    );
    
    // Return success with vendor data
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        id: newVendor.id,
        firstName,
        lastName,
        email: newVendor.main_email,
        marketName: newVendor.market_name,
        marketLocation: `${newVendor.city}, ${newVendor.country}`,
        role: 'vendor',
        // Include additional vendor data
        primaryColor: newVendor.primary_color,
        slug: newVendor.slug
      },
      token
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Verify JWT token middleware
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vendor-backend-secret');
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

// Get current user route (protected)
router.get('/me', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get vendor from PostgreSQL
    const query = 'SELECT * FROM vendors WHERE id = $1';
    const { rows } = await pool.query(query, [userId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Vendor not found' 
      });
    }
    
    const vendor = rows[0];
    
    // Extract first and last name from market_name
    let firstName = 'Vendor';
    let lastName = '';
    
    if (vendor.market_name && vendor.market_name.includes(' ')) {
      [firstName, ...lastName] = vendor.market_name.split(' ');
      lastName = lastName.join(' ');
    } else if (vendor.market_name) {
      firstName = vendor.market_name;
    }
    
    return res.status(200).json({
      success: true,
      user: {
        id: vendor.id,
        firstName,
        lastName,
        email: vendor.main_email,
        marketName: vendor.market_name,
        marketLocation: `${vendor.city}, ${vendor.country}`,
        role: 'vendor',
        // Include additional vendor data
        primaryColor: vendor.primary_color,
        slug: vendor.slug
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Validate token endpoint
router.get('/validate', verifyToken, (req, res) => {
  try {
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
});

export default router;