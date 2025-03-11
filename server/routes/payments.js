import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { protect } from '../middleware/auth.js';
import Reservation from '../models/Reservation.js';

const router = express.Router();

// Initialize Razorpay instance
const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay API keys are not configured');
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
};

// @route   POST /api/payments/create-order
// @desc    Create a new payment order
// @access  Private
router.post('/create-order', protect, async (req, res) => {
  try {
    const { amount, reservationId } = req.body;

    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    if (reservation.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const options = {
      amount: amount, // Remove the multiplication since it's already handled in frontend
      currency: 'INR',
      receipt: reservationId
    };

    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create(options);

    res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('Create payment order error:', error);
    res.status(500).json({ message: 'Failed to create payment order' });
  }
});

// @route   POST /api/payments/verify
// @desc    Verify payment signature
// @access  Private
router.post('/verify', protect, async (req, res) => {
  try {
    const { reservationId, paymentId, orderId, signature } = req.body;

    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    if (reservation.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === signature) {
      // Update reservation payment status
      reservation.payment.status = 'completed';
      reservation.payment.transactionId = paymentId;
      reservation.payment.paidAt = new Date();
      reservation.status = 'confirmed';
      await reservation.save();

      res.json({ message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ message: 'Invalid payment signature' });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Payment verification failed' });
  }
});

export default router;