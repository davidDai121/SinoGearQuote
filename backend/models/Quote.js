const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  models: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VehicleModel'
  }],
  colors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Color'
  }],
  interiors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interior'
  }],
  footerText: {
    type: String,
    default: ''
  },
  totalPrice: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Quote', quoteSchema);