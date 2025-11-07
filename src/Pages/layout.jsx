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
  }
];

export default function GreenPulseLayout() {
  const [activeTab, setActiveTab] = useState(0);

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
        
        .glass-morphism {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .nav-item-active {
          transform: translateY(-8px);
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .nav-item {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .nav-item:hover {
          transform: translateY(-4px) scale(1.05);
        }
        
        .nav-item:active {
          transform: scale(0.95);
        }
      `}</style>
      
      {/* Header con diseño mejorado */}
      <header className="sticky top-0 z-50 glass-morphism shadow-lg shadow-emerald-100/50">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Logo mejorado con animación */}
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
            
            {/* Navigation en el header */}
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

      {/* Main Content - Aquí va tu mapa */}
      <main className="h-[calc(100vh-80px)]">
        {children}
      </main>
    </div>
  );
}