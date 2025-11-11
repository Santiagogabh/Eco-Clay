import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polygon, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import worldZones from "@/data/world_zones.json"; // Archivo con ciudades de Latinoamérica

export default function MapPage() {
  const [selectedZone, setSelectedZone] = useState(null);

  // Colores según nivel
  const getColor = (level) => {
    switch (level) {
      case "Crítico":
        return "#ef4444";
      case "Medio":
        return "#f59e0b";
      case "Bajo":
        return "#22c55e";
      default:
        return "#9ca3af";
    }
  };

  return (
    <div className="p-0 m-0 h-screen w-full">
      <MapContainer
        center={[-10, -70]} // Centro aproximado de Sudamérica
        zoom={3.5}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* Polígonos de zonas de contaminación */}
        {worldZones.map((zone, index) => (
          <Polygon
            key={index}
            positions={zone.coordinates}
            pathOptions={{
              color: getColor(zone.contamination_level),
              fillColor: getColor(zone.contamination_level),
              fillOpacity: 0.3,
              weight: 1.5,
            }}
            eventHandlers={{
              click: () => setSelectedZone(zone),
            }}
          />
        ))}

        {/* Popup al hacer clic en una ciudad */}
        {selectedZone && (
          <Popup
            position={selectedZone.coordinates[0][0]}
            onClose={() => setSelectedZone(null)}
          >
            <div className="p-2 min-w-[270px]">
              <h3 className="font-semibold text-gray-800 mb-1">
                {selectedZone.name}
              </h3>
              <p className="text-xs text-gray-500 mb-1">{selectedZone.country}</p>

              <Badge
                className={`rounded-full text-xs px-3 py-1 mb-3 ${
                  selectedZone.contamination_level === "Crítico"
                    ? "bg-red-100 text-red-700"
                    : selectedZone.contamination_level === "Medio"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                Nivel {selectedZone.contamination_level}
              </Badge>

              {/* Sitios específicos dentro de la zona */}
              {selectedZone.hotspots && (
                <div className="space-y-2">
                  {selectedZone.hotspots.map((spot, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition"
                    >
                      <h4 className="font-medium text-gray-800">{spot.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {spot.address}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {spot.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Popup>
        )}
      </MapContainer>
    </div>
  );
}
