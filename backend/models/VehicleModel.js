const mongoose = require('mongoose');

const vehicleModelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  energy: { type: String, default: '' },
  battery: { type: String, default: '' },
  cltc: { type: String, default: '' },
  prices: [{ type: { type: String, default: '' }, amount: { type: String, default: '' } }],
  price: {
    type: Number,
    required: true,
    default: 0
  },
  image: {
    type: String,
    required: false,
    default: ''
  },
  selected: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('VehicleModel', vehicleModelSchema);