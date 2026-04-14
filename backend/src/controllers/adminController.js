const User = require('../models/User');
const Movie = require('../models/Movie');
const Theater = require('../models/Theater');
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');

// @desc  Dashboard stats tổng quan
// @route GET /api/admin/stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [totalMovies, totalTheaters, totalUsers, totalBookings] = await Promise.all([
      Movie.countDocuments(),
      Theater.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Booking.countDocuments({ status: 'success' })
    ]);

    // Doanh thu tháng này
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyRevenue = await Booking.aggregate([
      { $match: { status: 'success', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    // Booking hôm nay
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayBookings = await Booking.countDocuments({
      status: 'success',
      createdAt: { $gte: today }
    });

    res.json({
      success: true,
      stats: {
        totalMovies,
        totalTheaters,
        totalUsers,
        totalBookings,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        todayBookings
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc  Doanh thu 7 ngày gần đây
// @route GET /api/admin/revenue/daily
exports.getDailyRevenue = async (req, res, next) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const revenue = await Booking.aggregate([
      { $match: { status: 'success', createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, revenue });
  } catch (err) {
    next(err);
  }
};

// @desc  Doanh thu theo phim
// @route GET /api/admin/revenue/by-movie
exports.getRevenueByMovie = async (req, res, next) => {
  try {
    const { period } = req.query; // 'week' | 'month'
    const dateFilter = new Date();
    if (period === 'week') dateFilter.setDate(dateFilter.getDate() - 7);
    else dateFilter.setMonth(dateFilter.getMonth() - 1);

    const revenue = await Booking.aggregate([
      { $match: { status: 'success', createdAt: { $gte: dateFilter } } },
      { $lookup: { from: 'showtimes', localField: 'showtimeId', foreignField: '_id', as: 'showtime' } },
      { $unwind: '$showtime' },
      { $lookup: { from: 'movies', localField: 'showtime.movieId', foreignField: '_id', as: 'movie' } },
      { $unwind: '$movie' },
      {
        $group: {
          _id: '$movie._id',
          title: { $first: '$movie.title' },
          posterUrl: { $first: '$movie.posterUrl' },
          revenue: { $sum: '$totalPrice' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);

    res.json({ success: true, revenue });
  } catch (err) {
    next(err);
  }
};

// @desc  Doanh thu theo rạp
// @route GET /api/admin/revenue/by-theater
exports.getRevenueByTheater = async (req, res, next) => {
  try {
    const { period } = req.query;
    const dateFilter = new Date();
    if (period === 'week') dateFilter.setDate(dateFilter.getDate() - 7);
    else dateFilter.setMonth(dateFilter.getMonth() - 1);

    const revenue = await Booking.aggregate([
      { $match: { status: 'success', createdAt: { $gte: dateFilter } } },
      { $lookup: { from: 'showtimes', localField: 'showtimeId', foreignField: '_id', as: 'showtime' } },
      { $unwind: '$showtime' },
      { $lookup: { from: 'rooms', localField: 'showtime.roomId', foreignField: '_id', as: 'room' } },
      { $unwind: '$room' },
      { $lookup: { from: 'theaters', localField: 'room.theaterId', foreignField: '_id', as: 'theater' } },
      { $unwind: '$theater' },
      {
        $group: {
          _id: '$theater._id',
          name: { $first: '$theater.name' },
          address: { $first: '$theater.address' },
          revenue: { $sum: '$totalPrice' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    res.json({ success: true, revenue });
  } catch (err) {
    next(err);
  }
};

// @desc  Lấy tất cả users (Admin)
// @route GET /api/admin/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const total = await User.countDocuments();
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, total, users });
  } catch (err) {
    next(err);
  }
};

// @desc  Lấy tất cả bookings (Admin)
// @route GET /api/admin/bookings
exports.getAllBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = status ? { status } : {};
    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('userId', 'name email')
      .populate({
        path: 'showtimeId',
        populate: [
          { path: 'movieId', select: 'title' },
          { path: 'roomId', select: 'name', populate: { path: 'theaterId', select: 'name' } }
        ]
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, total, bookings });
  } catch (err) {
    next(err);
  }
};
