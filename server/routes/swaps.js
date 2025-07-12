const express = require('express');
const { body, validationResult } = require('express-validator');
const Swap = require('../models/Swap');
const Item = require('../models/Item');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/swaps
// @desc    Create a new swap request
// @access  Private
router.post('/', [
  auth,
  body('itemId').isMongoId().withMessage('Valid item ID is required'),
  body('swapType').isIn(['direct', 'points']).withMessage('Swap type must be direct or points'),
  body('pointsOffered').optional().isInt({ min: 0 }).withMessage('Points offered must be a positive number'),
  body('message').optional().trim().isLength({ max: 500 }).withMessage('Message must be less than 500 characters'),
  body('offeredItemId').optional().isMongoId().withMessage('Valid offered item ID is required for direct swaps')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { itemId, swapType, pointsOffered, message, offeredItemId } = req.body;

    // Check if item exists and is available
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (!item.isAvailable) {
      return res.status(400).json({ message: 'Item is not available for swap' });
    }

    // Check if user is not trying to swap their own item
    if (item.uploaderId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot swap your own item' });
    }

    // Check if user already has a pending swap for this item
    const existingSwap = await Swap.findOne({
      itemId,
      requesterId: req.user._id,
      status: 'pending'
    });

    if (existingSwap) {
      return res.status(400).json({ message: 'You already have a pending swap request for this item' });
    }

    // Validate points-based swap
    if (swapType === 'points') {
      if (!pointsOffered || pointsOffered <= 0) {
        return res.status(400).json({ message: 'Points offered is required for points-based swaps' });
      }

      if (req.user.points < pointsOffered) {
        return res.status(400).json({ message: 'Insufficient points' });
      }
    }

    // Validate direct swap
    if (swapType === 'direct') {
      if (!offeredItemId) {
        return res.status(400).json({ message: 'Offered item is required for direct swaps' });
      }

      const offeredItem = await Item.findById(offeredItemId);
      if (!offeredItem) {
        return res.status(404).json({ message: 'Offered item not found' });
      }

      if (offeredItem.uploaderId.toString() !== req.user._id.toString()) {
        return res.status(400).json({ message: 'You can only offer your own items' });
      }

      if (!offeredItem.isAvailable) {
        return res.status(400).json({ message: 'Offered item is not available' });
      }
    }

    const swap = new Swap({
      requesterId: req.user._id,
      ownerId: item.uploaderId,
      itemId,
      swapType,
      pointsOffered: pointsOffered || 0,
      message,
      offeredItemId
    });

    await swap.save();

    // Add swap request to item
    await Item.findByIdAndUpdate(itemId, {
      $push: { swapRequests: swap._id }
    });

    res.status(201).json({ swap });
  } catch (error) {
    console.error('Create swap error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/swaps
// @desc    Get user's swaps (incoming and outgoing)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, type = 'all' } = req.query;
    const query = {};

    if (type === 'incoming') {
      query.ownerId = req.user._id;
    } else if (type === 'outgoing') {
      query.requesterId = req.user._id;
    } else {
      query.$or = [
        { ownerId: req.user._id },
        { requesterId: req.user._id }
      ];
    }

    if (status) {
      query.status = status;
    }

    const swaps = await Swap.find(query)
      .populate('itemId', 'title images pointsValue')
      .populate('offeredItemId', 'title images pointsValue')
      .populate('requesterId', 'name profilePicture')
      .populate('ownerId', 'name profilePicture')
      .sort({ dateCreated: -1 });

    res.json({ swaps });
  } catch (error) {
    console.error('Get swaps error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/swaps/:id
// @desc    Get swap by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id)
      .populate('itemId', 'title images pointsValue uploaderId uploaderName')
      .populate('offeredItemId', 'title images pointsValue uploaderId uploaderName')
      .populate('requesterId', 'name profilePicture email')
      .populate('ownerId', 'name profilePicture email')
      .populate('messages.senderId', 'name profilePicture');

    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    // Check if user is involved in this swap
    if (swap.requesterId._id.toString() !== req.user._id.toString() && 
        swap.ownerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({ swap });
  } catch (error) {
    console.error('Get swap error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/swaps/:id/accept
// @desc    Accept a swap request
// @access  Private
router.put('/:id/accept', auth, async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    // Check if user is the owner of the item
    if (swap.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (swap.status !== 'pending') {
      return res.status(400).json({ message: 'Swap is not pending' });
    }

    await swap.acceptSwap();

    // Handle points transfer for points-based swaps
    if (swap.swapType === 'points') {
      const requester = await User.findById(swap.requesterId);
      const owner = await User.findById(swap.ownerId);

      if (requester.points >= swap.pointsOffered) {
        requester.points -= swap.pointsOffered;
        owner.points += swap.pointsOffered;

        await requester.save();
        await owner.save();
      }
    }

    // Mark items as unavailable
    await Item.findByIdAndUpdate(swap.itemId, { isAvailable: false });
    if (swap.offeredItemId) {
      await Item.findByIdAndUpdate(swap.offeredItemId, { isAvailable: false });
    }

    res.json({ message: 'Swap accepted successfully', swap });
  } catch (error) {
    console.error('Accept swap error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/swaps/:id/reject
// @desc    Reject a swap request
// @access  Private
router.put('/:id/reject', auth, async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    // Check if user is the owner of the item
    if (swap.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (swap.status !== 'pending') {
      return res.status(400).json({ message: 'Swap is not pending' });
    }

    await swap.rejectSwap();

    res.json({ message: 'Swap rejected successfully', swap });
  } catch (error) {
    console.error('Reject swap error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/swaps/:id/complete
// @desc    Complete a swap
// @access  Private
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    // Check if user is involved in this swap
    if (swap.requesterId.toString() !== req.user._id.toString() && 
        swap.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (swap.status !== 'accepted') {
      return res.status(400).json({ message: 'Swap must be accepted before completion' });
    }

    await swap.completeSwap();

    // Update user stats
    await User.findByIdAndUpdate(swap.requesterId, { $inc: { swapsCompleted: 1 } });
    await User.findByIdAndUpdate(swap.ownerId, { $inc: { swapsCompleted: 1 } });

    res.json({ message: 'Swap completed successfully', swap });
  } catch (error) {
    console.error('Complete swap error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/swaps/:id/message
// @desc    Add a message to a swap
// @access  Private
router.post('/:id/message', [
  auth,
  body('message').trim().isLength({ min: 1, max: 500 }).withMessage('Message must be between 1 and 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const swap = await Swap.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    // Check if user is involved in this swap
    if (swap.requesterId.toString() !== req.user._id.toString() && 
        swap.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await swap.addMessage(req.user._id, req.body.message);

    res.json({ message: 'Message added successfully' });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/swaps/:id/rate
// @desc    Rate a completed swap
// @access  Private
router.post('/:id/rate', [
  auth,
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 500 }).withMessage('Comment must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const swap = await Swap.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    // Check if user is involved in this swap
    if (swap.requesterId.toString() !== req.user._id.toString() && 
        swap.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (swap.status !== 'completed') {
      return res.status(400).json({ message: 'Can only rate completed swaps' });
    }

    await swap.addRating(req.user._id, req.body.rating, req.body.comment);

    res.json({ message: 'Rating added successfully' });
  } catch (error) {
    console.error('Add rating error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 