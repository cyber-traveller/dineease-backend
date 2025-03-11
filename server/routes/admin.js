import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import { getStats, getAllRestaurants, getAllReservations, getAllReviews } from '../controllers/adminController.js';
import Restaurant from '../models/Restaurant.js';
import Review from '../models/Review.js';

const router = express.Router();

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private/Admin
router.get('/stats', protect, admin, getStats);

// @route   GET /api/admin/restaurants
// @desc    Get all restaurants for admin
// @access  Private/Admin
router.get('/restaurants', protect, admin, getAllRestaurants);

// @route   PATCH /api/admin/restaurants/:id
// @desc    Update restaurant status
// @access  Private/Admin
router.patch('/restaurants/:id', protect, admin, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Update restaurant status
    if (req.body.status !== undefined) {
      restaurant.status = req.body.status;
    }

    // Update isActive flag
    if (req.body.isActive !== undefined) {
      restaurant.isActive = req.body.isActive;
    }

    const updatedRestaurant = await restaurant.save();
    res.json(updatedRestaurant);
  } catch (error) {
    console.error('Update restaurant error:', error);
    res.status(500).json({ message: 'Failed to update restaurant' });
  }
});

// @route   PUT /api/admin/restaurants/:id
// @desc    Update restaurant details
// @access  Private/Admin
// @route   GET /api/admin/reviews
// @desc    Get all reviews for admin
// @access  Private/Admin
router.get('/reviews', protect, admin, getAllReviews);

// @route   PATCH /api/admin/reviews/:id
// @desc    Update review status
// @access  Private/Admin
router.patch('/reviews/:id', protect, admin, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    if (req.body.action === 'approve') {
      review.status = 'approved';
    } else if (req.body.action === 'reject') {
      review.status = 'rejected';
    }
    
    const updatedReview = await review.save();
    res.json(updatedReview);
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Failed to update review' });
  }
});

// @route   DELETE /api/admin/reviews/:id
// @desc    Delete a review
// @access  Private/Admin
router.delete('/reviews/:id', protect, admin, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    await review.remove();
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Failed to delete review' });
  }
});

router.put('/restaurants/:id', protect, admin, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const { name, cuisine, priceRange } = req.body;
    
    restaurant.name = name || restaurant.name;
    restaurant.cuisine = cuisine || restaurant.cuisine;
    restaurant.priceRange = priceRange || restaurant.priceRange;

    const updatedRestaurant = await restaurant.save();
    res.json(updatedRestaurant);
  } catch (error) {
    console.error('Update restaurant error:', error);
    res.status(500).json({ message: 'Failed to update restaurant' });
  }
});

// @route   GET /api/admin/reviews
// @desc    Get all reviews for admin
// @access  Private/Admin
router.get('/reviews', protect, admin, getAllReviews);

// @route   GET /api/admin/reservations
// @desc    Get all reservations for admin
// @access  Private/Admin
router.get('/reservations', protect, admin, getAllReservations);

export default router;