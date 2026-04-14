import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Gắn JWT token vào mỗi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cineticket_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Xử lý lỗi 401 → logout
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cineticket_token');
      localStorage.removeItem('cineticket_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
