# 🎬 CineBook

> An online movie ticket booking web application — Fullstack JavaScript (MERN Stack)

---

## 📌 About

**CineBook** is a full-stack web application that allows users to browse movies, view showtimes, select seats, and book tickets online. The project follows a **client-server architecture** with a clear separation between the frontend (React) and the backend (Node.js/Express REST API).

---

## 🗂️ Project Structure

```
CineBook/
├── backend/        # REST API Server (Node.js / Express)
├── frontend/       # Client-side UI (React)
└── README.md
```

---

## 🛠️ Tech Stack

### Frontend
- **React.js** — UI library
- **CSS** — Styling & responsive design
- **Axios / Fetch API** — HTTP requests to the backend

### Backend
- **Node.js** — Runtime environment
- **Express.js** — Web framework
- **MongoDB** — NoSQL database
- **Mongoose** — ODM for MongoDB
- **JWT** — User authentication (JSON Web Token)

---

## ⚙️ Getting Started

### Prerequisites

Make sure you have the following installed before running the project:

- [Node.js](https://nodejs.org/) >= 14.x
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/) (local or MongoDB Atlas)

> ⚠️ **Important:** This project does **not** include `node_modules`. You must run `npm install` in **both** the `backend/` and `frontend/` directories before starting the application.

---

### 1. Clone the repository

```bash
git clone https://github.com/DucsPhaam/CineBook.git
cd CineBook
```

---

### 2. Setup & Run Backend

```bash
cd backend
npm install        # Install dependencies (required — node_modules not included)
```

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/cinebook
JWT_SECRET=your_jwt_secret_key
```

Start the server:

```bash
npm start
# or in development mode with auto-reload
npm run dev
```

Backend will be running at: `http://localhost:5000`

---

### 3. Setup & Run Frontend

```bash
cd ../frontend
npm install        # Install dependencies (required — node_modules not included)
npm start
```

Frontend will be running at: `http://localhost:3000`

---

## 🚀 Features

- 🎥 Browse now-showing & upcoming movies
- 🗓️ View showtimes by date and cinema
- 💺 Interactive seat selection map
- 🔐 User registration & login (JWT-based auth)
- 🎫 Book tickets and view booking history
- 👤 Manage personal account information

---

## 📁 Directory Overview

### `backend/`

```
backend/
├── controllers/    # Business logic handlers
├── models/         # MongoDB schemas (Mongoose)
├── routes/         # API route definitions
├── middleware/     # JWT auth & other middleware
├── config/         # Database connection config
└── server.js       # Entry point
```

### `frontend/`

```
frontend/
├── public/         # Static assets
├── src/
│   ├── components/ # Reusable UI components
│   ├── pages/      # Application pages/views
│   ├── services/   # API call functions
│   ├── context/    # Global state management
│   └── App.js      # Root component
└── package.json
```

---

## 🔌 API Endpoints

| Method | Endpoint              | Description               |
|--------|-----------------------|---------------------------|
| GET    | `/api/movies`         | Get all movies            |
| GET    | `/api/movies/:id`     | Get a single movie        |
| GET    | `/api/showtimes`      | Get all showtimes         |
| POST   | `/api/bookings`       | Create a new booking      |
| POST   | `/api/auth/register`  | Register a new user       |
| POST   | `/api/auth/login`     | Login and receive a token |

---

## 👥 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "Add: description of change"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📄 License

This project is distributed under the [MIT License](https://opensource.org/licenses/MIT).

---

## 📬 Contact

- GitHub: [@DucsPhaam](https://github.com/DucsPhaam)

---

> Made with ❤️ by DucsPhaam
