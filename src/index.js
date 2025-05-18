import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
const { Pool } = pg;
import dashboardRoutes from './routes/dashboardRoutes.js';

// Import routes
import authRoutes from './routes/auth.js';
import vendorRoutes from './routes/vendorRoutes.js';
import productRoutes from './routes/productRoutes.js';

// Configure __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize dotenv
dotenv.config();

// Create Express app
const app = express();

// Initialize PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false,
    sslmode: 'require'
  }
});

// Test database connection
const testDbConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('PostgreSQL database connected successfully');
    client.release();
  } catch (error) {
    console.error('Database connection error:', error);
  }
};

testDbConnection();

// Make the pool available to the app
app.locals.db = pool;

// CORS Configuration - Very permissive for development
app.use(cors({
  origin: '*',                               // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow all common HTTP methods
  allowedHeaders: '*',                       // Allow all headers
  credentials: true                          // Allow cookies
}));

// Pre-flight requests
app.options('*', cors());

// Body parser middleware - Make sure this comes BEFORE routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware to log all requests
app.use((req, res, next) => {
  const now = new Date().toISOString();
  console.log(`[${now}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Create users.json if it doesn't exist
const usersFilePath = path.join(dataDir, 'users.json');
if (!fs.existsSync(usersFilePath)) {
  const initialUsers = [
    {
      "id": 1,
      "firstName": "Ahmed",
      "lastName": "Amer",
      "email": "ahmed.amer@gmail.com",
      "marketName": "Teddy Store",
      "marketLocation": "Cairo, Egypt",
      "password": "Password123",
      "role": "admin"
    },
    {
      "id": 2,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "marketName": "John's Market",
      "marketLocation": "New York, USA",
      "password": "Password123",
      "role": "vendor"
    },
    {
      "id": 3,
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@example.com",
      "marketName": "Jane's Shop",
      "marketLocation": "London, UK",
      "password": "Password123",
      "role": "vendor"
    },
    {
      "id": 4,
      "firstName": "Demo",
      "lastName": "User",
      "email": "demo@example.com",
      "marketName": "Demo Store",
      "marketLocation": "Demo City, Country",
      "password": "Demo123",
      "role": "vendor"
    }
  ];
  fs.writeFileSync(usersFilePath, JSON.stringify(initialUsers, null, 2), 'utf8');
  console.log('Created initial users.json file');
}

// Root route
app.get('/', (req, res) => {
  res.send('Vendor Backend Running!');
});

// Test route to verify CORS
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working correctly!' });
});

// Use authentication routes
app.use('/api/auth', authRoutes);

// Use vendor and product routes
app.use('/api/vendors', vendorRoutes);
app.use('/api/products', productRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Server error',
    error: err.message
  });
});

// Handle 404s
app.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Define port
const PORT = process.env.PORT || 5001;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}/api`);
  console.log('CORS: Enabled for all origins (development mode)');
  console.log('PostgreSQL database: Connected');
});

export { pool };