const Booking = require('../models/Booking');
const SeatLock = require('../models/SeatLock');

// Chạy mỗi phút để dọn dẹp booking expired
const cleanupExpiredBookings = async () => {
  try {
    const now = new Date();

    // Đánh dấu booking pending đã hết hạn
    const result = await Booking.updateMany(
      {
        status: 'pending',
        expiresAt: { $lt: now }
      },
      { $set: { status: 'expired' } }
    );

    if (result.modifiedCount > 0) {
      console.log(`🧹 [Cron] Đã expires ${result.modifiedCount} booking(s) hết hạn`);
    }

    // Xóa seat locks hết hạn (MongoDB TTL index tự xóa, đây là backup)
    await SeatLock.deleteMany({ expiresAt: { $lt: now } });

  } catch (err) {
    console.error('❌ [Cron] Lỗi cleanup:', err.message);
  }
};

// Chạy mỗi 60 giây
setInterval(cleanupExpiredBookings, 60 * 1000);

console.log('⏰ Cron job cleanup expired bookings đã khởi động (mỗi 60s)');

module.exports = cleanupExpiredBookings;
