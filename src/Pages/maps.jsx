import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import { CleanupEvent } from "@/entities/CleanupEvent";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, Users, Plus, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import "leaflet/dist/leaflet.css";

// Zonas contaminadas de Bogotá
const contaminatedZones = [
  // Alta prioridad (🔴)
  {
    id: 1,
    name: "Kennedy - Patio Bonito",
    upz: "UPZ 80 Patio Bonito / UPZ 39 Kennedy Central",
    address: "Av. Ciudad de Cali con Calle 38 Sur",
    coordinates: [4.6097, -74.1506],
    priority: "high",
    level: "Alto",
    description: "Alta densidad vehicular y emisiones cerca de Portal Américas",
    color: "#ef4444"
  },
  {
    id: 2,
    name: "Bosa - El Porvenir",
    upz: "UPZ 86 El Porvenir / UPZ 83 Bosa Occidental",
    address: "Calle 69 Sur con Carrera 78G",
    coordinates: [4.5847, -74.1742],
    priority: "high",
    level: "Alto",
    description: "Zona industrial sin zonas verdes, límite con Soacha",
    color: "#ef4444"
  },
  {
    id: 3,
    name: "Ciudad Bolívar - Mochuelo Bajo",
    upz: "UPZ 67 Mochuelo Bajo / UPZ 69 El Tesoro",
    address: "Vía al Relleno Sanitario Doña Juana",
    coordinates: [4.5234, -74.1836],
    priority: "high",
    level: "Alto",
    description: "Acumulación de residuos y escombros cerca del relleno sanitario",
    color: "#ef4444"
  },
  {
    id: 4,
    name: "Puente Aranda - San Rafael",
    upz: "UPZ 43 San Rafael / Carvajal",
    address: "Calle 3ra con Carrera 53",
    coordinates: [4.6351, -74.1201],
    priority: "high",
    level: "Alto",
    description: "Zona industrial cerca a Av. 68 y Av. de Las Américas",
    color: "#ef4444"
  },
  // Prioridad media (🟡)
  {
    id: 5,
    name: "Tunjuelito - Venecia",
    upz: "UPZ 55 Venecia / UPZ 54 San Carlos",
    address: "Calle 47B Sur con Carrera 24",
    coordinates: [4.5892, -74.1372],
    priority: "medium",
    level: "Medio",
    description: "Fluctuaciones por condiciones de viento y congestión vehicular",
    color: "#f59e0b"
  },
  {
    id: 6,
    name: "Fontibón - Centro",
    upz: "UPZ 98 Fontibón Centro / UPZ 97 Capellanía",
    address: "Calle 19 con Carrera 100",
    coordinates: [4.6704, -74.1436],
    priority: "medium",
    level: "Medio",
    description: "Influencia de tráfico aéreo y carga industrial",
    color: "#f59e0b"
  },
  {
    id: 7,
    name: "Suba - Rincón",
    upz: "UPZ 71 Suba Rincón / UPZ 72 Tibabuyes",
    address: "Calle 129 con Avenida Suba",
    coordinates: [4.7582, -74.0861],
    priority: "medium",
    level: "Medio",
    description: "Afectación ocasional por tráfico denso y urbanización",
    color: "#f59e0b"
  },
  // Prioridad baja (🟢)
  {
    id: 8,
    name: "Suba - Mazurén",
    upz: "UPZ 75 Niza Norte",
    address: "Calle 152 con Autopista Norte",
    coordinates: [4.7889, -74.0536],
    priority: "low",
    level: "Bajo",
    description: "Buena arborización y planeación urbana",
    color: "#22c55e"
  },
  {
    id: 9,
    name: "Suba - Colina Campestre",
    upz: "UPZ 76",
    address: "Calle 138 con Carrera 58",
    coordinates: [4.7736, -74.0694],
    priority: "low",
    level: "Bajo",
    description: "Sector residencial con bajo impacto industrial y buena ventilación",
    color: "#22c55e"
  }
];

