import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import Review from '../models/Review.js';
import Reservation from '../models/Reservation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../../.env') });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Read sample data
const sampleData = JSON.parse(
  fs.readFileSync(join(__dirname, '../examples/sample-data.json'), 'utf-8')
);

const restaurantsData = JSON.parse(
  fs.readFileSync(join(__dirname, '../examples/restaurants-data.json'), 'utf-8')
);

async function importData() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await Review.deleteMany({});
    await Reservation.deleteMany({});

    console.log('Existing data cleared');

    // Import users
    const processedUsers = sampleData.users.map(user => {
      const { _id, ...userData } = user;
      return userData;
    });
    const users = await User.create(processedUsers);
    console.log('Users imported');

    // Map user emails to their IDs
    const userMap = users.reduce((map, user) => {
      map[user.email] = user._id;
      return map;
    }, {});

    // Process restaurants data
    const restaurantsWithOwners = restaurantsData.map(restaurant => ({
      ...restaurant,
      owner: userMap['owner@restaurant.com'], // Assign to the restaurant owner
      address: {
        ...restaurant.address,
        coordinates: {
          type: 'Point',
          coordinates: [restaurant.address.coordinates[0], restaurant.address.coordinates[1]]
        }
      }
    }));

    // Import restaurants
    const restaurants = await Restaurant.create(restaurantsWithOwners);
    console.log('Restaurants imported');

    // Process and import reservations
    const reservationsWithIds = sampleData.reservations.map(reservation => {
      const { _id, ...reservationData } = reservation;
      return {
        ...reservationData,
        user: userMap[sampleData.users[0].email],
        restaurant: restaurants[0]._id
      };
    });

    await Reservation.create(reservationsWithIds);
    console.log('Reservations imported');

    // Process and import reviews
    if (sampleData.reviews) {
      const reviewsWithIds = sampleData.reviews.map(review => {
        const { _id, ...reviewData } = review;
        return {
          ...reviewData,
          user: userMap[sampleData.users[0].email],
          restaurant: restaurants[0]._id,
          visitDate: new Date(),
          title: 'Great Experience',
          images: review.images ? review.images.map(url => ({ url, caption: '' })) : [],
          likes: [],
          replies: review.replies ? review.replies.map(reply => {
            const { _id, ...replyData } = reply;
            return {
              ...replyData,
              user: userMap['owner@restaurant.com']
            };
          }) : []
        };
      });

      await Review.create(reviewsWithIds);
      console.log('Reviews imported');
    }

    console.log('All data imported successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
}

importData();