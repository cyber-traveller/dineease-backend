import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../../.env.production') });
console.log('MongoDB URI:', process.env.MONGODB_URI);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Admin user data
const adminData = {
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'admin123',  // Change this to a secure password
  role: 'admin',
  phoneNumber: '+1234567890'
};

// Create admin user
async function createAdminUser() {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ email: adminData.email });
    if (adminExists) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create new admin user
    const admin = await User.create(adminData);
    console.log('Admin user created successfully:', admin.email);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();