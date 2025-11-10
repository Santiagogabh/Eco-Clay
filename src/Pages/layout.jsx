import React, { useState } from "react";
import { MapPin, Calendar, User, Heart, Sparkles } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import UserMenu from "@/components/UserMenu";

export default function MapaLimpioLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { title: "Mapa", icon: MapPin, path: "/map", gradient: "from-emerald-400 to-teal-500", shadowColor: "shadow-emerald-500/40" },
    { title: "Eventos", icon: Calendar, path: "/events", gradient: "from-blue-400 to-cyan-500", shadowColor: "shadow-blue-500/40" },
    { title: "Perfil", icon: User, path: "/profile", gradient: "from-purple-400 to-pink-500", shadowColor: "shadow-purple-500/40" },
    { title: "Donaciones", icon: Heart, path: "/donations", gradient: "from-rose-400 to-orange-500", shadowColor: "shadow-rose-500/40" },
  ];

  const isActive = (path) => location.pathname === path;

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
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl blur-xl opacity-50 pulse-glow"></div>
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/50 float-animation">
                  <Sparkles className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
              </div>

              <div className="flex flex-col">
                <h1 className="text-xl font-bold shimmer-text tracking-tight">
                  Mapa Limpio
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  Juntos por un futuro verde 🌱
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-3">
              {navigationItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <button
                    key={item.title}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                      active
                        ? `bg-gradient-to-br ${item.gradient} shadow-lg ${item.shadowColor} scale-105`
                        : "bg-white/60 hover:bg-white/80 shadow-md hover:shadow-lg"
                    }`}
                  >
                    <item.icon
                      className={`w-5 h-5 transition-colors duration-300 ${
                        active ? "text-white" : "text-slate-600"
                      }`}
                      strokeWidth={2.5}
                    />
                    <span
                      className={`text-sm font-bold transition-colors duration-300 hidden md:block ${
                        active ? "text-white" : "text-slate-600"
                      }`}
                    >
                      {item.title}
                    </span>
                  </button>
                );
              })}

              {/* User Menu */}
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="h-[calc(100vh-88px)] overflow-y-auto">
        {children}
      </main>
    </div>
  );
}