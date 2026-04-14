const express = require('express');
const router = express.Router();
const { selectSeats, confirmPayment, getMyBookings, getBookingDetail } = require('../controllers/bookingController');
const protect = require('../middleware/auth');

router.post('/select-seats', protect, selectSeats);
router.post('/confirm', protect, confirmPayment);
router.get('/my-bookings', protect, getMyBookings);
router.get('/:id', protect, getBookingDetail);

module.exports = router;