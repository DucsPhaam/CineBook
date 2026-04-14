const express = require('express');
const router = express.Router();
const {
  getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie, getGenres
} = require('../controllers/movieController');
const protect = require('../middleware/auth');
const adminOnly = require('../middleware/role');

router.get('/genres', getGenres);
router.get('/', getAllMovies);
router.get('/:id', getMovieById);
router.post('/', protect, adminOnly, createMovie);
router.put('/:id', protect, adminOnly, updateMovie);
router.delete('/:id', protect, adminOnly, deleteMovie);

module.exports = router;
