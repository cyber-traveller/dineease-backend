import express from 'express';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/restaurant-owner/register
// @desc    Register a new restaurant owner
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user with restaurant_owner role
    const user = await User.create({
      name,
      email,
      password,
      phoneNumber,
      role: 'restaurant_owner'
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Restaurant owner registration error:', error);
    res.status(500).json({ 
      message: 'Failed to register restaurant owner',
      error: error.message 
    });
  }
});

// @route   GET /api/restaurant-owner/profile
// @desc    Get restaurant owner profile
// @access  Private/RestaurantOwner
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (user && user.role === 'restaurant_owner') {
      res.json(user);
    } else {
      res.status(404).json({ message: 'Restaurant owner not found' });
    }
  } catch (error) {
    console.error('Get restaurant owner profile error:', error);
    res.status(500).json({ message: 'Failed to get profile' });
  }
});

export default router;