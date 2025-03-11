import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Menu item name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Menu item description is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Menu item price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Menu item category is required'],
    trim: true
  },
  image: {
    url: {
      type: String,
      required: [true, 'Menu item image URL is required']
    },
    caption: {
      type: String,
      default: ''
    }
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Restaurant reference is required']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
menuItemSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Menu = mongoose.model('Menu', menuItemSchema);

export default Menu;