import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import '../index.css';

// Pages
import LandingPage from "./Pages/LandingPage";
import LoginPage from "./Pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import MapPage from '@/Pages/maps.jsx';
import EventsPage from '@/Pages/events.jsx';
import DonationsPage from '@/Pages/donations.jsx';
import ProfilePage from '@/Pages/profile.jsx';

// Layout
import Layout from '@/Pages/layout.jsx';

// Componente para manejar el callback de autenticación
function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Si hay hash en la URL (tokens de Supabase), limpiar y redirigir
    if (location.hash) {
      // Extraer los tokens del hash
      const hashParams = new URLSearchParams(location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      
      if (accessToken) {
        // Hay tokens, redirigir al mapa limpiando la URL
        navigate('/map', { replace: true });
      }
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Completando autenticación...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Routes - Wrapped in Layout */}
        <Route
          path="/map"
          element={
            <ProtectedRoute>
              <AuthCallback />
              <Layout>
                <MapPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <Layout>
                <EventsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/donations"
          element={
            <ProtectedRoute>
              <Layout>
                <DonationsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <ProfilePage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Fallback - Redirect to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);