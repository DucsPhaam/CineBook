const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema({
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  price: { type: Number, required: true, default: 80000 }, // VND
  language: { type: String, enum: ['VIE', 'ENG', 'SUB'], default: 'VIE' },
}, { timestamps: true });

// Index để query nhanh theo phim và ngày
showtimeSchema.index({ movieId: 1, startTime: 1 });
showtimeSchema.index({ roomId: 1, startTime: 1 });

module.exports = mongoose.model('Showtime', showtimeSchema);