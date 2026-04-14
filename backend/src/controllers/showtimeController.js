const Showtime = require('../models/Showtime');
const Booking = require('../models/Booking');
const SeatLock = require('../models/SeatLock');

// @desc  Lấy lịch chiếu theo phim (filter ngày, rạp)
// @route GET /api/showtimes?movieId=&date=&theaterId=
exports.getShowtimesByMovie = async (req, res, next) => {
  try {
    const { movieId, date, theaterId } = req.query;

    const query = {};
    if (movieId) query.movieId = movieId;

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.startTime = { $gte: start, $lte: end };
    }

    let showtimes = await Showtime.find(query)
      .populate('movieId', 'title posterUrl duration')
      .populate({
        path: 'roomId',
        select: 'name theaterId totalSeats type',
        populate: { path: 'theaterId', select: 'name address' }
      })
      .sort({ startTime: 1 });

    // Filter theo theater nếu có
    if (theaterId) {
      showtimes = showtimes.filter(s => s.roomId?.theaterId?._id?.toString() === theaterId);
    }

    res.json({ success: true, showtimes });
  } catch (err) {
    next(err);
  }
};

// @desc  Lấy chi tiết suất chiếu + trạng thái ghế
// @route GET /api/showtimes/:id
exports.getShowtimeDetail = async (req, res, next) => {
  try {
    const showtime = await Showtime.findById(req.params.id)
      .populate('movieId')
      .populate({
        path: 'roomId',
        populate: { path: 'theaterId', select: 'name address' }
      });

    if (!showtime) return res.status(404).json({ success: false, message: 'Không tìm thấy suất chiếu' });

    // Ghế đã bán (booking success)
    const successBookings = await Booking.find({
      showtimeId: req.params.id,
      status: 'success'
    });
    const soldSeats = successBookings.flatMap(b => b.seats);

    // Ghế đang bị lock (pending, chưa hết hạn)
    const locks = await SeatLock.find({
      showtimeId: req.params.id,
      expiresAt: { $gt: new Date() }
    });
    const lockedSeats = locks.map(l => l.seatNumber);

    res.json({
      success: true,
      showtime,
      soldSeats,
      lockedSeats
    });
  } catch (err) {
    next(err);
  }
};

// @desc  Tạo suất chiếu mới (Admin)
// @route POST /api/showtimes
exports.createShowtime = async (req, res, next) => {
  try {
    const { movieId, roomId, startTime, endTime, price, language } = req.body;

    // Kiểm tra conflict lịch trong cùng phòng
    const conflict = await Showtime.findOne({
      roomId,
      $or: [
        { startTime: { $lt: new Date(endTime), $gte: new Date(startTime) } },
        { endTime: { $gt: new Date(startTime), $lte: new Date(endTime) } },
        {
          startTime: { $lte: new Date(startTime) },
          endTime: { $gte: new Date(endTime) }
        }
      ]
    });

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: `Phòng chiếu đã có suất chiếu từ ${new Date(conflict.startTime).toLocaleTimeString('vi-VN')} đến ${new Date(conflict.endTime).toLocaleTimeString('vi-VN')} trong khung giờ này`
      });
    }

    const showtime = await Showtime.create({ movieId, roomId, startTime, endTime, price, language });
    const populated = await showtime.populate([
      { path: 'movieId', select: 'title' },
      { path: 'roomId', select: 'name', populate: { path: 'theaterId', select: 'name' } }
    ]);

    res.status(201).json({ success: true, message: 'Tạo lịch chiếu thành công', showtime: populated });
  } catch (err) {
    next(err);
  }
};

// @desc  Cập nhật suất chiếu (Admin)
// @route PUT /api/showtimes/:id
exports.updateShowtime = async (req, res, next) => {
  try {
    const showtime = await Showtime.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!showtime) return res.status(404).json({ success: false, message: 'Không tìm thấy suất chiếu' });
    res.json({ success: true, message: 'Cập nhật thành công', showtime });
  } catch (err) {
    next(err);
  }
};

// @desc  Xóa suất chiếu (Admin)
// @route DELETE /api/showtimes/:id
exports.deleteShowtime = async (req, res, next) => {
  try {
    const showtime = await Showtime.findByIdAndDelete(req.params.id);
    if (!showtime) return res.status(404).json({ success: false, message: 'Không tìm thấy suất chiếu' });
    res.json({ success: true, message: 'Xóa lịch chiếu thành công' });
  } catch (err) {
    next(err);
  }
};

// @desc  Lấy tất cả suất chiếu (Admin)
// @route GET /api/showtimes/all
exports.getAllShowtimes = async (req, res, next) => {
  try {
    const showtimes = await Showtime.find()
      .populate('movieId', 'title posterUrl')
      .populate({
        path: 'roomId',
        select: 'name',
        populate: { path: 'theaterId', select: 'name' }
      })
      .sort({ startTime: -1 })
      .limit(100);
    res.json({ success: true, showtimes });
  } catch (err) {
    next(err);
  }
};
