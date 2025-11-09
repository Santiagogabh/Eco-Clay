import React, { useState, useEffect } from "react";
import { CleanupEvent } from "@/entities/CleanupEvent";
import { User } from "@/entities/User";
import { Participation } from "@/entities/Participation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Calendar, Users, Plus, Heart, X, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { supabase } from "@/integrations/supabase/client";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [myParticipations, setMyParticipations] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [createPhotoUrl, setCreatePhotoUrl] = useState("");

  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    address: "",
    date: "",
    time: "",
    organizer_name: "",
    country: "",
    donation_goal: "",
    max_participants: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // PRIORIDAD: Cargar eventos directamente desde Supabase
      console.log("🔄 Cargando eventos desde Supabase...");
      const { data: eventData, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });

      if (eventsError) {
        console.error("❌ Error cargando eventos:", eventsError);
      } else {
        console.log("✅ Eventos cargados:", eventData?.length || 0);
        setEvents(eventData || []);
      }

      // Obtener usuario actual
      let user = null;
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          user = { email: authUser.email, id: authUser.id };
          console.log("✅ Usuario actual:", user.email);
        } else {
          console.log("⚠️ No hay usuario autenticado");
        }
      } catch (e) {
        console.warn("⚠️ Error obteniendo usuario:", e);
      }

      setCurrentUser(user);

      // Cargar participaciones del usuario
      if (user && user.email) {
        try {
          const { data: participationsData, error: participationsError } = await supabase
            .from("participations")
            .select("*")
            .eq("user_email", user.email);

          if (!participationsError && participationsData) {
            console.log("✅ Participaciones cargadas:", participationsData.length);
            setMyParticipations(participationsData);
          } else {
            console.log("⚠️ No hay participaciones o error:", participationsError);
            setMyParticipations([]);
          }
        } catch (e) {
          console.error("❌ Error cargando participaciones:", e);
          setMyParticipations([]);
        }
      } else {
        setMyParticipations([]);
      }
    } catch (error) {
      console.error("❌ Error general en loadData:", error);
    } finally {
      setLoading(false);
    }
  };

  const joinEvent = async (eventId) => {
    if (!currentUser || !currentUser.email) {
      alert("⚠️ Debes iniciar sesión para unirte a un evento");
      return;
    }

    try {
      // Try using Participation entity first
      try {
        await Participation.create({
          event_id: eventId,
          user_email: currentUser.email,
          joined_date: new Date().toISOString().split('T')[0]
        });
      } catch (err) {
        // Fallback to direct Supabase insert
        const { error } = await supabase
          .from("participations")
          .insert([
            {
              event_id: eventId,
              user_email: currentUser.email,
              joined_date: new Date().toISOString().split('T')[0]
            }
          ]);
        if (error) throw error;
      }
      
      await loadData();
      alert("✅ Te has unido al evento exitosamente");
    } catch (error) {
      console.error("Error joining event:", error);
      alert("❌ Error al unirse al evento. Por favor intenta de nuevo.");
    }
  };

  const getMyEvents = () => {
    const myEventIds = myParticipations.map(p => p.event_id);
    return events.filter(event => myEventIds.includes(event.id));
  };

  const getAvailableEvents = () => {
    const myEventIds = myParticipations.map(p => p.event_id);
    // Filtrar eventos que no son míos y están activos/próximos
    const available = events.filter(event => {
      const isNotMine = !myEventIds.includes(event.id);
      const isUpcoming = event.status === 'upcoming' || !event.status; // Si no tiene status, asumimos upcoming
      return isNotMine && isUpcoming;
    });
    console.log("📋 Eventos disponibles:", available.length);
    return available;
  };

  const openEventDetails = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  // Create modal handlers
  const handleCreateInput = (field, value) => {
    setCreateForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCreatePhoto = async (files) => {
    if (!files || files.length === 0) return;
    
    setUploadingPhoto(true);
    try {
      const file = files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from("event-photos")
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from("event-photos")
        .getPublicUrl(fileName);
        
      setCreatePhotoUrl(publicUrlData.publicUrl);
    } catch (err) {
      console.error("Error uploading photo:", err);
      alert("❌ Error subiendo la foto. Verifica que el bucket 'event-photos' exista en Supabase.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    
    try {
      // Get user email
      let userEmail = currentUser?.email;
      if (!userEmail) {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        userEmail = authUser?.email || "anonymous";
      }

      const payload = {
        title: createForm.title.trim(),
        description: createForm.description.trim() || null,
        address: createForm.address.trim(),
        date: createForm.date,
        time: createForm.time,
        organizer_name: createForm.organizer_name.trim(),
        country: createForm.country.trim() || null,
        organizer_photos: createPhotoUrl ? [createPhotoUrl] : [],
        donation_goal: createForm.donation_goal ? parseFloat(createForm.donation_goal) : 0,
        donations_received: 0,
        max_participants: createForm.max_participants ? parseInt(createForm.max_participants) : null,
        participants: [userEmail],
        status: "upcoming",
        materials_needed: [],
        created_at: new Date().toISOString()
      };

      console.log("Creating event with payload:", payload);

      const { data, error } = await supabase
        .from("events")
        .insert([payload])
        .select();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Event created successfully:", data);

      // Reset form and close modal
      setShowCreateModal(false);
      setCreateForm({
        title: "",
        description: "",
        address: "",
        date: "",
        time: "",
        organizer_name: "",
        country: "",
        donation_goal: "",
        max_participants: ""
      });
      setCreatePhotoUrl("");
      
      // Reload data
      await loadData();
      
      alert("✅ Evento creado con éxito");
    } catch (err) {
      console.error("Error creating event:", err);
      alert(`❌ Error creando evento: ${err.message || 'Error desconocido'}`);
    } finally {
      setCreating(false);
    }
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
          <div className="flex gap-2">
            <Button 
              onClick={() => joinEvent(event.id)}
              className="clay-button bg-mint-400 hover:bg-mint-500 text-white rounded-2xl"
            >
              <Heart className="w-4 h-4 mr-2" />
              Unirse
            </Button>
            {event.donation_goal > 0 && (
              <Link to={createPageUrl(`Donations?event_id=${event.id}`)}>
                <Button className="clay-button bg-coral-400 hover:bg-coral-500 text-white rounded-2xl">
                  💰 Donar
                </Button>
              </Link>
            )}
          </div>
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

  // Debug logs
  console.log("🎯 Estado actual:");
  console.log("- Total eventos:", events.length);
  console.log("- Eventos disponibles:", getAvailableEvents().length);
  console.log("- Mis eventos:", getMyEvents().length);
  console.log("- Usuario actual:", currentUser?.email || "No autenticado");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black">Eventos de Limpieza</h2>
          <p className="text-gray-600">Colabora para limpiar nuestra ciudad.</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="clay-button bg-lavender-400 hover:bg-lavender-500 text-black rounded-2xl shadow-lg shadow-lavender-300/50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Crear evento
        </Button>
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
                          ${(selectedEvent.donations_received || 0).toLocaleString('es-CO')} / ${selectedEvent.donation_goal.toLocaleString('es-CO')} COP
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

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 relative clay-card max-h-[90vh] overflow-y-auto">
            <button 
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10" 
              onClick={() => setShowCreateModal(false)}
              type="button"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-semibold mb-4">Crear nuevo evento</h3>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre del Evento *</label>
                <input 
                  required 
                  value={createForm.title} 
                  onChange={(e) => handleCreateInput("title", e.target.value)} 
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender-400"
                  placeholder="Ej: Limpieza Parque Central"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea 
                  value={createForm.description} 
                  onChange={(e) => handleCreateInput("description", e.target.value)} 
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender-400"
                  rows="3"
                  placeholder="Describe el evento..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Dirección *</label>
                <input 
                  required 
                  value={createForm.address} 
                  onChange={(e) => handleCreateInput("address", e.target.value)} 
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender-400"
                  placeholder="Ej: Calle 123 #45-67"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha *</label>
                  <input 
                    type="date" 
                    required 
                    value={createForm.date} 
                    onChange={(e) => handleCreateInput("date", e.target.value)} 
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hora *</label>
                  <input 
                    type="time" 
                    required 
                    value={createForm.time} 
                    onChange={(e) => handleCreateInput("time", e.target.value)} 
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nombre del Organizador *</label>
                <input 
                  required 
                  value={createForm.organizer_name} 
                  onChange={(e) => handleCreateInput("organizer_name", e.target.value)} 
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender-400"
                  placeholder="Tu nombre"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">País</label>
                <input 
                  value={createForm.country} 
                  onChange={(e) => handleCreateInput("country", e.target.value)} 
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender-400"
                  placeholder="Ej: Colombia"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Meta de donaciones (COP)</label>
                  <input 
                    type="number" 
                    value={createForm.donation_goal} 
                    onChange={(e) => handleCreateInput("donation_goal", e.target.value)} 
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender-400"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Máximo participantes</label>
                  <input 
                    type="number" 
                    value={createForm.max_participants} 
                    onChange={(e) => handleCreateInput("max_participants", e.target.value)} 
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender-400"
                    placeholder="Sin límite"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Foto del lugar</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-lavender-400 transition-colors">
                  <input 
                    id="create-photo" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handleCreatePhoto(e.target.files)} 
                  />
                  <label htmlFor="create-photo" className="cursor-pointer flex flex-col items-center">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      {uploadingPhoto ? "Subiendo..." : "Haz clic para subir una foto"}
                    </span>
                  </label>
                </div>
                {createPhotoUrl && (
                  <div className="mt-3">
                    <img 
                      src={createPhotoUrl} 
                      alt="Vista previa" 
                      className="w-full h-40 object-cover rounded-xl clay-card" 
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)} 
                  variant="outline"
                  className="flex-1 rounded-xl"
                  disabled={creating || uploadingPhoto}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={creating || uploadingPhoto} 
                  className="flex-1 bg-mint-500 hover:bg-mint-600 text-white rounded-xl"
                >
                  {creating ? "Creando..." : "Crear Evento"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}