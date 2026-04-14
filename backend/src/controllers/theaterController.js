const Theater = require('../models/Theater');
const Room = require('../models/Room');

// @desc  Lấy tất cả cụm rạp
// @route GET /api/theaters
exports.getAllTheaters = async (req, res, next) => {
  try {
    const theaters = await Theater.find().sort({ name: 1 });
    res.json({ success: true, theaters });
  } catch (err) {
    next(err);
  }
};

// @desc  Lấy chi tiết cụm rạp
// @route GET /api/theaters/:id
exports.getTheaterById = async (req, res, next) => {
  try {
    const theater = await Theater.findById(req.params.id);
    if (!theater) return res.status(404).json({ success: false, message: 'Không tìm thấy cụm rạp' });
    res.json({ success: true, theater });
  } catch (err) {
    next(err);
  }
};

// @desc  Tạo cụm rạp mới (Admin)
// @route POST /api/theaters
exports.createTheater = async (req, res, next) => {
  try {
    const theater = await Theater.create(req.body);
    res.status(201).json({ success: true, message: 'Tạo cụm rạp thành công', theater });
  } catch (err) {
    next(err);
  }
};

// @desc  Cập nhật cụm rạp (Admin)
// @route PUT /api/theaters/:id
exports.updateTheater = async (req, res, next) => {
  try {
    const theater = await Theater.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!theater) return res.status(404).json({ success: false, message: 'Không tìm thấy cụm rạp' });
    res.json({ success: true, message: 'Cập nhật thành công', theater });
  } catch (err) {
    next(err);
  }
};

// @desc  Xóa cụm rạp (Admin)
// @route DELETE /api/theaters/:id
exports.deleteTheater = async (req, res, next) => {
  try {
    const theater = await Theater.findByIdAndDelete(req.params.id);
    if (!theater) return res.status(404).json({ success: false, message: 'Không tìm thấy cụm rạp' });
    // Xóa các phòng liên quan
    await Room.deleteMany({ theaterId: req.params.id });
    res.json({ success: true, message: 'Xóa cụm rạp thành công' });
  } catch (err) {
    next(err);
  }
};
