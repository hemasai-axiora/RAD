const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const db = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const posRoutes = require('./routes/posRoutes');
const customerRoutes = require('./routes/customerRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: true, // Allow all origins for dev, or specify frontend port
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    const dbCheck = await db.query('SELECT NOW()');
    res.json({ 
      success: true, 
      message: 'RAD API is running smoothly', 
      dbTime: dbCheck.rows[0].now 
    });
  } catch (err) {
    console.error('Health check failed:', err);
    res.status(500).json({ success: false, message: 'Database connection failed' });
  }
});

// Route mountings
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/pos', posRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/reports', reportRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: err.message || 'Something went wrong on the server!' 
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`RAD Backend Server is running on port ${PORT}`);
});
