import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
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

// Componente para manejar tokens en el hash
function HashTokenHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleHashToken = async () => {
      // Si hay hash con tokens de autenticación
      if (location.hash && location.hash.includes('access_token')) {
        try {
          // Extraer los parámetros del hash
          const hashParams = new URLSearchParams(location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken && refreshToken) {
            console.log('✅ Tokens detectados en hash, estableciendo sesión...');
            
            // Establecer la sesión
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });

            if (error) {
              console.error('❌ Error al establecer sesión:', error);
            } else {
              console.log('✅ Sesión establecida correctamente');
            }

            // Limpiar el hash de la URL y redirigir
            const cleanPath = location.pathname;
            navigate(cleanPath, { replace: true });
          }
        } catch (error) {
          console.error('❌ Error procesando tokens:', error);
          // Si hay error, redirigir a login
          navigate('/login', { replace: true });
        }
      }
    };

    handleHashToken();
  }, [location, navigate]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <HashTokenHandler />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Routes - Wrapped in Layout */}
        <Route
          path="/map"
          element={
            <ProtectedRoute>
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