const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  theaterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Theater', required: true },
  name: { type: String, required: true }, // "Rạp 1", "Rạp VIP"
  totalSeats: { type: Number, required: true },
  type: { type: String, enum: ['standard', 'vip', 'imax', '4dx'], default: 'standard' },
  // Cấu hình sơ đồ ghế
  layout: {
    rows: { type: Number, default: 8 },
    columns: { type: Number, default: 10 },
    aisles: [{ type: Number }], // cột nào là lối đi (0-indexed)
    specialSeats: [{
      seatNumber: String,
      type: { type: String, enum: ['vip', 'couple', 'disabled'] }
    }]
  }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);