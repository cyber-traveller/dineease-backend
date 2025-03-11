import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  partySize: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  specialRequests: {
    type: String,
    trim: true
  },
  payment: {
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    amount: {
      type: Number,
      required: true
    },
    transactionId: String,
    paymentMethod: String,
    paidAt: Date
  },
  cancelledAt: Date,
  cancelledBy: {
    type: String,
    enum: ['user', 'restaurant', 'system']
  },
  cancellationReason: String
}, {
  timestamps: true
});

// Index for querying reservations
reservationSchema.index({ user: 1, date: 1 });
reservationSchema.index({ restaurant: 1, date: 1 });
reservationSchema.index({ status: 1 });

const Reservation = mongoose.model('Reservation', reservationSchema);

export default Reservation;