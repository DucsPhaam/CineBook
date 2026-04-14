const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// @desc  Đăng ký tài khoản
// @route POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email đã được đăng ký' });
    }

    const user = await User.create({ name, email, password, role: 'customer' });
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    next(err);
  }
};

// @desc  Đăng nhập
// @route POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    next(err);
  }
};

// @desc  Lấy profile hiện tại
// @route GET /api/auth/profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy user' });

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// @desc  Cập nhật profile
// @route PUT /api/auth/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, password, avatar } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy user' });

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' });
      }
      user.password = password;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Cập nhật thành công',
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
    });
  } catch (err) {
    next(err);
  }
};
