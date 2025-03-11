import express from 'express';
import Review from '../models/Review.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/reviews
// @desc    Get all reviews with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { restaurant, status, sort = 'createdAt' } = req.query;
    const query = {};

    if (restaurant) query.restaurant = restaurant;
    if (status) query.status = status;

    const sortObj = {};
    if (sort === 'createdAt') sortObj.createdAt = -1;
    else if (sort === 'rating') sortObj.rating = -1;

    const reviews = await Review.find(query)
      .sort(sortObj)
      .populate('user', 'name avatar')
      .populate('restaurant', 'name');

    res.json(reviews);
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Failed to get reviews' });
  }
});

// @route   GET /api/reviews/:id
// @desc    Get review by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'name avatar')
      .populate('restaurant', 'name');

    if (review) {
      res.json(review);
    } else {
      res.status(404).json({ message: 'Review not found' });
    }
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({ message: 'Failed to get review' });
  }
});

// @route   POST /api/reviews
// @desc    Create a new review
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { images, ...reviewData } = req.body;
    
    // Handle image URLs if provided
    const uploadedImages = [];
    if (images && images.length > 0) {
      uploadedImages.push(...images.map(image => ({
        url: image,
        caption: ''
      })));
    }

    const review = new Review({
      ...reviewData,
      images: uploadedImages,
      user: req.user._id,
      status: 'pending'
    });

    const createdReview = await review.save();
    res.status(201).json(createdReview);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'You have already reviewed this restaurant' });
    } else {
      console.error('Create review error:', error);
      res.status(500).json({ message: 'Failed to create review' });
    }
  }
});

// @route   PUT /api/reviews/:id
// @desc    Update review
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (review) {
      if (review.user.toString() !== req.user._id.toString() && 
          req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to update this review' });
      }

      Object.assign(review, req.body);
      const updatedReview = await review.save();
      res.json(updatedReview);
    } else {
      res.status(404).json({ message: 'Review not found' });
    }
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Failed to update review' });
  }
});

// @route   POST /api/reviews/:id/replies
// @desc    Add a reply to a review
// @access  Private (Restaurant Owners)
router.post('/:id/replies', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if the user is the owner of the restaurant
    const restaurant = await Restaurant.findById(review.restaurant);
    if (!restaurant || restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only restaurant owners can reply to reviews' });
    }

    const reply = {
      user: req.user._id,
      comment: req.body.comment
    };

    review.replies.push(reply);
    await review.save();

    const updatedReview = await Review.findById(req.params.id)
      .populate('user', 'name avatar')
      .populate('replies.user', 'name avatar role');

    res.json(updatedReview);
  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({ message: 'Failed to add reply' });
  }
});

// @route   DELETE /api/reviews/:id/replies/:replyId
// @desc    Delete a reply from a review
// @access  Private (Restaurant Owners)
router.delete('/:id/replies/:replyId', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const reply = review.replies.id(req.params.replyId);

    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    if (reply.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this reply' });
    }

    reply.remove();
    await review.save();

    res.json({ message: 'Reply removed' });
  } catch (error) {
    console.error('Delete reply error:', error);
    res.status(500).json({ message: 'Failed to delete reply' });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete review
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user is the review owner or an admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await Review.deleteOne({ _id: review._id });
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Failed to delete review' });
  }
});

// @route   PUT /api/reviews/:id/status
// @desc    Update review status (approve/reject)
// @access  Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    const review = await Review.findById(req.params.id);

    if (review) {
      review.status = status;
      const updatedReview = await review.save();
      res.json(updatedReview);
    } else {
      res.status(404).json({ message: 'Review not found' });
    }
  } catch (error) {
    console.error('Update review status error:', error);
    res.status(500).json({ message: 'Failed to update review status' });
  }
});

// @route   PUT /api/reviews/:id/like
// @desc    Like/unlike a review
// @access  Private
router.put('/:id/like', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (review) {
      const likeIndex = review.likes.indexOf(req.user._id);
      if (likeIndex === -1) {
        review.likes.push(req.user._id);
      } else {
        review.likes.splice(likeIndex, 1);
      }

      const updatedReview = await review.save();
      res.json(updatedReview);
    } else {
      res.status(404).json({ message: 'Review not found' });
    }
  } catch (error) {
    console.error('Like review error:', error);
    res.status(500).json({ message: 'Failed to like/unlike review' });
  }
});

export default router;