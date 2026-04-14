const mongoose = require('mongoose');

const theaterSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  address: { type: String, required: true },
  city: { type: String, default: 'Hà Nội' },
  phone: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Theater', theaterSchema);