export default function MapPage() {
  const [events, setEvents] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const eventData = await CleanupEvent.list('-created_date');
      setEvents(eventData);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };

  const getZoneIcon = (priority) => {
    const config = {
      high: { color: '#ef4444', icon: '🔴' },
      medium: { color: '#f59e0b', icon: '🟡' },
      low: { color: '#22c55e', icon: '🟢' }
    };
    
    return L.divIcon({
      className: 'custom-zone-marker',
      html: `
        <div style="
          background: ${config[priority].color};
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        ">
          ${config[priority].icon}
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });
  };

  const getEventIcon = (status) => {
    const colors = {
      upcoming: '#22c55e',
      active: '#0ea5e9', 
      completed: '#a855f7'
    };
    
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background: ${colors[status]};
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 8px;
            height: 8px;
            background: white;
            border-radius: 50%;
          "></div>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  };

  const getPriorityBadge = (priority) => {
    const config = {
      high: { label: 'Alta Prioridad', className: 'bg-red-100 text-red-700' },
      medium: { label: 'Prioridad Media', className: 'bg-yellow-100 text-yellow-700' },
      low: { label: 'Prioridad Baja', className: 'bg-green-100 text-green-700' }
    };
    return config[priority];
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      high: AlertTriangle,
      medium: AlertCircle,
      low: CheckCircle
    };
    return icons[priority];
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded-2xl w-48 clay-card"></div>
          <div className="h-96 bg-gray-200 rounded-2xl clay-card"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-left">Zonas más contaminadas</h2>
          <p className="text-gray-600">Necesitan de tu colaboración en este momento</p>
        </div>
        <Link to={createPageUrl("CreateEvent")}>
          <Button className="clay-button bg-mint-400 hover:bg-mint-500 text-white rounded-2xl px-6">
            <Plus className="w-4 h-4 mr-2" />
            Crear Evento
          </Button>
        </Link>
      </div>

      {/* Map Container */}
      <div className="clay-card overflow-hidden" style={{ height: '500px' }}>
        <MapContainer
          center={[4.7110, -74.0721]} // Bogotá, Colombia coordinates
          zoom={11}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Zonas contaminadas */}
          {contaminatedZones.map((zone) => (
            <React.Fragment key={zone.id}>
              <Circle
                center={zone.coordinates}
                radius={1500}
                pathOptions={{
                  color: zone.color,
                  fillColor: zone.color,
                  fillOpacity: 0.15,
                  weight: 2
                }}
              />
              <Marker
                position={zone.coordinates}
                icon={getZoneIcon(zone.priority)}
                eventHandlers={{
                  click: () => setSelectedZone(zone)
                }}
              >
                <Popup>
                  <div className="p-3 min-w-[250px]">
                    <h3 className="font-semibold text-gray-800 mb-2">{zone.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{zone.upz}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{zone.address}</span>
                    </div>
                    <Badge className={`${getPriorityBadge(zone.priority).className} rounded-full mb-2`}>
                      Contaminación {zone.level}
                    </Badge>
                    <p className="text-sm text-gray-600">{zone.description}</p>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          ))}

          {/* Eventos de limpieza */}
          {events.map((event) => (
            event.latitude && event.longitude && (
              <Marker
                key={event.id}
                position={[event.latitude, event.longitude]}
                icon={getEventIcon(event.status)}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold text-gray-800">{event.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{event.address}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{event.date} - {event.time}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>
      </div>

      {/* Zonas afectadas por prioridad */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-800">Zonas afectadas por prioridad</h3>
        
        {['high', 'medium', 'low'].map((priority) => {
          const zones = contaminatedZones.filter(zone => zone.priority === priority);
          const badgeConfig = getPriorityBadge(priority);
          const IconComponent = getPriorityIcon(priority);
          
          return (
            <div key={priority} className="space-y-4">
              <div className="flex items-center gap-3">
                <IconComponent className={`w-6 h-6 ${
                  priority === 'high' ? 'text-red-500' :
                  priority === 'medium' ? 'text-yellow-500' : 'text-green-500'
                }`} />
                <h4 className="text-lg font-semibold text-gray-800">
                  {badgeConfig.label}
                </h4>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                {zones.map((zone) => (
                  <Card key={zone.id} className="clay-card hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => setSelectedZone(zone)}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h5 className="font-semibold text-gray-800">{zone.name}</h5>
                          <p className="text-sm text-gray-500">{zone.upz}</p>
                        </div>
                        <Badge className={`${badgeConfig.className} rounded-full text-xs`}>
                          {zone.level}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{zone.address}</span>
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {zone.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Eventos de limpieza */}
      {events.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Eventos de Limpieza Activos</h3>
          <div className="grid gap-4">
            {events.filter(e => e.status === 'upcoming').map((event) => (
              <div key={event.id} className="clay-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-2">{event.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{event.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{event.date} a las {event.time}</span>
                    </div>
                  </div>
                  <Badge className="bg-mint-100 text-mint-700 rounded-full">
                    Próximo
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {event.participants?.length || 0} participantes
                    </span>
                  </div>
                  <Link to={createPageUrl(`EventDetail?id=${event.id}`)}>
                    <Button className="clay-button bg-baby-blue-400 hover:bg-baby-blue-500 text-white rounded-2xl">
                      Ver Detalles
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}