const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  seatNumber: { type: String, required: true }, // "H1", "H2"
  qrCode: { type: String }, // base64 QR image
  isUsed: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);