const express = require('express');
const router = express.Router();
const {
  getRoomsByTheater, getRoomById, createRoom, updateRoom, deleteRoom
} = require('../controllers/roomController');
const protect = require('../middleware/auth');
const adminOnly = require('../middleware/role');

router.get('/', getRoomsByTheater);
router.get('/:id', getRoomById);
router.post('/', protect, adminOnly, createRoom);
router.put('/:id', protect, adminOnly, updateRoom);
router.delete('/:id', protect, adminOnly, deleteRoom);

module.exports = router;
