const Booking = require('../models/Booking');
const SeatLock = require('../models/SeatLock');
const Showtime = require('../models/Showtime');
const Ticket = require('../models/Ticket');
const { generateQR } = require('../utils/generateQR');

// @desc  Chọn ghế → Lock 5 phút + tạo booking pending
// @route POST /api/bookings/select-seats
exports.selectSeats = async (req, res, next) => {
  try {
    const { showtimeId, seats } = req.body;
    const userId = req.user.id;

    if (!showtimeId || !seats || seats.length === 0) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp suất chiếu và ghế' });
    }

    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) return res.status(404).json({ success: false, message: 'Không tìm thấy suất chiếu' });

    // Kiểm tra ghế đã sold chưa
    const successBookings = await Booking.find({ showtimeId, status: 'success' });
    const soldSeats = successBookings.flatMap(b => b.seats);
    const soldConflict = seats.filter(s => soldSeats.includes(s));
    if (soldConflict.length > 0) {
      return res.status(400).json({ success: false, message: `Ghế ${soldConflict.join(', ')} đã được bán` });
    }

    // Kiểm tra ghế đang bị lock bởi người khác
    const existingLocks = await SeatLock.find({
      showtimeId,
      seatNumber: { $in: seats },
      expiresAt: { $gt: new Date() },
      userId: { $ne: userId }
    });

    if (existingLocks.length > 0) {
      const lockedSeatNums = existingLocks.map(l => l.seatNumber);
      return res.status(400).json({ success: false, message: `Ghế ${lockedSeatNums.join(', ')} đang được người khác giữ chỗ` });
    }

    // Xóa lock cũ của user này (nếu chọn lại)
    await SeatLock.deleteMany({ showtimeId, userId });

    // Tạo lock mới
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const locks = seats.map(seat => ({ showtimeId, seatNumber: seat, userId, expiresAt }));
    await SeatLock.insertMany(locks);

    // Tính tổng tiền
    const totalPrice = seats.length * showtime.price;

    // Xóa booking pending cũ
    await Booking.deleteMany({ userId, showtimeId, status: 'pending' });

    // Tạo booking pending
    const booking = await Booking.create({
      userId,
      showtimeId,
      seats,
      totalPrice,
      status: 'pending',
      expiresAt
    });

    res.json({
      success: true,
      bookingId: booking._id,
      seats,
      totalPrice,
      expiresIn: 300
    });
  } catch (err) {
    next(err);
  }
};

// @desc  Xác nhận thanh toán (mock payment)
// @route POST /api/bookings/confirm
exports.confirmPayment = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user.id;

    const booking = await Booking.findById(bookingId)
      .populate({
        path: 'showtimeId',
        populate: [
          { path: 'movieId', select: 'title posterUrl' },
          { path: 'roomId', select: 'name', populate: { path: 'theaterId', select: 'name address' } }
        ]
      });

    if (!booking) return res.status(404).json({ success: false, message: 'Không tìm thấy booking' });
    if (booking.userId.toString() !== userId) return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    if (booking.status !== 'pending') return res.status(400).json({ success: false, message: 'Đơn hàng không hợp lệ hoặc đã xử lý' });

    const now = new Date();
    if (booking.expiresAt && booking.expiresAt < now) {
      booking.status = 'expired';
      await booking.save();
      return res.status(400).json({ success: false, message: 'Phiên đặt vé đã hết hạn (5 phút). Vui lòng chọn lại ghế.' });
    }

    // Mock payment success
    booking.status = 'success';
    await booking.save();

    // Tạo vé + QR cho từng ghế
    const tickets = [];
    for (const seat of booking.seats) {
      const qrData = `CINETICKET|${booking._id}|${seat}|${booking.showtimeId._id}`;
      const qrCode = await generateQR(qrData);
      const ticket = await Ticket.create({
        bookingId: booking._id,
        seatNumber: seat,
        qrCode
      });
      tickets.push(ticket);
    }

    // Xóa seat locks
    await SeatLock.deleteMany({ showtimeId: booking.showtimeId._id, userId });

    res.json({
      success: true,
      message: 'Thanh toán thành công! Vé đã được tạo.',
      booking,
      tickets
    });
  } catch (err) {
    next(err);
  }
};

// @desc  Lấy lịch sử booking của user
// @route GET /api/bookings/my-bookings
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate({
        path: 'showtimeId',
        populate: [
          { path: 'movieId', select: 'title posterUrl duration' },
          { path: 'roomId', select: 'name', populate: { path: 'theaterId', select: 'name address' } }
        ]
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (err) {
    next(err);
  }
};

// @desc  Chi tiết booking + vé QR
// @route GET /api/bookings/:id
exports.getBookingDetail = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'showtimeId',
        populate: [
          { path: 'movieId', select: 'title posterUrl duration director cast' },
          { path: 'roomId', select: 'name type', populate: { path: 'theaterId', select: 'name address' } }
        ]
      })
      .populate('userId', 'name email');

    if (!booking) return res.status(404).json({ success: false, message: 'Không tìm thấy booking' });

    // Chỉ admin hoặc chủ booking mới xem được
    if (req.user.role !== 'admin' && booking.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    }

    const tickets = await Ticket.find({ bookingId: booking._id });

    res.json({ success: true, booking, tickets });
  } catch (err) {
    next(err);
  }
};