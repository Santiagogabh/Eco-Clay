import React, { useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import worldZones from "@/data/world_zones.json"; // Archivo con ciudades contaminadas

export default function MapPage() {
  const [selectedZone, setSelectedZone] = useState(null);

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

  // Tamaño del círculo relativo al nivel (para destacar más los críticos)
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

  return (
    <div className="p-0 m-0 h-screen w-full">
      <MapContainer
        center={[10, -40]} // Centro global que muestra bien América, África y Europa
        zoom={2.5}
        minZoom={2}
        maxZoom={7}
        style={{ height: "100%", width: "100%", backgroundColor: "#f0fdfa" }}
        worldCopyJump={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* Marcadores de zonas contaminadas */}
        {worldZones.map((zone, index) => {
          const { coordinates, contamination_level } = zone;
          // Si las coordenadas vienen en formato Polygon (array dentro de array), tomamos el primer punto
          const lat = coordinates?.[0]?.[0]?.[1] || coordinates?.[1];
          const lon = coordinates?.[0]?.[0]?.[0] || coordinates?.[0];

          if (!lat || !lon) return null;

          return (
            <CircleMarker
              key={index}
              center={[lat, lon]}
              radius={getRadius(contamination_level)}
              pathOptions={{
                color: getColor(contamination_level),
                fillColor: getColor(contamination_level),
                fillOpacity: 0.65,
                weight: 2,
              }}
              eventHandlers={{
                click: () => setSelectedZone(zone),
              }}
            />
          );
        })}

        {/* Popup al hacer clic */}
        {selectedZone && (
          <Popup
            position={[
              selectedZone.coordinates?.[0]?.[0]?.[1] ||
                selectedZone.coordinates?.[1],
              selectedZone.coordinates?.[0]?.[0]?.[0] ||
                selectedZone.coordinates?.[0],
            ]}
            onClose={() => setSelectedZone(null)}
          >
            <div className="p-2 min-w-[270px]">
              <h3 className="font-semibold text-gray-800 mb-1">
                {selectedZone.name}
              </h3>
              <p className="text-xs text-gray-500 mb-1">
                {selectedZone.country}
              </p>

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
                      <h4 className="font-medium text-gray-800">
                        {spot.name}
                      </h4>
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
