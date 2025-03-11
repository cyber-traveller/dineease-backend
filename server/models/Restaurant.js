import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  cuisine: [{
    type: String,
    required: true
  }],
  priceRange: {
    type: String,
    enum: ['$', '$$', '$$$', '$$$$'],
    required: true
  },
  images: [{
    url: String,
    caption: String
  }],
  openingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  features: [{
    type: String,
    enum: ['Outdoor Seating', 'Wifi', 'Parking', 'Bar', 'Live Music', 'Private Dining']
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Index for location-based queries
restaurantSchema.index({ 'address.coordinates': '2dsphere' });

// Index for text search
restaurantSchema.index({
  name: 'text',
  description: 'text',
  'cuisine': 'text'
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

export default Restaurant;