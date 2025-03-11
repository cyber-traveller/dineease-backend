import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
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
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxLength: 1000
  },
  images: [{
    url: String,
    caption: String
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  visitDate: {
    type: Date,
    required: true
  },
  replies: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxLength: 1000
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Ensure one review per user per restaurant
reviewSchema.index({ user: 1, restaurant: 1 }, { unique: true });

// Index for efficient querying
reviewSchema.index({ restaurant: 1, createdAt: -1 });
reviewSchema.index({ status: 1 });

// Update restaurant rating when a review is added or modified
reviewSchema.post('save', async function() {
  const Review = this.constructor;
  const Restaurant = mongoose.model('Restaurant');

  const stats = await Review.aggregate([
    {
      $match: {
        restaurant: this.restaurant,
        status: 'approved'
      }
    },
    {
      $group: {
        _id: '$restaurant',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Restaurant.findByIdAndUpdate(this.restaurant, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].numReviews
    });
  } else {
    await Restaurant.findByIdAndUpdate(this.restaurant, {
      rating: 0,
      reviewCount: 0
    });
  }
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;