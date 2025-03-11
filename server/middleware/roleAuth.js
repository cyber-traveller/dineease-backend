import { protect } from './auth.js';

// Role-based middleware
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    protect(req, res, () => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          message: `Role ${req.user.role} is not authorized to access this resource`
        });
      }
      next();
    });
  };
};

// Specific role-based middleware functions
export const isAdmin = authorizeRoles('admin');
export const isRestaurantOwner = authorizeRoles('restaurant_owner');
export const isUser = authorizeRoles('user');

// Combined middleware for multiple roles
export const isAdminOrOwner = (req, res, next) => {
  protect(req, res, () => {
    if (!['admin', 'restaurant_owner'].includes(req.user.role)) {
      return res.status(403).json({
        message: 'Not authorized to access this resource'
      });
    }
    next();
  });
};