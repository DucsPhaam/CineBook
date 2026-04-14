const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true }, // phút
  releaseDate: { type: Date, required: true },
  genre: [{ type: String }], // ["Action", "Sci-Fi"]
  director: { type: String, default: '' },
  cast: [{ type: String }],
  ageRating: { type: String, enum: ['P', 'K', '13', '16', '18'], default: 'P' },
  posterUrl: { type: String, default: '' },
  trailerUrl: { type: String, default: '' }, // YouTube link
  status: { type: String, enum: ['now-showing', 'coming-soon'], required: true },
}, { timestamps: true });

// Index để search nhanh
movieSchema.index({ title: 'text' });

module.exports = mongoose.model('Movie', movieSchema);