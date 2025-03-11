import Restaurant from '../models/Restaurant.js';
import Reservation from '../models/Reservation.js';
import Review from '../models/Review.js';

// Get restaurant details for the owner
export const getOwnerRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ owner: req.user._id });
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }
        res.status(200).json(restaurant);
    } catch (error) {
        console.error('Error in getOwnerRestaurant:', error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get restaurant statistics
export const getRestaurantStats = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ owner: req.user._id });
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        // Get reservations count
        const reservationsCount = await Reservation.countDocuments({ restaurant: restaurant._id });

        // Get reviews stats
        const reviews = await Review.find({ restaurant: restaurant._id });
        const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / (reviews.length || 1);

        const stats = {
            totalReservations: reservationsCount,
            totalReviews: reviews.length,
            averageRating: parseFloat(averageRating.toFixed(1)),
            // Add more stats as needed
        };

        res.status(200).json(stats);
    } catch (error) {
        console.error('Error in getRestaurantStats:', error);
        res.status(500).json({ message: "Server error" });
    }
};