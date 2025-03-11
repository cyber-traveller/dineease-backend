import Restaurant from '../models/Restaurant.js';
import Reservation from '../models/Reservation.js';
import Review from '../models/Review.js';

// Get admin dashboard statistics
export const getStats = async (req, res) => {
  try {
    // Get total reservations
    const totalReservations = await Reservation.countDocuments();

    // Calculate total revenue from all reservations
    const reservations = await Reservation.find({ status: 'completed' });
    const totalRevenue = reservations.reduce((sum, reservation) => sum + (reservation.totalAmount || 0), 0);

    // Calculate average rating from all reviews
    const reviews = await Review.find();
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    // Get count of active restaurants
    const activeRestaurants = await Restaurant.countDocuments({ status: 'active' });

    res.json({
      totalReservations,
      totalRevenue,
      averageRating,
      activeRestaurants
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Error fetching admin statistics' });
  }
};

// Get all restaurants for admin
export const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find().populate('owner', 'name email');
    res.json(restaurants);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ message: 'Error fetching restaurants' });
  }
};

// Get all reservations for admin
export const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('user', 'name email')
      .populate('restaurant', 'name');
    res.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ message: 'Error fetching reservations' });
  }
};

// Get all reviews for admin
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name email')
      .populate('restaurant', 'name');
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
};