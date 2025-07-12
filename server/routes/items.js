const express = require('express');
const { body, validationResult } = require('express-validator');
const Item = require('../models/Item');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/items
// @desc    Get all items with filtering and search
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      search,
      category,
      size,
      condition,
      minPoints,
      maxPoints,
      sortBy = 'dateAdded',
      sortOrder = 'desc',
      page = 1,
      limit = 12
    } = req.query;

    const query = { isAvailable: true, isApproved: true };

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by size
    if (size) {
      query.size = size;
    }

    // Filter by condition
    if (condition) {
      query.condition = condition;
    }

    // Filter by points range
    if (minPoints || maxPoints) {
      query.pointsValue = {};
      if (minPoints) query.pointsValue.$gte = parseInt(minPoints);
      if (maxPoints) query.pointsValue.$lte = parseInt(maxPoints);
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const items = await Item.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('uploaderId', 'name rating profilePicture');

    const total = await Item.countDocuments(query);

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
    console.error('Get items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/items/:id
// @desc    Get item by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('uploaderId', 'name rating profilePicture location joinDate')
      .populate('likes', 'name profilePicture');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Increment views
    await item.incrementViews();

    res.json({ item });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/items
// @desc    Create a new item
// @access  Private
router.post('/', [
  auth,
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('category').isIn(['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories', 'Other']).withMessage('Invalid category'),
  body('size').isIn(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size', 'Other']).withMessage('Invalid size'),
  body('condition').isIn(['New', 'Like New', 'Good', 'Fair', 'Poor']).withMessage('Invalid condition'),
  body('pointsValue').isInt({ min: 1, max: 1000 }).withMessage('Points value must be between 1 and 1000'),
  body('images').isArray({ min: 1 }).withMessage('At least one image is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      category,
      size,
      condition,
      tags,
      images,
      pointsValue,
      brand,
      color,
      material,
      measurements,
      location,
      shippingInfo
    } = req.body;

    const item = new Item({
      title,
      description,
      category,
      size,
      condition,
      tags: tags || [],
      images,
      pointsValue,
      uploaderId: req.user._id,
      uploaderName: req.user.name,
      brand,
      color,
      material,
      measurements,
      location,
      shippingInfo
    });

    await item.save();

    // Update user's itemsListed count
    await req.user.updateOne({ $inc: { itemsListed: 1 } });

    res.status(201).json({ item });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/items/:id
// @desc    Update an item
// @access  Private
router.put('/:id', [
  auth,
  body('title').optional().trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('pointsValue').optional().isInt({ min: 1, max: 1000 }).withMessage('Points value must be between 1 and 1000')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user owns the item
    if (item.uploaderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updateFields = {};
    const allowedFields = ['title', 'description', 'tags', 'pointsValue', 'brand', 'color', 'material', 'measurements', 'location', 'shippingInfo'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    res.json({ item: updatedItem });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/items/:id
// @desc    Delete an item
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user owns the item
    if (item.uploaderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Item.findByIdAndDelete(req.params.id);

    // Update user's itemsListed count
    await req.user.updateOne({ $inc: { itemsListed: -1 } });

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/items/:id/like
// @desc    Toggle like on an item
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    await item.toggleLike(req.user._id);

    res.json({ message: 'Like toggled successfully', likeCount: item.likeCount });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/items/user/:userId
// @desc    Get items by user
// @access  Public
router.get('/user/:userId', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const items = await Item.find({
      uploaderId: req.params.userId,
      isAvailable: true,
      isApproved: true
    })
      .sort({ dateAdded: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Item.countDocuments({
      uploaderId: req.params.userId,
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

// @route   GET /api/items/categories
// @desc    Get all categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Item.distinct('category');
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 