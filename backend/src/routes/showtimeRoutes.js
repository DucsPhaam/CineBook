const express = require('express');
const router = express.Router();
const {
  getShowtimesByMovie, getShowtimeDetail, createShowtime, updateShowtime, deleteShowtime, getAllShowtimes
} = require('../controllers/showtimeController');
const protect = require('../middleware/auth');
const adminOnly = require('../middleware/role');

router.get('/all', protect, adminOnly, getAllShowtimes);
router.get('/', getShowtimesByMovie);
router.get('/:id', getShowtimeDetail);
router.post('/', protect, adminOnly, createShowtime);
router.put('/:id', protect, adminOnly, updateShowtime);
router.delete('/:id', protect, adminOnly, deleteShowtime);

module.exports = router;
