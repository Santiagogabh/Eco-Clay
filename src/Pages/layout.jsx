import React, { useState } from "react";
import { MapPin, Calendar, User, Heart, Sparkles } from "lucide-react";

const navigationItems = [
  {
    title: "Mapa",
    icon: MapPin,
    gradient: "from-emerald-400 to-teal-500",
    shadowColor: "shadow-emerald-500/50"
  },
  {
    title: "Eventos",
    icon: Calendar,
    gradient: "from-purple-400 to-pink-500",
    shadowColor: "shadow-purple-500/50"
  },
  {
    title: "Perfil",
    icon: User,
    gradient: "from-blue-400 to-cyan-500", 
    shadowColor: "shadow-blue-500/50"
  },
  {
    title: "Donaciones",
    icon: Heart,
    gradient: "from-rose-400 to-orange-500",
    shadowColor: "shadow-rose-500/50"
    <a href="donations.jsx"></a>
  }
];

export default function MapaLimpioLayout() {
  const [activeTab, setActiveTab] = useState(0);

  const renderContent = () => {
    switch(activeTab) {
      case 0: // Mapa
        return (
          <div className="h-full w-full">
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=-74.1469%2C4.5709%2C-74.0469%2C4.6709&layer=mapnik"
              className="w-full h-full border-0"
              title="Mapa"
            />
          </div>
        );
      
      case 1: // Eventos
        return (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black">Eventos de Limpieza</h2>
                <p className="text-gray-600">Colabora para limpiar nuestra ciudad.</p>
              </div>
              <button className="bg-purple-400 hover:bg-purple-500 text-white px-6 py-3 rounded-2xl shadow-lg transition-all">
                + Crear evento
              </button>
            </div>

            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/30">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg mb-2">Limpieza Parque Simón Bolívar</h3>
                      <p className="text-sm text-gray-600 mb-3">Jornada de limpieza en el parque más grande de Bogotá</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>Calle 63 #48-77, Bogotá</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>2024-11-15 a las 09:00</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="w-4 h-4" />
                          <span>24 participantes</span>
                        </div>
                      </div>
                    </div>
                    
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                      Próximo
                    </span>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl flex-1 border border-gray-200 transition-all">
                      Ver Detalles
                    </button>
                    <button className="bg-emerald-400 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl flex items-center gap-2 transition-all">
                      <Heart className="w-4 h-4" />
                      Unirse
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 2: // Perfil
        return (
          <div className="p-6 space-y-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/30">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl">
                  <span className="text-white text-3xl font-bold">U</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Usuario</h2>
                  <p className="text-gray-600">usuario@ejemplo.com</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                    Eco-Voluntario
                  </span>
                </div>
              </div>
              
              <button className="bg-white hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-xl border border-gray-200 transition-all">
                Cerrar Sesión
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { title: "Eventos Participados", value: "5", icon: Calendar, color: "from-emerald-400 to-teal-500" },
                { title: "Horas Contribuidas", value: "12", icon: Calendar, color: "from-blue-400 to-cyan-500" },
                { title: "Total Donado", value: "$50K", icon: Heart, color: "from-rose-400 to-orange-500" },
                { title: "Eventos Creados", value: "2", icon: User, color: "from-purple-400 to-pink-500" }
              ].map((stat, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/30">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                🏆 Logros Eco-Friendly
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-100 text-emerald-700 p-4 rounded-xl text-center font-semibold">
                  🌱 Primer Paso
                </div>
                <div className="bg-blue-100 text-blue-700 p-4 rounded-xl text-center font-semibold">
                  🌿 Eco-Guerrero
                </div>
                <div className="bg-purple-100 text-purple-700 p-4 rounded-xl text-center font-semibold">
                  ⏰ Tiempo Verde
                </div>
                <div className="bg-rose-100 text-rose-700 p-4 rounded-xl text-center font-semibold">
                  💚 Corazón Generoso
                </div>
              </div>
            </div>
          </div>
        );
      
      case 3: // Donaciones
        return (
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-3xl font-black text-gray-800">Donaciones</h2>
              <p className="text-gray-600">Apoya los eventos de limpieza de la ciudad</p>
            </div>

            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
                        <Heart className="w-6 h-6 text-rose-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">Limpieza Parque Nacional</h3>
                        <p className="text-sm text-gray-600">Carrera 7 #35-20, Bogotá</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Recaudado</span>
                        <span className="font-medium">$250,000 / $500,000 COP</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-rose-400 h-2 rounded-full transition-all duration-300" style={{ width: '50%' }}></div>
                      </div>
                      <p className="text-xs text-gray-500">50% de la meta</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full bg-gradient-to-br from-rose-400 to-orange-500 hover:from-rose-500 hover:to-orange-600 text-white py-4 rounded-2xl shadow-xl font-bold text-lg transition-all">
              💰 Realizar Donación
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/50">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        .float-animation {
          animation: float 3s ease-in-out infinite;
        }
        
        .pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        .shimmer-text {
          background: linear-gradient(
            90deg,
            #059669 0%,
            #10b981 25%,
            #34d399 50%,
            #10b981 75%,
            #059669 100%
          );
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
      `}</style>
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/30">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl blur-xl opacity-50 pulse-glow"></div>
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/50 float-animation">
                  <Sparkles className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
              </div>
              
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold shimmer-text tracking-tight">
                  Mapa Limpio
                </h1>
                <p className="text-sm text-slate-600 font-medium">
                  Juntos por un futuro verde 🌱
                </p>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="flex items-center gap-3">
              {navigationItems.map((item, index) => {
                const isActive = activeTab === index;
                return (
                  <button
                    key={item.title}
                    onClick={() => setActiveTab(index)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? `bg-gradient-to-br ${item.gradient} shadow-lg ${item.shadowColor} scale-105` 
                        : 'bg-white/60 hover:bg-white/80 shadow-md hover:shadow-lg'
                    }`}
                  >
                    <item.icon 
                      className={`w-5 h-5 transition-colors duration-300 ${
                        isActive ? 'text-white' : 'text-slate-600'
                      }`} 
                      strokeWidth={2.5}
                    />
                    <span className={`text-sm font-bold transition-colors duration-300 ${
                      isActive ? 'text-white' : 'text-slate-600'
                    }`}>
                      {item.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="h-[calc(100vh-88px)] overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
}