const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ Admin mới được truy cập' });
    }
    next();
  };
  
  module.exports = adminOnly;