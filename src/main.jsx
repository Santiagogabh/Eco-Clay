import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '../index.css';

// Pages
import LoginPage from "./Pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import MapPage from '@/Pages/maps.jsx';
import EventsPage from '@/Pages/events.jsx';
import DonationsPage from '@/Pages/donations.jsx';
import ProfilePage from '@/Pages/profile.jsx';
import CreateEventPage from '@/Pages/create_event.jsx';

// Layout is at project root
import Layout from '@/Pages/layout.jsx';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/map" replace />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/donations" element={<DonationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/create-event" element={<CreateEventPage />} />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/map" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/events" 
            element={
              <ProtectedRoute>
                <EventsPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
