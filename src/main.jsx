import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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