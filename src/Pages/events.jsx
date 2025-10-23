import React, { useState, useEffect } from "react";
import { CleanupEvent } from "@/entities/CleanupEvent";
import { User } from "@/entities/User";
import { Participation } from "@/entities/Participation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Calendar, Users, Plus, Heart, X, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [myParticipations, setMyParticipations] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [eventData, user] = await Promise.all([
        CleanupEvent.list('-created_date'),
        User.me()
      ]);
      
      setEvents(eventData);
      setCurrentUser(user);
      
      if (user) {
        const participations = await Participation.filter(
          { user_email: user.email },
          '-created_date'
        );
        setMyParticipations(participations);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const joinEvent = async (eventId) => {
    try {
      await Participation.create({
        event_id: eventId,
        user_email: currentUser.email,
        joined_date: new Date().toISOString().split('T')[0]
      });
      loadData();
    } catch (error) {
      console.error("Error joining event:", error);
    }
  };

  const getMyEvents = () => {
    const myEventIds = myParticipations.map(p => p.event_id);
    return events.filter(event => myEventIds.includes(event.id));
  };

  const getAvailableEvents = () => {
    const myEventIds = myParticipations.map(p => p.event_id);
    return events.filter(event => !myEventIds.includes(event.id) && event.status === 'upcoming');
  };

  const openEventDetails = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const EventCard = ({ event, showJoinButton = false }) => (
    <div className="clay-card p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 mb-2">{event.title}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{event.address}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{event.date} a las {event.time}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{event.participants?.length || 0} participantes</span>
            </div>
          </div>
        </div>
        
        <Badge className={`rounded-full ${
          event.status === 'upcoming' ? 'bg-mint-100 text-mint-700' :
          event.status === 'active' ? 'bg-baby-blue-100 text-baby-blue-700' :
          'bg-lavender-100 text-lavender-700'
        }`}>
          {event.status === 'upcoming' ? 'Próximo' : 
           event.status === 'active' ? 'Activo' : 'Completado'}
        </Badge>
      </div>

      {event.materials_needed && event.materials_needed.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Materiales necesarios:</p>
          <div className="flex flex-wrap gap-2">
            {event.materials_needed.slice(0, 3).map((material, index) => (
              <Badge key={index} variant="outline" className="rounded-full text-xs">
                {material}
              </Badge>
            ))}
            {event.materials_needed.length > 3 && (
              <Badge variant="outline" className="rounded-full text-xs">
                +{event.materials_needed.length - 3} más
              </Badge>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <Button 
          variant="outline" 
          className="clay-button rounded-2xl"
          onClick={() => openEventDetails(event)}
        >
          Ver Detalles
        </Button>
        {showJoinButton && (
          <Button 
            onClick={() => joinEvent(event.id)}
            className="clay-button bg-mint-400 hover:bg-mint-500 text-white rounded-2xl"
          >
            <Heart className="w-4 h-4 mr-2" />
            Unirse
          </Button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded-2xl w-48 clay-card"></div>
          <div className="h-32 bg-gray-200 rounded-2xl clay-card"></div>
          <div className="h-32 bg-gray-200 rounded-2xl clay-card"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black">Eventos de Limpieza</h2>
          <p className="text-gray-600">Colabora para limpiar nuestra ciudad.</p>
        </div>
        <Link to={createPageUrl("CreateEvent")}>
          <Button className="clay-button bg-lavender-400 hover:bg-lavender-500 text-black rounded-2xl shadow-lg shadow-lavender-300/50">
            <Plus className="w-4 h-4 mr-2" />
            Crear evento
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1.5 rounded-2xl" style={{boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'}}>
          <TabsTrigger value="available" className="rounded-[14px] text-gray-500 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-mint-500 data-[state=active]:font-semibold data-[state=active]:shadow-sm transition-all duration-200">
            Disponibles
          </TabsTrigger>
          <TabsTrigger value="my-events" className="rounded-[14px] text-gray-500 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-lavender-500 data-[state=active]:font-semibold data-[state=active]:shadow-sm transition-all duration-200">
            Mis Eventos
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="available" className="space-y-4 mt-6">
          {getAvailableEvents().length > 0 ? (
            getAvailableEvents().map((event) => (
              <EventCard key={event.id} event={event} showJoinButton={true} />
            ))
          ) : (
            <div className="clay-card p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay eventos disponibles en este momento</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="my-events" className="space-y-4 mt-6">
          {getMyEvents().length > 0 ? (
            getMyEvents().map((event) => (
              <EventCard key={event.id} event={event} showJoinButton={false} />
            ))
          ) : (
            <div className="clay-card p-8 text-center">
              <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aún no te has unido a ningún evento</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Event Details Modal */}
      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto clay-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800 pr-8">
              {selectedEvent?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-6">
              {/* Event Images */}
              {selectedEvent.organizer_photos && selectedEvent.organizer_photos.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700">Fotos del lugar</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedEvent.organizer_photos.map((photo, index) => (
                      <img 
                        key={index}
                        src={photo} 
                        alt={`Foto del evento ${index + 1}`}
                        className="w-full h-32 object-cover rounded-xl clay-card"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedEvent.description && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-700">Descripción</h4>
                  <p className="text-gray-600">{selectedEvent.description}</p>
                </div>
              )}

              {/* Event Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-mint-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Ubicación</p>
                      <p className="text-sm text-gray-600">{selectedEvent.address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-baby-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Fecha y hora</p>
                      <p className="text-sm text-gray-600">{selectedEvent.date} a las {selectedEvent.time}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-lavender-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Participantes</p>
                      <p className="text-sm text-gray-600">
                        {selectedEvent.participants?.length || 0} 
                        {selectedEvent.max_participants && ` / ${selectedEvent.max_participants}`} personas
                      </p>
                    </div>
                  </div>

                  {selectedEvent.donation_goal > 0 && (
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-coral-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Meta de donaciones</p>
                        <p className="text-sm text-gray-600">
                          ${(selectedEvent.donations_received || 0).toLocaleString('es-CO')} COP / ${selectedEvent.donation_goal.toLocaleString('es-CO')} COP
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Materials Needed */}
              {selectedEvent.materials_needed && selectedEvent.materials_needed.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700">Materiales necesarios</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.materials_needed.map((material, index) => (
                      <Badge key={index} className="bg-mint-100 text-mint-700 rounded-full">
                        {material}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                {!myParticipations.find(p => p.event_id === selectedEvent.id) && selectedEvent.status === 'upcoming' && (
                  <Button 
                    onClick={() => {
                      joinEvent(selectedEvent.id);
                      setShowEventModal(false);
                    }}
                    className="clay-button bg-mint-400 hover:bg-mint-500 text-white rounded-2xl flex-1"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Unirse al evento
                  </Button>
                )}
                {selectedEvent.donation_goal > 0 && (
                  <Link to={createPageUrl(`Donations?event_id=${selectedEvent.id}`)} className="flex-1">
                    <Button className="clay-button bg-coral-400 hover:bg-coral-500 text-white rounded-2xl w-full">
                      💰 Donar
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}