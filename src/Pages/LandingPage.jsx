import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, Users, Heart, Sparkles, Play, ArrowRight } from "lucide-react";
import "@/landing.css"; // Archivo CSS único

export default function LandingPage() {
  const navigate = useNavigate();
  const [showVideo, setShowVideo] = useState(false);

  const benefits = [
    {
      icon: MapPin,
      title: "Mapa de Contaminación",
      description: "Explora las zonas más afectadas y toma acción.",
    },
    {
      icon: Calendar,
      title: "Eventos de Limpieza",
      description: "Únete a jornadas y transforma tu comunidad.",
    },
    {
      icon: Users,
      title: "Comunidad Activa",
      description: "Conecta con voluntarios ambientales cerca de ti.",
    },
    {
      icon: Heart,
      title: "Donaciones Seguras",
      description: "Apoya causas reales y transparentes.",
    },
  ];

  return (
    <div className="landing-wrapper">
      {/* NAVIGATION */}
      <nav className="menu">
        <a href="#" className="link" onClick={() => navigate("/")}>
          <div className="link-icon">
            <Sparkles />
          </div>
          <span className="link-title">Inicio</span>
        </a>
        <a href="#" className="link" onClick={() => navigate("/login")}>
          <div className="link-icon">
            <Play />
          </div>
          <span className="link-title">Ingresar</span>
        </a>
        <a href="#" className="link" onClick={() => navigate("/map")}>
          <div className="link-icon">
            <MapPin />
          </div>
          <span className="link-title">Mapa</span>
        </a>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-text">
          <h1>
            Limpia tu ciudad, <span>transforma el mundo</span>
          </h1>
          <p>
            Mapa Limpio es una aplicación creada para visualizar zonas contaminadas,
            organizar eventos de limpieza y conectar con una comunidad que actúa.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => navigate("/login")}>
              Comenzar <ArrowRight />
            </button>
            <button className="btn-secondary" onClick={() => setShowVideo(!showVideo)}>
              Ver demo <Play />
            </button>
          </div>
        </div>
        <div className="hero-media">
          {showVideo ? (
            <div className="video-demo">
              <Play className="icon-play" />
              <p>Video demostrativo (Próximamente)</p>
            </div>
          ) : (
            <img
              src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80"
              alt="Voluntarios limpiando"
            />
          )}
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="benefits">
        <h2>¿Qué puedes hacer con Mapa Limpio?</h2>
        <div className="benefit-grid">
          {benefits.map((b, i) => (
            <div className="benefit-card" key={i}>
              <div className="benefit-icon">
                <b.icon />
              </div>
              <h3>{b.title}</h3>
              <p>{b.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>Quiero unirme gratis</h2>
        <p>Miles de personas limpian las ciudades y son activistas climaticos.</p>
        <button className="btn-light" onClick={() => navigate("/login")}>
          ¿Como creo mi cuenta? <ArrowRight />
        </button>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <p>© 2025 Mapa Limpio. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
