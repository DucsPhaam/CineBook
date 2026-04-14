import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Customer Pages
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import SeatSelection from './pages/SeatSelection';
import Payment from './pages/Payment';
import BookingSuccess from './pages/BookingSuccess';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminMovies from './pages/admin/Movies';
import AdminTheaters from './pages/admin/Theaters';
import AdminRooms from './pages/admin/Rooms';
import AdminShowtimes from './pages/admin/Showtimes';
import AdminBookings from './pages/admin/Bookings';

// Customer Layout wrapper
const CustomerLayout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
    <Footer />
  </>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#13131f',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: 'white' } },
            error: { iconTheme: { primary: '#e50914', secondary: 'white' } },
          }}
        />

        <Routes>
          {/* Login / Register - no navbar */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute adminOnly>
                <AdminLayout>
                  <Routes>
                    <Route index element={<Dashboard />} />
                    <Route path="movies" element={<AdminMovies />} />
                    <Route path="theaters" element={<AdminTheaters />} />
                    <Route path="rooms" element={<AdminRooms />} />
                    <Route path="showtimes" element={<AdminShowtimes />} />
                    <Route path="bookings" element={<AdminBookings />} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Customer Routes */}
          <Route path="/" element={<CustomerLayout><Home /></CustomerLayout>} />
          <Route path="/movies/:id" element={<CustomerLayout><MovieDetail /></CustomerLayout>} />

          {/* Protected Customer Routes */}
          <Route
            path="/seat-selection/:showtimeId"
            element={
              <ProtectedRoute>
                <CustomerLayout><SeatSelection /></CustomerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/:bookingId"
            element={
              <ProtectedRoute>
                <CustomerLayout><Payment /></CustomerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking-success/:bookingId"
            element={
              <ProtectedRoute>
                <CustomerLayout><BookingSuccess /></CustomerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <CustomerLayout><MyBookings /></CustomerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <CustomerLayout><Profile /></CustomerLayout>
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route
            path="*"
            element={
              <CustomerLayout>
                <div className="page-wrapper">
                  <div className="empty-state" style={{ paddingTop: 100 }}>
                    <div style={{ fontSize: 80, marginBottom: 16 }}>🎬</div>
                    <h2 style={{ fontSize: 32, marginBottom: 8 }}>404</h2>
                    <h3>Trang không tìm thấy</h3>
                    <p style={{ marginTop: 8, marginBottom: 24 }}>Trang bạn tìm kiếm không tồn tại.</p>
                    <a href="/" className="btn btn-primary">Về trang chủ</a>
                  </div>
                </div>
              </CustomerLayout>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
