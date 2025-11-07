import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Circle, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Zonas generales con sitios contaminados dentro
const contaminationClusters = [
  {
    id: 1,
    name: "Zona Suroccidente",
    coordinates: [4.61, -74.17],
    level: "Crítico",
    color: "#ef4444",
    radius: 6000,
    hotspots: [
      {
        name: "Kennedy - Patio Bonito",
        address: "Av. Ciudad de Cali con Calle 38 Sur",
        description: "Alta densidad vehicular y emisiones cerca de Portal Américas",
      },
      {
        name: "Bosa - El Porvenir",
        address: "Calle 69 Sur con Carrera 78G",
        description: "Zona industrial sin zonas verdes, límite con Soacha",
      },
      {
        name: "Ciudad Bolívar - Mochuelo Bajo",
        address: "Vía al Relleno Sanitario Doña Juana",
        description: "Acumulación de residuos y escombros cerca del relleno sanitario",
      },
    ],
  },
  {
    id: 2,
    name: "Zona Occidente",
    coordinates: [4.67, -74.14],
    level: "Medio",
    color: "#f59e0b",
    radius: 5500,
    hotspots: [
      {
        name: "Puente Aranda - San Rafael",
        address: "Calle 3ra con Carrera 53",
        description: "Zona industrial cerca a Av. 68 y Av. de Las Américas",
      },
      {
        name: "Fontibón - Centro",
        address: "Calle 19 con Carrera 100",
        description: "Influencia de tráfico aéreo y carga industrial",
      },
    ],
  },
  {
    id: 3,
    name: "Zona Norte",
    coordinates: [4.76, -74.07],
    level: "Bajo",
    color: "#22c55e",
    radius: 5000,
    hotspots: [
      {
        name: "Suba - Rincón",
        address: "Calle 129 con Avenida Suba",
        description: "Afectación ocasional por tráfico denso y urbanización",
      },
      {
        name: "Suba - Mazurén",
        address: "Calle 152 con Autopista Norte",
        description: "Buena arborización y planeación urbana",
      },
    ],
  },
];

// Icono de las zonas (círculos grandes visibles desde lejos)
const getZoneIcon = (color) => {
  return L.divIcon({
    className: "custom-zone-marker",
    html: `
      <div style="
        background: radial-gradient(circle at center, ${color} 0%, ${color}cc 40%, transparent 70%);
        width: 70px;
        height: 70px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 30px ${color}99;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="width: 20px; height: 20px; background: ${color}; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [70, 70],
    iconAnchor: [35, 35],
  });
};

export default function MapPage() {
  const [selectedZone, setSelectedZone] = useState(null);

  return (
    <div className="p-0 m-0 h-screen w-full">
      <MapContainer
        center={[4.71, -74.07]} // Bogotá
        zoom={10}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* Render de zonas principales */}
        {contaminationClusters.map((zone) => (
          <React.Fragment key={zone.id}>
            <Circle
              center={zone.coordinates}
              radius={zone.radius}
              pathOptions={{
                color: zone.color,
                fillColor: zone.color,
                fillOpacity: 0.2,
                weight: 2,
              }}
            />
            <Marker
              position={zone.coordinates}
              icon={getZoneIcon(zone.color)}
              eventHandlers={{
                click: () => setSelectedZone(zone),
              }}
            >
              <Popup>
                <div className="p-2 min-w-[250px]">
                  <h3 className="font-semibold text-gray-800 mb-2">{zone.name}</h3>
                  <Badge
                    className={`rounded-full text-xs px-3 py-1 mb-3 ${
                      zone.level === "Crítico"
                        ? "bg-red-100 text-red-700"
                        : zone.level === "Medio"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    Nivel {zone.level}
                  </Badge>

                  <div className="space-y-2">
                    {zone.hotspots.map((spot, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition"
                      >
                        <h4 className="font-medium text-gray-800">{spot.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {spot.address}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{spot.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
  );
}
