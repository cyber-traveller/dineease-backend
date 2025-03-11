import express from 'express';
import { protect } from '../middleware/auth.js';
import checkRole from '../middleware/checkRole.js';
import {
  createMenuItem,
  getMenuItems,
  updateMenuItem,
  deleteMenuItem,
  getMenuItemsByCategory
} from '../controllers/menuController.js';

const router = express.Router();

// Protected routes - only restaurant owners can access
router.use(protect);
router.use(checkRole('owner'));

// CRUD operations for menu items
router.post('/', createMenuItem);
router.get('/', getMenuItems);
router.get('/category/:category', getMenuItemsByCategory);
router.put('/:id', updateMenuItem);
router.delete('/:id', deleteMenuItem);

export default router;