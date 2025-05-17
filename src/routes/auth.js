import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configure __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Load users from JSON file
const loadUsers = () => {
  try {
    const usersData = fs.readFileSync(path.join(__dirname, '../data/users.json'), 'utf8');
    return JSON.parse(usersData);
  } catch (error) {
    console.error('Error loading users data:', error);
    return [];
  }
};

// Login route
router.post('/login', (req, res) => {
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
    
    // Load users
    const users = loadUsers();
    console.log(`Looking for user with email: ${email}`);
    console.log(`Total users in database: ${users.length}`);
    
    // Find user by email
    const user = users.find(user => user.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      console.log(`User not found: ${email}`);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }
    
    // Check password
    if (user.password !== password) {
      console.log(`Invalid password for user: ${email}`);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }
    
    console.log(`User authenticated successfully: ${user.email}`);
    
    // Create user data to return (exclude password)
    const userData = { ...user };
    delete userData.password;
    
    // Return success with user data
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userData,
      token: `token-${userData.id}-${Date.now()}` // Generate a simple mock token
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
router.post('/register', (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    
    const { firstName, lastName, email, marketName, marketLocation, password } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !marketName || !marketLocation || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }
    
    // Load current users
    const users = loadUsers();
    
    // Check if email already exists
    if (users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }
    
    // Create new user
    const newUser = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      firstName,
      lastName,
      email,
      marketName,
      marketLocation,
      password,
      role: 'vendor' // Default role
    };
    
    // Add to users array
    users.push(newUser);
    
    // Save back to JSON file
    fs.writeFileSync(
      path.join(__dirname, '../data/users.json'),
      JSON.stringify(users, null, 2),
      'utf8'
    );
    
    console.log('New user registered:', newUser.email);
    
    // Create user data to return (exclude password)
    const userData = { ...newUser };
    delete userData.password;
    
    // Return success with user data
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: userData,
      token: `token-${userData.id}-${Date.now()}` // Generate a simple mock token
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

// Get current user route (protected)
router.get('/me', (req, res) => {
  try {
    // This would normally validate a token from authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
    
    // This is a mock implementation - in a real app, you would verify the token
    // and retrieve the user based on token data
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
    
    // Mock user retrieval - in reality, you would decode the token and find the user
    const users = loadUsers();
    const mockUser = users[0]; // Just return the first user for demo
    
    // Create user data to return (exclude password)
    const userData = { ...mockUser };
    delete userData.password;
    
    res.status(200).json({
      success: true,
      user: userData
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

export default router;