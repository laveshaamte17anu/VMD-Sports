import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SettingsProvider } from './context/SettingsContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';

// Admin imports
import ProtectedRoute from './components/shared/ProtectedRoute';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBookings from './pages/admin/AdminBookings';
import AdminBookingDetail from './pages/admin/AdminBookingDetail';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminCategories from './pages/admin/AdminCategories';
import AdminGallery from './pages/admin/AdminGallery';
import AdminVideos from './pages/admin/AdminVideos';
import AdminEnquiries from './pages/admin/AdminEnquiries';
import AdminSettings from './pages/admin/AdminSettings';

function SectionScroller() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname.replace(/^\//, '');
    const sectionMap = {
      about: 'about',
      services: 'services',
      merchandise: 'merchandise',
      'live-streaming': 'livestreaming',
      livestreaming: 'livestreaming',
      contact: 'contact',
    };

    const targetId = sectionMap[path] || (location.hash ? location.hash.replace('#', '') : null);
    if (targetId) {
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (path === '') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#121212',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontFamily: 'sans-serif',
              },
            }}
          />
          <SectionScroller />
          <Routes>
            {/* Public Brand Routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="about" element={<HomePage />} />
              <Route path="services" element={<HomePage />} />
              <Route path="merchandise" element={<HomePage />} />
              <Route path="live-streaming" element={<HomePage />} />
              <Route path="contact" element={<HomePage />} />
            </Route>

            {/* Admin Authentication & Management Portal */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="bookings/:id" element={<AdminBookingDetail />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/new" element={<AdminProductForm />} />
              <Route path="products/:id/edit" element={<AdminProductForm />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="gallery" element={<AdminGallery />} />
              <Route path="videos" element={<AdminVideos />} />
              <Route path="enquiries" element={<AdminEnquiries />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Catch-all Fallback */}
            <Route path="*" element={<Layout><HomePage /></Layout>} />
          </Routes>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
