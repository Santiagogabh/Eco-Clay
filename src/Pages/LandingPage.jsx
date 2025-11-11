import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Users, Heart, Sparkles, Play, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const [showVideo, setShowVideo] = useState(false);

  const benefits = [
    {
      icon: MapPin,
      title: "Mapa de Contaminación",
      description: "Visualiza en tiempo real las zonas más contaminadas de tu ciudad",
      color: "from-emerald-400 to-teal-500"
    },
    {
      icon: Calendar,
      title: "Eventos de Limpieza",
      description: "Organiza y participa en jornadas de limpieza colaborativas",
      color: "from-blue-400 to-cyan-500"
    },
    {
      icon: Users,
      title: "Comunidad Activa",
      description: "Conoce y conecta con otros ambientalistas de tu zona",
      color: "from-purple-400 to-pink-500"
    },
    {
      icon: Heart,
      title: "Donaciones Seguras",
      description: "Apoya eventos y causas ambientales con total transparencia",
      color: "from-rose-400 to-orange-500"
    }
  ];

  const pollutedCities = [
    {
      name: "Bogotá, Colombia",
      image: "https://images.unsplash.com/photo-1568632234157-ce7aecd03d0d?w=800&q=80",
      problem: "Alta contaminación por tráfico vehicular"
    },
    {
      name: "Ciudad de México",
      image: "https://images.unsplash.com/photo-1518639192441-8fce0a366e2e?w=800&q=80",
      problem: "Smog y contaminación atmosférica crítica"
    },
    {
      name: "Delhi, India",
      image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80",
      problem: "Niveles peligrosos de PM2.5"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20">
          {/* Header */}
          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-black text-gray-800">Mapa Limpio</h1>
            </div>
            <Button 
              onClick={() => navigate("/login")}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl px-6 hover:shadow-lg hover:scale-105 transition-all"
            >
              Iniciar Sesión
            </Button>
          </div>

          {/* Hero Content */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="space-y-6">
              <div className="inline-block">
                <span className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  Desarrollado por Santiago Hernandez
                </span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-gray-900 leading-tight">
                Limpia tu ciudad,
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600"> transforma</span> el mundo
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Visualiza los lugares mas contaminados. Conoce ambientalistas.
                Crea y asiste a eventos de limpieza. Dona para apoyar causas ambientales.
              </p>
              <div className="flex gap-4">
                <Button 
                  onClick={() => navigate("/login")}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl px-8 py-6 text-lg font-bold hover:shadow-xl hover:scale-105 transition-all"
                >
                  Quiero ver como funciona
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  onClick={() => setShowVideo(!showVideo)}
                  variant="outline"
                  className="rounded-xl px-8 py-6 text-lg font-bold border-2 border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 transition-all"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Ver Demo
                </Button>
              </div>
            </div>

            {/* Video/Image Section */}
            <div className="relative">
              {showVideo ? (
                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Play className="w-16 h-16 mx-auto mb-4" />
                      <p className="text-lg">Video demo de la aplicación</p>
                      <p className="text-sm opacity-80 mt-2">Próximamente disponible</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80" 
                    alt="Voluntarios limpiando"
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                    <p className="text-white font-bold text-lg">Voluntarios en acción 🌱</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cities Section */}
      <div className="bg-white/80 backdrop-blur-sm py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              Ciudades Afectadas por la Contaminación
            </h3>
            <p className="text-lg text-gray-600">
              Millones de personas ayudan a contrarestar la contaminación en sus comunidades
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pollutedCities.map((city, index) => (
              <div key={index} className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <img 
                  src={city.image} 
                  alt={city.name}
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h4 className="text-xl font-bold mb-2">{city.name}</h4>
                  <p className="text-sm opacity-90">{city.problem}</p>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    Crítico
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              ¿Qué puedes hacer con Mapa Limpio?
            </h3>
            <p className="text-lg text-gray-600">
              Herramientas para limpiar la ciudad
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <benefit.icon className="w-7 h-7 text-white" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h4>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-4xl md:text-5xl font-black text-white mb-6">
            Quiero ver las calles limpias
          </h3>
          <p className="text-xl text-white/90 mb-8">
            Únete a miles de ambientalistas que están transformando sus comunidades
          </p>
          <Button 
            onClick={() => navigate("/login")}
            className="bg-white text-emerald-600 rounded-xl px-10 py-6 text-lg font-bold hover:shadow-2xl hover:scale-105 transition-all"
          >
            Crear mi cuenta gratis
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-white/80 text-sm mt-4">
            ✓ Sin costos ✓ Sin anuncios ✓ Gratis
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black">Mapa Limpio</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2025 Mapa Limpio. Todos los derechos reservados.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}