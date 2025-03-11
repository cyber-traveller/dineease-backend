import express from 'express';
import Reservation from '../models/Reservation.js';
import Restaurant from '../models/Restaurant.js';
import { protect, restaurantOwner } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/reservations
// @desc    Get user's reservations
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate('restaurant', 'name address images')
      .sort({ date: -1 });

    res.json(reservations);
  } catch (error) {
    console.error('Get reservations error:', error);
    res.status(500).json({ message: 'Failed to get reservations' });
  }
});

// @route   GET /api/reservations/restaurant/:restaurantId
// @desc    Get restaurant's reservations (for restaurant owners)
// @access  Private/RestaurantOwner
router.get('/restaurant/:restaurantId', protect, restaurantOwner, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Verify ownership
    if (restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view these reservations' });
    }

    const reservations = await Reservation.find({ restaurant: req.params.restaurantId })
      .populate('user', 'name email phoneNumber')
      .sort({ date: -1 });

    res.json(reservations);
  } catch (error) {
    console.error('Get restaurant reservations error:', error);
    res.status(500).json({ message: 'Failed to get reservations' });
  }
});

// @route   POST /api/reservations
// @desc    Create a new reservation
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { restaurantId, date, time, partySize, specialRequests } = req.body;

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Create reservation
    const reservation = new Reservation({
      user: req.user._id,
      restaurant: restaurantId,
      date,
      time,
      partySize,
      specialRequests,
      payment: {
        amount: 0, // Set actual amount based on your business logic
        status: 'pending'
      }
    });

    const createdReservation = await reservation.save();
    res.status(201).json(createdReservation);
  } catch (error) {
    console.error('Create reservation error:', error);
    res.status(500).json({ message: 'Failed to create reservation' });
  }
});

// @route   PUT /api/reservations/:id
// @desc    Update reservation status
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Check authorization
    const restaurant = await Restaurant.findById(reservation.restaurant);
    const isOwner = restaurant && restaurant.owner.toString() === req.user._id.toString();
    const isCustomer = reservation.user.toString() === req.user._id.toString();

    if (!isOwner && !isCustomer) {
      return res.status(403).json({ message: 'Not authorized to update this reservation' });
    }

    // Update reservation
    if (req.body.status) {
      reservation.status = req.body.status;
      if (req.body.status === 'cancelled') {
        reservation.cancelledAt = new Date();
        reservation.cancelledBy = isOwner ? 'restaurant' : 'user';
        reservation.cancellationReason = req.body.cancellationReason;
      }
    }

    const updatedReservation = await reservation.save();
    res.json(updatedReservation);
  } catch (error) {
    console.error('Update reservation error:', error);
    res.status(500).json({ message: 'Failed to update reservation' });
  }
});

// @route   PUT /api/reservations/:id/payment
// @desc    Update reservation payment status
// @access  Private
router.put('/:id/payment', protect, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Verify user owns the reservation
    if (reservation.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update payment details
    reservation.payment = {
      ...reservation.payment,
      ...req.body,
      paidAt: new Date()
    };

    if (req.body.status === 'completed') {
      reservation.status = 'confirmed';
    }

    const updatedReservation = await reservation.save();
    res.json(updatedReservation);
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ message: 'Failed to update payment' });
  }
});

export default router;