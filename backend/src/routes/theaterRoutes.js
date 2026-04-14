const express = require('express');
const router = express.Router();
const {
  getAllTheaters, getTheaterById, createTheater, updateTheater, deleteTheater
} = require('../controllers/theaterController');
const protect = require('../middleware/auth');
const adminOnly = require('../middleware/role');

router.get('/', getAllTheaters);
router.get('/:id', getTheaterById);
router.post('/', protect, adminOnly, createTheater);
router.put('/:id', protect, adminOnly, updateTheater);
router.delete('/:id', protect, adminOnly, deleteTheater);

module.exports = router;
