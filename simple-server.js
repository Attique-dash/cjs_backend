const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = "mongodb+srv://attiqueshafeeq246_db_user:v7cHlIFqhQydIqtX@shiping.bdptsvw.mongodb.net/courier_app?retryWrites=true&w=majority";

let db;

// Connect to MongoDB
MongoClient.connect(MONGODB_URI)
  .then(client => {
    db = client.db('courier_app');
    console.log('✅ Connected to MongoDB');
  })
  .catch(err => {
    console.log('❌ MongoDB connection error:', err.message);
  });

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: 'development'
  });
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Mock auth endpoints
app.post('/api/auth/register', (req, res) => {
  res.json({
    success: true,
    message: 'User registered successfully',
    user: {
      id: '123',
      name: req.body.name || 'Test User',
      email: req.body.email || 'test@example.com'
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  res.json({
    success: true,
    message: 'Login successful',
    token: 'mock-jwt-token-12345',
    user: {
      id: '123',
      email: req.body.email || 'test@example.com'
    }
  });
});

// Mock warehouse endpoints
app.get('/api/warehouse', (req, res) => {
  res.json({
    success: true,
    warehouses: [
      { id: 1, name: 'Main Warehouse', location: 'New York' },
      { id: 2, name: 'Secondary Warehouse', location: 'Los Angeles' }
    ]
  });
});

app.get('/api/warehouse/inventory', (req, res) => {
  res.json({
    success: true,
    inventory: [
      { id: 1, product: 'Laptop', quantity: 50, price: 999.99 },
      { id: 2, product: 'Phone', quantity: 100, price: 699.99 }
    ]
  });
});

app.get('/api/warehouse/packages', (req, res) => {
  res.json({
    success: true,
    packages: [
      { id: 1, trackingNumber: 'TRK001', status: 'In Transit', destination: '123 Main St' },
      { id: 2, trackingNumber: 'TRK002', status: 'Delivered', destination: '456 Oak Ave' }
    ]
  });
});

// Other warehouse endpoints
const warehouseEndpoints = [
  '/api/warehouse/customers',
  '/api/warehouse/manifests', 
  '/api/warehouse/messages',
  '/api/warehouse/analytics',
  '/api/warehouse/reports',
  '/api/warehouse/settings',
  '/api/warehouse/staff',
  '/api/warehouse/account'
];

warehouseEndpoints.forEach(endpoint => {
  app.get(endpoint, (req, res) => {
    res.json({
      success: true,
      message: `${endpoint} endpoint working`,
      data: [],
      timestamp: new Date().toISOString()
    });
  });
});

// Mock customer endpoints
const customerEndpoints = [
  '/api/customer',
  '/api/customer/packages',
  '/api/customer/shipping',
  '/api/customer/shipping-addresses',
  '/api/customer/profile'
];

customerEndpoints.forEach(endpoint => {
  app.get(endpoint, (req, res) => {
    res.json({
      success: true,
      message: `${endpoint} endpoint working`,
      data: [],
      timestamp: new Date().toISOString()
    });
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('📋 Available endpoints:');
  console.log('   GET  /health');
  console.log('   GET  /api/health');
  console.log('   POST /api/auth/register');
  console.log('   POST /api/auth/login');
  console.log('   GET  /api/warehouse/*');
  console.log('   GET  /api/customer/*');
  console.log('\n🎯 Ready for Postman testing!');
});

module.exports = app;
