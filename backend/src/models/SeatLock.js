const mongoose = require('mongoose');

const seatLockSchema = new mongoose.Schema({
  showtimeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime', required: true },
  seatNumber: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expiresAt: { type: Date, required: true, index: { expires: '5m' } } // TTL 5 phút
}, { timestamps: true });

module.exports = mongoose.model('SeatLock', seatLockSchema);