const Movie = require('../models/Movie');

// @desc  Lấy danh sách phim (có filter & search)
// @route GET /api/movies
exports.getAllMovies = async (req, res, next) => {
  try {
    const { status, genre, search, page = 1, limit = 12 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (genre) query.genre = { $in: [genre] };
    if (search) query.title = { $regex: search, $options: 'i' };

    const total = await Movie.countDocuments(query);
    const movies = await Movie.find(query)
      .sort({ releaseDate: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      movies
    });
  } catch (err) {
    next(err);
  }
};

// @desc  Lấy chi tiết phim
// @route GET /api/movies/:id
exports.getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ success: false, message: 'Không tìm thấy phim' });
    res.json({ success: true, movie });
  } catch (err) {
    next(err);
  }
};

// @desc  Tạo phim mới (Admin)
// @route POST /api/movies
exports.createMovie = async (req, res, next) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({ success: true, message: 'Tạo phim thành công', movie });
  } catch (err) {
    next(err);
  }
};

// @desc  Cập nhật phim (Admin)
// @route PUT /api/movies/:id
exports.updateMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!movie) return res.status(404).json({ success: false, message: 'Không tìm thấy phim' });
    res.json({ success: true, message: 'Cập nhật thành công', movie });
  } catch (err) {
    next(err);
  }
};

// @desc  Xóa phim (Admin)
// @route DELETE /api/movies/:id
exports.deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ success: false, message: 'Không tìm thấy phim' });
    res.json({ success: true, message: 'Xóa phim thành công' });
  } catch (err) {
    next(err);
  }
};

// @desc  Lấy danh sách thể loại
// @route GET /api/movies/genres
exports.getGenres = async (req, res, next) => {
  try {
    const genres = await Movie.distinct('genre');
    res.json({ success: true, genres });
  } catch (err) {
    next(err);
  }
};
