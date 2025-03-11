import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file
dotenv.config({ path: join(__dirname, '.env') });

// Debugging: Log loaded environment variables
console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
console.log('🔍 MONGODB_URI:', process.env.MONGODB_URI ? '✅ Loaded' : '❌ Missing');
console.log('🔍 JWT_SECRET:', process.env.JWT_SECRET ? '✅ Loaded' : '❌ Missing');
console.log('🔍 RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? '✅ Loaded' : '❌ Missing');
console.log('🔍 RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '✅ Loaded' : '❌ Missing');
console.log('🔍 CLIENT_URL:', process.env.CLIENT_URL ? '✅ Loaded' : '❌ Missing');

// Check for missing required variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'CLIENT_URL'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
} else {
  console.log('✅ All required environment variables are loaded successfully.');
}

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://dineease.vercel.app', 'http://localhost:3000']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// Trust proxy for secure cookies in production
app.set('trust proxy', 1);

// MongoDB Connection with retry logic
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dineease';

const connectWithRetry = () => {
  mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    console.log('🔄 Retrying connection in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  });
};

connectWithRetry();

// Import routes
import authRoutes from './routes/auth.js';
import restaurantRoutes from './routes/restaurants.js';
import reservationRoutes from './routes/reservations.js';
import reviewRoutes from './routes/reviews.js';
import paymentRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';
import ownerRoutes from './routes/owner.js';
import uploadRoutes from './routes/upload.js';
import menuRoutes from './routes/menu.js';

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/menu', menuRoutes);

// API Documentation route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the DineEase API',
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
