const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Item = require('../models/Item');
const Swap = require('../models/Swap');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, isActive } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ joinDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalUsers: total,
        usersPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id/items
// @desc    Get items by user ID
// @access  Public
router.get('/:id/items', async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const items = await Item.find({
      uploaderId: req.params.id,
      isAvailable: true,
      isApproved: true
    })
      .sort({ dateAdded: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Item.countDocuments({
      uploaderId: req.params.id,
      isAvailable: true,
      isApproved: true
    });

    res.json({
      items,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get user items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id/stats
// @desc    Get user statistics
// @access  Public
router.get('/:id/stats', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('itemsListed swapsCompleted rating joinDate');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get additional stats
    const totalItems = await Item.countDocuments({
      uploaderId: req.params.id,
      isApproved: true
    });

    const completedSwaps = await Swap.countDocuments({
      $or: [
        { requesterId: req.params.id },
        { ownerId: req.params.id }
      ],
      status: 'completed'
    });

    const pendingSwaps = await Swap.countDocuments({
      $or: [
        { requesterId: req.params.id },
        { ownerId: req.params.id }
      ],
      status: 'pending'
    });

    res.json({
      stats: {
        itemsListed: user.itemsListed,
        swapsCompleted: user.swapsCompleted,
        rating: user.rating,
        joinDate: user.joinDate,
        totalItems,
        completedSwaps,
        pendingSwaps
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/:id/admin
// @desc    Update user (admin only)
// @access  Private/Admin
router.put('/:id/admin', [
  adminAuth,
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('isAdmin').optional().isBoolean().withMessage('isAdmin must be a boolean'),
  body('points').optional().isInt({ min: 0 }).withMessage('Points must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { isActive, isAdmin, points } = req.body;
    const updateFields = {};

    if (isActive !== undefined) updateFields.isActive = isActive;
    if (isAdmin !== undefined) updateFields.isAdmin = isAdmin;
    if (points !== undefined) updateFields.points = points;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Update user admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (admin only)
// @access  Private/Admin
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user's items
    await Item.deleteMany({ uploaderId: req.params.id });

    // Delete swaps involving this user
    await Swap.deleteMany({
      $or: [
        { requesterId: req.params.id },
        { ownerId: req.params.id }
      ]
    });

    // Delete user
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/stats/overview
// @desc    Get platform statistics (admin only)
// @access  Private/Admin
router.get('/stats/overview', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalItems = await Item.countDocuments();
    const availableItems = await Item.countDocuments({ isAvailable: true, isApproved: true });
    const pendingItems = await Item.countDocuments({ isApproved: false });
    const totalSwaps = await Swap.countDocuments();
    const completedSwaps = await Swap.countDocuments({ status: 'completed' });
    const pendingSwaps = await Swap.countDocuments({ status: 'pending' });

    // Recent activity
    const recentUsers = await User.find()
      .sort({ joinDate: -1 })
      .limit(5)
      .select('name email joinDate');

    const recentItems = await Item.find()
      .sort({ dateAdded: -1 })
      .limit(5)
      .select('title category dateAdded')
      .populate('uploaderId', 'name');

    const recentSwaps = await Swap.find()
      .sort({ dateCreated: -1 })
      .limit(5)
      .select('status swapType dateCreated')
      .populate('requesterId', 'name')
      .populate('ownerId', 'name');

    res.json({
      overview: {
        totalUsers,
        activeUsers,
        totalItems,
        availableItems,
        pendingItems,
        totalSwaps,
        completedSwaps,
        pendingSwaps
      },
      recentActivity: {
        users: recentUsers,
        items: recentItems,
        swaps: recentSwaps
      }
    });
  } catch (error) {
    console.error('Get stats overview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/:id/ban
// @desc    Ban/unban user (admin only)
// @access  Private/Admin
router.post('/:id/ban', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ 
      message: user.isActive ? 'User unbanned successfully' : 'User banned successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/:id/make-admin
// @desc    Make user admin (admin only)
// @access  Private/Admin
router.post('/:id/make-admin', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isAdmin = !user.isAdmin;
    await user.save();

    res.json({ 
      message: user.isAdmin ? 'User made admin successfully' : 'Admin privileges removed successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Make admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 