import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MapPin, Calendar, User, Heart } from "lucide-react";

const navigationItems = [
  {
    title: "Mapa",
    url: createPageUrl("Map"),
    icon: MapPin,
    color: "bg-mint-100",
    shadowColor: "shadow-mint-200"
  },
  {
    title: "Eventos",
    url: createPageUrl("Events"), 
    icon: Calendar,
    color: "bg-lavender-100",
    shadowColor: "shadow-lavender-200"
  },
  {
    title: "Perfil",
    url: createPageUrl("Profile"),
    icon: User,
    color: "bg-baby-blue-100", 
    shadowColor: "shadow-baby-blue-200"
  },
  {
    title: "Donaciones",
    url: createPageUrl("Donations"),
    icon: Heart,
    color: "bg-coral-100",
    shadowColor: "shadow-coral-200"
  }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 to-baby-blue-50">
      <style>{`
        :root {
          --mint-50: #f0fdf4;
          --mint-100: #dcfce7;
          --mint-200: #bbf7d0;
          --mint-300: #86efac;
          --mint-400: #4ade80;
          --mint-500: #22c55e;
          
          --baby-blue-50: #f0f9ff;
          --baby-blue-100: #e0f2fe;
          --baby-blue-200: #bae6fd;
          --baby-blue-300: #7dd3fc;
          --baby-blue-400: #38bdf8;
          --baby-blue-500: #0ea5e9;
          
          --lavender-50: #faf5ff;
          --lavender-100: #f3e8ff;
          --lavender-200: #e9d5ff;
          --lavender-300: #d8b4fe;
          --lavender-400: #c084fc;
          --lavender-500: #a855f7;
          
          --coral-50: #fef2f2;
          --coral-100: #fee2e2;
          --coral-200: #fecaca;
          --coral-300: #fca5a5;
          --coral-400: #f87171;
          --coral-500: #ef4444;
        }
        
        .bg-mint-50 { background-color: var(--mint-50); }
        .bg-mint-100 { background-color: var(--mint-100); }
        .bg-mint-200 { background-color: var(--mint-200); }
        .bg-baby-blue-50 { background-color: var(--baby-blue-50); }
        .bg-baby-blue-100 { background-color: var(--baby-blue-100); }
        .bg-baby-blue-200 { background-color: var(--baby-blue-200); }
        .bg-lavender-100 { background-color: var(--lavender-100); }
        .bg-lavender-200 { background-color: var(--lavender-200); }
        .bg-coral-100 { background-color: var(--coral-100); }
        .bg-coral-200 { background-color: var(--coral-200); }
        
        .shadow-mint-200 { box-shadow: 0 8px 25px -8px var(--mint-200), inset 0 1px 0 rgba(255,255,255,0.6); }
        .shadow-baby-blue-200 { box-shadow: 0 8px 25px -8px var(--baby-blue-200), inset 0 1px 0 rgba(255,255,255,0.6); }
        .shadow-lavender-200 { box-shadow: 0 8px 25px -8px var(--lavender-200), inset 0 1px 0 rgba(255,255,255,0.6); }
        .shadow-coral-200 { box-shadow: 0 8px 25px -8px var(--coral-200), inset 0 1px 0 rgba(255,255,255,0.6); }
        
        .clay-card {
          background: linear-gradient(145deg, #ffffff, #f8fafc);
          box-shadow: 
            0 8px 32px -8px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.8),
            inset 0 -1px 0 rgba(0, 0, 0, 0.05);
          border-radius: 20px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .clay-card:hover {
          transform: translateY(-2px);
          box-shadow: 
            0 12px 40px -8px rgba(0, 0, 0, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.9),
            inset 0 -1px 0 rgba(0, 0, 0, 0.05);
        }
        
        .clay-button {
          border-radius: 16px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 
            0 4px 14px -4px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.6);
        }
        
        .clay-button:hover {
          transform: translateY(-1px);
          box-shadow: 
            0 6px 20px -4px rgba(0, 0, 0, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
        }
        
        .clay-button:active {
          transform: translateY(0px);
          box-shadow: 
            0 2px 8px -2px rgba(0, 0, 0, 0.1),
            inset 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
      
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mint-400 to-baby-blue-400 flex items-center justify-center clay-card">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-2">
                {/* Logo de EcoClay */}
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg font-bold">🌱</span>
                </div>
                <div>
                  <h1 className="text-green-600 text-xl font-bold">EcoClay</h1>
                  <p className="text-sm text-gray-500">Limpiemos nuestra ciudad</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-24">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100">
        <div className="px-4 py-2">
          <div className="flex justify-around items-center">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.url;
              return (
                <Link
                  key={item.title}
                  to={item.url}
                  className={`flex flex-col items-center py-2 px-3 rounded-2xl transition-all duration-300 ${
                    isActive 
                      ? `${item.color} ${item.shadowColor} scale-105` 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <item.icon className={`w-6 h-6 mb-1 ${
                    isActive ? 'text-gray-700' : 'text-gray-400'
                  }`} />
                  <span className={`text-xs font-medium ${
                    isActive ? 'text-gray-700' : 'text-gray-400'
                  }`}>
                    {item.title}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}