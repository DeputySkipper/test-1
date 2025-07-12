const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  category: {
    type: String,
    required: true,
    enum: ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories', 'Other']
  },
  size: {
    type: String,
    required: true,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size', 'Other']
  },
  condition: {
    type: String,
    required: true,
    enum: ['New', 'Like New', 'Good', 'Fair', 'Poor']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 20
  }],
  images: [{
    type: String,
    required: true
  }],
  pointsValue: {
    type: Number,
    required: true,
    min: 1,
    max: 1000
  },
  uploaderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploaderName: {
    type: String,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  dateAdded: {
    type: Date,
    default: Date.now
  },
  swapRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Swap'
  }],
  isApproved: {
    type: Boolean,
    default: false
  },
  brand: {
    type: String,
    trim: true,
    maxlength: 50
  },
  color: {
    type: String,
    trim: true,
    maxlength: 30
  },
  material: {
    type: String,
    trim: true,
    maxlength: 50
  },
  measurements: {
    chest: Number,
    waist: Number,
    hips: Number,
    length: Number,
    shoulders: Number
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  location: {
    type: String,
    trim: true
  },
  shippingInfo: {
    willingToShip: {
      type: Boolean,
      default: false
    },
    shippingCost: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index for search functionality
itemSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text',
  brand: 'text'
});

// Virtual for like count
itemSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Method to increment views
itemSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to toggle like
itemSchema.methods.toggleLike = function(userId) {
  const index = this.likes.indexOf(userId);
  if (index > -1) {
    this.likes.splice(index, 1);
  } else {
    this.likes.push(userId);
  }
  return this.save();
};

// Ensure virtuals are serialized
itemSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Item', itemSchema); 