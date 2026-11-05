import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Attach token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vmd_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 (auto logout)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('vmd_admin_token');
      localStorage.removeItem('vmd_admin_user');
      if (window.location.pathname.startsWith('/admin') && !window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// --- Auth ---
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// --- Products ---
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getBySlug: (slug) => api.get(`/products/${slug}`),
  getAllAdmin: (params) => api.get('/products/admin/all', { params }),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// --- Categories ---
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// --- Bookings ---
export const bookingsAPI = {
  submit: (data) => api.post('/bookings', data),
  checkStatus: (ref) => api.get(`/bookings/status/${ref}`),
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  getStats: () => api.get('/bookings/admin/stats'),
};

// --- Gallery ---
export const galleryAPI = {
  getAll: (params) => api.get('/gallery', { params }),
  getTournaments: () => api.get('/gallery/tournaments'),
  create: (data) => api.post('/gallery', data),
  update: (id, data) => api.put(`/gallery/${id}`, data),
  delete: (id) => api.delete(`/gallery/${id}`),
};

// --- Videos ---
export const videosAPI = {
  getAll: (params) => api.get('/videos', { params }),
  create: (data) => api.post('/videos', data),
  update: (id, data) => api.put(`/videos/${id}`, data),
  delete: (id) => api.delete(`/videos/${id}`),
};

// --- Settings ---
export const settingsAPI = {
  getPublic: () => api.get('/settings'),
  getAdmin: () => api.get('/settings/admin'),
  update: (data) => api.put('/settings', data),
};

// --- Enquiries (General contact form) ---
export const enquiriesAPI = {
  submit: (data) => api.post('/enquiries', data),
  getAll: (params) => api.get('/enquiries', { params }),
  update: (id, data) => api.put(`/enquiries/${id}`, data),
  delete: (id) => api.delete(`/enquiries/${id}`),
};

// --- Upload ---
export const uploadAPI = {
  productImages: (formData) => api.post('/upload/product', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  galleryImages: (formData) => api.post('/upload/gallery', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  logo: (formData) => api.post('/upload/logo', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// --- Analytics & Product Click Tracking ---
export const analyticsAPI = {
  // PUBLIC — no auth required
  trackClick: (data) => api.post('/analytics/product-click', data),
  trackWhatsappEnquiry: (data) => api.post('/analytics/whatsapp-enquiry', data),

  // ADMIN — requires JWT token
  getSummary: () => api.get('/analytics/summary'),
  getDaily: (params) => api.get('/analytics/daily', { params }),
  getProducts: (params) => api.get('/analytics/products', { params }),
  getRecent: (params) => api.get('/analytics/recent', { params }),

  // WhatsApp Enquiries admin
  getWhatsappEnquiries: (params) => api.get('/analytics/whatsapp-enquiries', { params }),
  updateWhatsappEnquiry: (id, data) => api.patch(`/analytics/whatsapp-enquiries/${id}`, data),
  deleteWhatsappEnquiry: (id) => api.delete(`/analytics/whatsapp-enquiries/${id}`),
};
