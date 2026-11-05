const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const seed = require('./utils/seed');

const app = express();

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(morgan('dev'));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts, please try again later.' }
});

app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);

// CORS Configuration for Production & Development
const rawFrontendUrls = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(u => u.trim().replace(/\/+$/, '')).filter(Boolean)
  : [];

const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://vmd-sports.vercel.app',
  'https://vmd-sports.netlify.app'
];

const allowedOrigins = [...new Set([...rawFrontendUrls, ...defaultOrigins])];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/+$/, '');

    // In development or if explicitly allowed
    if (
      process.env.NODE_ENV !== 'production' ||
      allowedOrigins.includes(cleanOrigin) ||
      cleanOrigin.endsWith('.vercel.app') ||
      cleanOrigin.endsWith('.netlify.app')
    ) {
      return callback(null, true);
    }

    console.warn(`Blocked by CORS: ${origin}`);
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/enquiries', require('./routes/enquiries'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/analytics', require('./routes/analytics'));

// Health check
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    success: true,
    brand: 'VMD Sports API',
    database: dbStatus,
    timestamp: new Date()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vmd_sports';

const startServer = async () => {
  try {
    console.log('🔄 Connecting to MongoDB database...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB database successfully');

    // Auto-seed if database is fresh
    try {
      await seed(false);
    } catch (seedErr) {
      console.warn('ℹ️ Seed note:', seedErr.message);
    }
  } catch (err) {
    console.warn('\n⚠️ MongoDB Connection Warning:', err.message);
    console.warn('👉 To connect to MongoDB Atlas, add your connection string to backend/.env:');
    console.warn('   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/vmd_sports\n');
  }

  app.listen(PORT, () => {
    console.log(`🚀 VMD Sports Backend running on http://localhost:${PORT}`);
    console.log(`⚡ API Health Check: http://localhost:${PORT}/api/health`);
  });
};

startServer();

module.exports = app;
