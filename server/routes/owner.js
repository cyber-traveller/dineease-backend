import express from 'express';
import Restaurant from '../models/Restaurant.js';
import Reservation from '../models/Reservation.js';
import Review from '../models/Review.js';
import { protect, restaurantOwner } from '../middleware/auth.js';
import { cloudinary } from '../config/cloudinary.js';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { getOwnerRestaurant, getRestaurantStats } from '../controllers/ownerController.js';

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'restaurant-images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  }
});

const upload = multer({ storage: storage });

const router = express.Router();

// @route   GET /api/owner/restaurant
// @desc    Get restaurant owner's restaurant details
// @access  Private/RestaurantOwner
router.get('/restaurant', protect, restaurantOwner, async (req, res) => {
  try {
    console.log('Fetching restaurant for owner:', req.user._id);
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    
    if (!restaurant) {
      console.log('No restaurant found for owner:', req.user._id);
      return res.status(404).json({ message: 'Restaurant not found for this owner' });
    }

    console.log('Restaurant found:', restaurant._id);
    res.json(restaurant);
  } catch (error) {
    console.error('Error fetching owner restaurant:', error);
    res.status(500).json({ message: 'Failed to fetch restaurant details' });
  }
});

// @route   GET /api/owner/restaurant/stats
// @desc    Get restaurant statistics
// @access  Private/RestaurantOwner
router.get('/restaurant/stats', protect, restaurantOwner, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const [reservations, reviews] = await Promise.all([
      Reservation.find({ restaurant: restaurant._id }),
      Review.find({ restaurant: restaurant._id })
    ]);

    const completedReservations = reservations.filter(r => r.payment && r.payment.status === 'completed');
    const totalRevenue = completedReservations.reduce((sum, r) => sum + (r.payment?.amount || 0), 0);
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    const stats = {
      totalReservations: reservations.length,
      pendingReservations: reservations.filter(r => r.status === 'pending').length,
      totalRevenue: totalRevenue,
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews: reviews.length
    };

    res.json(stats);
  } catch (error) {
    console.error('Get restaurant stats error:', error);
    res.status(500).json({ message: 'Failed to get restaurant statistics' });
  }
});

export default router;