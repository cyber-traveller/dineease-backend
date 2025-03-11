import Restaurant from '../models/Restaurant.js';

// Get all restaurants
export const getRestaurants = async (req, res) => {
  try {
    const { cuisine, priceRange, minRating, features } = req.query;
    const query = {};

    if (cuisine) {
      query.cuisine = { $in: cuisine.split(',') };
    }

    if (priceRange) {
      query.priceRange = { $in: priceRange.split(',') };
    }

    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    if (features) {
      query.features = { $in: features.split(',') };
    }

    const restaurants = await Restaurant.find(query);    
    res.json(restaurants);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ message: 'Error fetching restaurants' });
  }
};

// Get restaurant by ID
export const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.status(500).json({ message: 'Error fetching restaurant' });
  }
};