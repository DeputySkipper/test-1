const mongoose = require('mongoose');

const swapSchema = new mongoose.Schema({
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  swapType: {
    type: String,
    enum: ['direct', 'points'],
    required: true
  },
  pointsOffered: {
    type: Number,
    min: 0,
    default: 0
  },
  message: {
    type: String,
    maxlength: 500
  },
  dateCreated: {
    type: Date,
    default: Date.now
  },
  dateCompleted: {
    type: Date
  },
  // For direct swaps - the item being offered in exchange
  offeredItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  },
  // Location and meeting details
  meetingDetails: {
    location: String,
    date: Date,
    time: String,
    notes: String
  },
  // Communication history
  messages: [{
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  // Rating and feedback
  rating: {
    fromRequester: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      date: Date
    },
    fromOwner: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      date: Date
    }
  },
  // Shipping information (if applicable)
  shipping: {
    requesterAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    ownerAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    trackingNumber: String,
    shippedDate: Date,
    deliveredDate: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
swapSchema.index({ requesterId: 1, status: 1 });
swapSchema.index({ ownerId: 1, status: 1 });
swapSchema.index({ itemId: 1 });

// Method to accept swap
swapSchema.methods.acceptSwap = function() {
  this.status = 'accepted';
  return this.save();
};

// Method to reject swap
swapSchema.methods.rejectSwap = function() {
  this.status = 'rejected';
  return this.save();
};

// Method to complete swap
swapSchema.methods.completeSwap = function() {
  this.status = 'completed';
  this.dateCompleted = new Date();
  return this.save();
};

// Method to cancel swap
swapSchema.methods.cancelSwap = function() {
  this.status = 'cancelled';
  return this.save();
};

// Method to add message
swapSchema.methods.addMessage = function(senderId, message) {
  this.messages.push({
    senderId,
    message,
    timestamp: new Date()
  });
  return this.save();
};

// Method to add rating
swapSchema.methods.addRating = function(fromUserId, rating, comment) {
  if (this.requesterId.toString() === fromUserId.toString()) {
    this.rating.fromRequester = {
      rating,
      comment,
      date: new Date()
    };
  } else if (this.ownerId.toString() === fromUserId.toString()) {
    this.rating.fromOwner = {
      rating,
      comment,
      date: new Date()
    };
  }
  return this.save();
};

module.exports = mongoose.model('Swap', swapSchema); 