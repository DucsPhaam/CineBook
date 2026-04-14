require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./src/models/User');
const Movie = require('./src/models/Movie');
const Theater = require('./src/models/Theater');
const Room = require('./src/models/Room');
const Showtime = require('./src/models/Showtime');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');
};

// Check trùng lịch chiếu
const isTimeConflict = (newShow, existingShows) => {
  return existingShows.some(st =>
    st.roomId.toString() === newShow.roomId.toString() &&
    (
      (newShow.startTime >= st.startTime && newShow.startTime < st.endTime) ||
      (newShow.endTime > st.startTime && newShow.endTime <= st.endTime)
    )
  );
};

const seed = async () => {
  await connectDB();

  // ❌ Xóa dữ liệu cũ
  await Promise.all([
    User.deleteMany({}),
    Movie.deleteMany({}),
    Theater.deleteMany({}),
    Room.deleteMany({}),
    Showtime.deleteMany({}),
  ]);
  console.log('🗑️  Đã xóa dữ liệu cũ');

  // 👤 USERS (hash password)
  const hashedAdmin = await bcrypt.hash('admin123', 10);
  const hashedCustomer = await bcrypt.hash('customer123', 10);

  await User.create([
    {
      name: 'Admin CineTicket',
      email: 'admin@cineticket.vn',
      password: hashedAdmin,
      role: 'admin'
    },
    {
      name: 'Nguyễn Văn An',
      email: 'customer@cineticket.vn',
      password: hashedCustomer,
      role: 'customer'
    }
  ]);

  console.log('👤 Users created');

  // 🎬 MOVIES
  const movies = await Movie.insertMany([
    {
      title: 'Avengers: Secret Wars',
      description: 'Cuộc chiến đa vũ trụ bùng nổ.',
      duration: 150,
      releaseDate: new Date('2026-05-01'),
      genre: ['Action', 'Sci-Fi'],
      ageRating: '13',
      status: 'coming-soon'
    },
    {
      title: 'Inception 2',
      description: 'Thế giới giấc mơ quay trở lại.',
      duration: 148,
      releaseDate: new Date('2026-03-15'),
      genre: ['Sci-Fi'],
      ageRating: '16',
      status: 'now-showing'
    },
    {
      title: 'Lật Mặt 8',
      description: 'Phim hành động Việt Nam.',
      duration: 120,
      releaseDate: new Date('2026-04-01'),
      genre: ['Action'],
      ageRating: '18',
      status: 'now-showing'
    },
    {
      title: 'Interstellar 2',
      description: 'Hành trình không gian tiếp tục.',
      duration: 169,
      releaseDate: new Date('2026-07-25'),
      genre: ['Sci-Fi'],
      ageRating: 'P',
      status: 'coming-soon'
    },
  ]);

  console.log('🎬 Movies created');

  // 🏢 THEATERS
  const theaters = await Theater.insertMany([
    { name: 'CineTicket Royal City', address: 'Hà Nội' },
    { name: 'CineTicket Vincom Q1', address: 'TP.HCM' },
  ]);

  console.log('🏢 Theaters created');

  // 🎭 ROOMS (có special seats)
  const rooms = await Room.insertMany([
    {
      theaterId: theaters[0]._id,
      name: 'Phòng 1',
      type: 'standard',
      totalSeats: 80,
      layout: {
        rows: 8,
        columns: 10,
        aisles: [4],
        specialSeats: [
          { seatNumber: 'A1', type: 'vip' },
          { seatNumber: 'A2', type: 'vip' },
          { seatNumber: 'H10', type: 'disabled' }
        ]
      }
    },
    {
      theaterId: theaters[0]._id,
      name: 'Phòng VIP',
      type: 'vip',
      totalSeats: 60,
      layout: {
        rows: 6,
        columns: 10,
        aisles: [4],
        specialSeats: [
          { seatNumber: 'A1', type: 'couple' },
          { seatNumber: 'A2', type: 'couple' }
        ]
      }
    },
    {
      theaterId: theaters[1]._id,
      name: 'Phòng IMAX',
      type: 'imax',
      totalSeats: 120,
      layout: {
        rows: 10,
        columns: 12,
        aisles: [5]
      }
    },
  ]);

  console.log('🎭 Rooms created');

  // 📅 SHOWTIMES
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nowShowingMovies = movies.filter(m => m.status === 'now-showing');

  const timeSlots = [
    { hour: 9, min: 0 },
    { hour: 11, min: 30 },
    { hour: 14, min: 0 },
    { hour: 16, min: 30 },
    { hour: 19, min: 0 },
    { hour: 21, min: 30 },
  ];

  const showtimeData = [];

  for (let day = 0; day < 3; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() + day);

    for (const room of rooms) {
      for (const movie of nowShowingMovies) {

        const slot = timeSlots[Math.floor(Math.random() * timeSlots.length)];

        const start = new Date(date);
        start.setHours(slot.hour, slot.min, 0, 0);

        const end = new Date(start.getTime() + movie.duration * 60000 + 15 * 60000);

        // 💰 dynamic price
        const isWeekend = [0, 6].includes(start.getDay());
        const isEvening = start.getHours() >= 18;

        let price = 90000;
        if (room.type === 'vip') price = 120000;
        if (room.type === 'imax') price = 150000;
        if (isWeekend) price += 20000;
        if (isEvening) price += 10000;

        const newShow = {
          movieId: movie._id,
          roomId: room._id,
          startTime: start,
          endTime: end,
          price,
          language: ['VIE', 'ENG', 'SUB'][Math.floor(Math.random() * 3)]
        };

        if (!isTimeConflict(newShow, showtimeData)) {
          showtimeData.push(newShow);
        }
      }
    }
  }

  await Showtime.insertMany(showtimeData);
  console.log(`📅 Created ${showtimeData.length} showtimes`);

  console.log('\n✅ SEED DONE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin: admin@cineticket.vn / admin123');
  console.log('User : customer@cineticket.vn / customer123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━');

  process.exit();
};

seed().catch(err => {
  console.error(err);
  process.exit(1);
});