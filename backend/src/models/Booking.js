const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  showtimeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime', required: true },
  seats: [{ type: String }], // ["H1", "H2"]
  totalPrice: { type: Number, required: true },
  bookingDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'expired'],
    default: 'pending'
  },
  expiresAt: { type: Date }, // 5 phút hold
  paymentMethod: { type: String, default: 'mock' },
}, { timestamps: true });

bookingSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);