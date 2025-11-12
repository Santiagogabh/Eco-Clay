import React, { useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, X, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import worldZones from "@/data/world_zones.json";
import cityHotspots from "@/data/city_hotspots.json";

// Componente para manejar zoom y centro del mapa
function MapController({ center, zoom }) {
  const map = useMap();
  
  React.useEffect(() => {
    if (center && zoom) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);

  return null;
}

// Icono personalizado para hotspots
const hotspotIcon = L.divIcon({
  className: "custom-hotspot-marker",
  html: `
    <div style="
      background: #ef4444;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.6);
      animation: pulse 2s infinite;
    "></div>
  `,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

export default function MapPage() {
  const [selectedZone, setSelectedZone] = useState(null);
  const [mapCenter, setMapCenter] = useState([10, -40]);
  const [mapZoom, setMapZoom] = useState(2.5);
  const [showHotspots, setShowHotspots] = useState(false);

  // Color según nivel de contaminación
  const getColor = (level) => {
    switch (level) {
      case "Crítico":
        return "#ef4444";
      case "Medio":
        return "#f59e0b";
      case "Bajo":
        return "#22c55e";
      default:
        return "#6b7280";
    }
  };

  // Tamaño del círculo
  const getRadius = (level) => {
    switch (level) {
      case "Crítico":
        return 18;
      case "Medio":
        return 14;
      case "Bajo":
        return 10;
      default:
        return 8;
    }
  };

  // Obtener hotspots de una ciudad específica
  const getHotspotsForCity = (cityName) => {
    return cityHotspots.filter(hotspot => 
      hotspot.city.toLowerCase().includes(cityName.toLowerCase()) ||
      cityName.toLowerCase().includes(hotspot.city.toLowerCase())
    );
  };

  // Manejar clic en zona
  const handleZoneClick = (zone) => {
    setSelectedZone(zone);
    setShowHotspots(true);
    
    // Hacer zoom a la ciudad
    const lat = zone.coordinates?.[0]?.[0]?.[1] || zone.coordinates?.[1];
    const lon = zone.coordinates?.[0]?.[0]?.[0] || zone.coordinates?.[0];
    
    if (lat && lon) {
      setMapCenter([lat, lon]);
      setMapZoom(11);
    }
  };

  // Resetear vista
  const resetView = () => {
    setSelectedZone(null);
    setShowHotspots(false);
    setMapCenter([10, -40]);
    setMapZoom(2.5);
  };

  const hotspotsToShow = selectedZone ? getHotspotsForCity(selectedZone.name) : [];

  return (
    <div className="relative p-0 m-0 h-screen w-full">
      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.5;
          }
        }
        .leaflet-popup-content-wrapper {
          border-radius: 16px;
          padding: 0;
        }
        .leaflet-popup-content {
          margin: 0;
        }
        .custom-hotspot-marker {
          background: transparent;
          border: none;
        }
      `}</style>

      {/* Panel de información si hay zona seleccionada */}
      {selectedZone && (
        <div className="absolute top-4 left-4 z-[1000] max-w-md">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{selectedZone.name}</h3>
                <p className="text-sm text-gray-600">{selectedZone.country}</p>
              </div>
              <div className="flex gap-2">
                <Badge className={`rounded-full ${
                  selectedZone.contamination_level === "Crítico"
                    ? "bg-red-100 text-red-700"
                    : selectedZone.contamination_level === "Medio"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                }`}>
                  {selectedZone.contamination_level}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetView}
                  className="rounded-xl h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span className="font-medium">
                  {hotspotsToShow.length} zonas críticas detectadas
                </span>
              </div>
              
              {hotspotsToShow.length > 0 && (
                <div className="mt-3 max-h-40 overflow-y-auto space-y-2 pr-2">
                  {hotspotsToShow.slice(0, 5).map((hotspot, idx) => (
                    <div key={idx} className="text-xs bg-red-50 p-2 rounded-lg">
                      <p className="font-semibold text-red-800">{hotspot.name}</p>
                      <p className="text-red-600 mt-1">{hotspot.description}</p>
                    </div>
                  ))}
                  {hotspotsToShow.length > 5 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{hotspotsToShow.length - 5} sitios más
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        minZoom={2}
        maxZoom={15}
        style={{ height: "100%", width: "100%", backgroundColor: "#f0fdfa" }}
        worldCopyJump={true}
      >
        <MapController center={mapCenter} zoom={mapZoom} />
        
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* Marcadores de zonas generales */}
        {worldZones.map((zone, index) => {
          const lat = zone.coordinates?.[0]?.[0]?.[1] || zone.coordinates?.[1];
          const lon = zone.coordinates?.[0]?.[0]?.[0] || zone.coordinates?.[0];

          if (!lat || !lon) return null;

          return (
            <CircleMarker
              key={`zone-${index}`}
              center={[lat, lon]}
              radius={getRadius(zone.contamination_level)}
              pathOptions={{
                color: getColor(zone.contamination_level),
                fillColor: getColor(zone.contamination_level),
                fillOpacity: showHotspots && selectedZone?.name === zone.name ? 0.3 : 0.65,
                weight: 2,
              }}
              eventHandlers={{
                click: () => handleZoneClick(zone),
              }}
            >
              <Popup>
                <div className="p-3 min-w-[200px]">
                  <h4 className="font-bold text-gray-800">{zone.name}</h4>
                  <p className="text-xs text-gray-600">{zone.country}</p>
                  <Button
                    size="sm"
                    className="w-full mt-2 bg-red-500 hover:bg-red-600 text-white rounded-xl"
                    onClick={() => handleZoneClick(zone)}
                  >
                    Ver zonas críticas
                  </Button>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* Mostrar hotspots específicos cuando se selecciona una ciudad */}
        {showHotspots && hotspotsToShow.map((hotspot, index) => {
          const [lat, lon] = hotspot.coordinates;
          
          return (
            <Marker
              key={`hotspot-${index}`}
              position={[lat, lon]}
              icon={hotspotIcon}
            >
              <Popup>
                <div className="p-4 min-w-[280px]">
                  <div className="flex items-start gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-gray-800 mb-1">{hotspot.name}</h4>
                      <p className="text-xs text-gray-600 mb-2">{hotspot.address}</p>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-xs text-red-700 font-medium mb-1">
                      ⚠️ Problema detectado:
                    </p>
                    <p className="text-xs text-red-600">{hotspot.description}</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}