import Menu from '../models/Menu.js';
import Restaurant from '../models/Restaurant.js';

// Create a new menu item
export const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, image } = req.body;
    const restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const menuItem = await Menu.create({
      name,
      description,
      price,
      category,
      image,
      restaurant: restaurant._id
    });

    res.status(201).json(menuItem);
  } catch (error) {
    console.error('❌ Error creating menu item:', error);
    res.status(500).json({ message: 'Error creating menu item' });
  }
};

// Get all menu items for a restaurant
export const getMenuItems = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const menuItems = await Menu.find({ restaurant: restaurant._id });
    res.json(menuItems);
  } catch (error) {
    console.error('❌ Error fetching menu items:', error);
    res.status(500).json({ message: 'Error fetching menu items' });
  }
};

// Update a menu item
export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, image, isAvailable } = req.body;
    
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const menuItem = await Menu.findOne({ _id: id, restaurant: restaurant._id });
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    const updatedMenuItem = await Menu.findByIdAndUpdate(
      id,
      { name, description, price, category, image, isAvailable },
      { new: true, runValidators: true }
    );

    res.json(updatedMenuItem);
  } catch (error) {
    console.error('❌ Error updating menu item:', error);
    res.status(500).json({ message: 'Error updating menu item' });
  }
};

// Delete a menu item
export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const menuItem = await Menu.findOne({ _id: id, restaurant: restaurant._id });
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    await Menu.findByIdAndDelete(id);
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting menu item:', error);
    res.status(500).json({ message: 'Error deleting menu item' });
  }
};

// Get menu items by category
export const getMenuItemsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const menuItems = await Menu.find({
      restaurant: restaurant._id,
      category: category
    });

    res.json(menuItems);
  } catch (error) {
    console.error('❌ Error fetching menu items by category:', error);
    res.status(500).json({ message: 'Error fetching menu items' });
  }
};