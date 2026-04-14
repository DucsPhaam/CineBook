const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getDailyRevenue, getRevenueByMovie, getRevenueByTheater,
  getAllUsers, getAllBookings
} = require('../controllers/adminController');
const protect = require('../middleware/auth');
const adminOnly = require('../middleware/role');

router.use(protect, adminOnly); // Tất cả admin routes đều cần auth + admin role

router.get('/stats', getDashboardStats);
router.get('/revenue/daily', getDailyRevenue);
router.get('/revenue/by-movie', getRevenueByMovie);
router.get('/revenue/by-theater', getRevenueByTheater);
router.get('/users', getAllUsers);
router.get('/bookings', getAllBookings);

module.exports = router;
