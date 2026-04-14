const Room = require('../models/Room');
const { generateSeatLabels } = require('../utils/seatUtils');

// @desc  Lấy phòng theo cụm rạp
// @route GET /api/rooms?theaterId=xxx
exports.getRoomsByTheater = async (req, res, next) => {
  try {
    const { theaterId } = req.query;
    const query = theaterId ? { theaterId } : {};
    const rooms = await Room.find(query).populate('theaterId', 'name address');
    res.json({ success: true, rooms });
  } catch (err) {
    next(err);
  }
};

// @desc  Lấy chi tiết phòng + layout ghế
// @route GET /api/rooms/:id
exports.getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate('theaterId', 'name address');
    if (!room) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng chiếu' });

    // Sinh danh sách tên ghế từ layout
    const seatLabels = generateSeatLabels(room.layout?.rows || 8, room.layout?.columns || 10);

    res.json({ success: true, room, seatLabels });
  } catch (err) {
    next(err);
  }
};

// @desc  Tạo phòng chiếu mới (Admin)
// @route POST /api/rooms
exports.createRoom = async (req, res, next) => {
  try {
    const { theaterId, name, type, layout } = req.body;

    const rows = layout?.rows || 8;
    const columns = layout?.columns || 10;
    const totalSeats = rows * columns;

    const room = await Room.create({
      theaterId,
      name,
      type,
      totalSeats,
      layout: { ...layout, rows, columns }
    });

    res.status(201).json({ success: true, message: 'Tạo phòng chiếu thành công', room });
  } catch (err) {
    next(err);
  }
};

// @desc  Cập nhật phòng chiếu (Admin)
// @route PUT /api/rooms/:id
exports.updateRoom = async (req, res, next) => {
  try {
    if (req.body.layout) {
      const rows = req.body.layout.rows || 8;
      const columns = req.body.layout.columns || 10;
      req.body.totalSeats = rows * columns;
    }
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!room) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng chiếu' });
    res.json({ success: true, message: 'Cập nhật phòng thành công', room });
  } catch (err) {
    next(err);
  }
};

// @desc  Xóa phòng chiếu (Admin)
// @route DELETE /api/rooms/:id
exports.deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng chiếu' });
    res.json({ success: true, message: 'Xóa phòng chiếu thành công' });
  } catch (err) {
    next(err);
  }
};
