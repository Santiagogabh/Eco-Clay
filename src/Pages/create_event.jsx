import React, { useState, useEffect } from "react";
import { CleanupEvent } from "@/entities/CleanupEvent";
import { User } from "@/entities/User";
import { Participation } from "@/entities/Participation";
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
      let eventData = [];
      try {
        eventData = await CleanupEvent.list('-created_date');
      } catch (err) {
        console.warn("CleanupEvent.list falló, intentando leer de Supabase:", err);
        const { data, error } = await supabase.from("events").select("*").order("created_at", { ascending: false });
        if (!error && data) eventData = data;
      }

      let user = null;
      try { user = await User.me(); } catch (e) { user = null; }

      setEvents(eventData || []);
      setCurrentUser(user);

      if (user) {
        try {
          const participations = await Participation.filter({ user_email: user.email }, '-created_date');
          setMyParticipations(participations || []);
        } catch (err) {
          // fallback: try to read from supabase participations table (optional)
          try {
            const { data } = await supabase.from("participations").select("*").eq("user_email", user.email);
            setMyParticipations(data || []);
          } catch (e) {
            setMyParticipations([]);
          }
        }
      } else {
        setMyParticipations([]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const joinEvent = async (eventId) => {
    try {
      try {
        await Participation.create({
          event_id: eventId,
          user_email: currentUser.email,
          joined_date: new Date().toISOString().split('T')[0]
        });
      } catch (err) {
        await supabase.from("participations").insert([
          { event_id: eventId, user_email: currentUser?.email || "anonymous", joined_date: new Date().toISOString().split('T')[0] }
        ]);
      }
      await loadData();
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

  // --- Create modal handlers ---
  const handleCreateInput = (field, value) => {
    setCreateForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCreatePhoto = async (files) => {
    if (!files || files.length === 0) return;
    setUploadingPhoto(true);
    try {
      const file = files[0];
      const fileName = `${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage.from("event-photos").upload(fileName, file);
      if (error) throw error;

      const { data: publicUrlData } = supabase.storage.from("event-photos").getPublicUrl(fileName);
      setCreatePhotoUrl(publicUrlData.publicUrl);
    } catch (err) {
      console.error("Error subiendo foto:", err);
      alert("Error subiendo la foto. Revisa la consola.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      // fallback to user.me if available
      let userEmail = null;
      try { const u = await User.me(); userEmail = u?.email; } catch(e){ userEmail = null; }

      const payload = {
        title: createForm.title,
        description: createForm.description || null,
        address: createForm.address,
        date: createForm.date,
        time: createForm.time,
        organizer_name: createForm.organizer_name,
        country: createForm.country || null,
        photo_url: createPhotoUrl || null,
        donation_goal: parseFloat(createForm.donation_goal) || 0,
        max_participants: createForm.max_participants ? parseInt(createForm.max_participants) : null,
        participants: userEmail ? [userEmail] : [],
        status: "upcoming",
        created_at: new Date().toISOString()
      };

      console.log("Insert payload:", payload);

      const { error } = await supabase.from("events").insert([payload]);

      if (error) throw error;

      // success
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
      await loadData();
      alert("✅ Evento creado con éxito");
    } catch (err) {
      console.error("Error creando evento:", err);
      alert("❌ Error creando evento. Revisa la consola.");
    } finally {
      setCreating(false);
    }
  };

  // --- Small EventCard (keeps behavior) ---
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
            {event.materials_needed.slice(0, 3).map((m, i) => (
              <Badge key={i} variant="outline" className="rounded-full text-xs">{m}</Badge>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <button onClick={() => openEventDetails(event)} className="px-4 py-2 rounded-xl border border-gray-200">Ver Detalles</button>
        {showJoinButton && (
          <div className="flex gap-2">
            <button onClick={() => joinEvent(event.id)} className="px-4 py-2 rounded-xl bg-green-500 text-white">Unirse</button>
            <Link to={createPageUrl(`Donations?event_id=${event.id}`)}>
              <button className="px-4 py-2 rounded-xl bg-orange-500 text-white">💰 Donar</button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) return <div className="p-6">Cargando...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black">Eventos de Limpieza</h2>
          <p className="text-gray-600">Colabora para limpiar nuestra ciudad.</p>
        </div>

        {/* Native button to ensure onClick works */}
        <div>
          <button
            onClick={() => {
              console.log("Crear evento click -> abrir modal");
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-500 text-white shadow"
            type="button"
          >
            <Plus className="w-4 h-4" />
            Crear evento
          </button>
        </div>
      </div>

      {/* Tabs + lists */}
      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1.5 rounded-2xl">
          <TabsTrigger value="available">Disponibles</TabsTrigger>
          <TabsTrigger value="my-events">Mis Eventos</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4 mt-6">
          {getAvailableEvents().length ? getAvailableEvents().map(ev => <EventCard key={ev.id} event={ev} showJoinButton={true} />)
            : <div className="clay-card p-8 text-center">No hay eventos disponibles</div>}
        </TabsContent>

        <TabsContent value="my-events" className="space-y-4 mt-6">
          {getMyEvents().length ? getMyEvents().map(ev => <EventCard key={ev.id} event={ev} showJoinButton={false} />)
            : <div className="clay-card p-8 text-center">Aún no te has unido a ningún evento</div>}
        </TabsContent>
      </Tabs>

      {/* Details modal (keeps original behavior) */}
      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto clay-card">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="p-4">
              <p>{selectedEvent.description}</p>
              <p className="mt-2 text-sm text-gray-600">{selectedEvent.address}</p>
              <div className="mt-4 space-x-2">
                <button onClick={() => { joinEvent(selectedEvent.id); setShowEventModal(false); }} className="px-4 py-2 bg-green-500 text-white rounded">Unirse</button>
                <Link to={createPageUrl(`Donations?event_id=${selectedEvent.id}`)}>
                  <button className="px-4 py-2 bg-orange-500 text-white rounded">Donar</button>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-[95%] max-w-2xl p-6 relative clay-card">
            <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700" onClick={() => setShowCreateModal(false)}>
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-semibold mb-4">Crear nuevo evento</h3>

            <form onSubmit={handleCreateSubmit} className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre del Evento *</label>
                <input required value={createForm.title} onChange={(e) => handleCreateInput("title", e.target.value)} className="w-full border px-3 py-2 rounded" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <input value={createForm.description} onChange={(e) => handleCreateInput("description", e.target.value)} className="w-full border px-3 py-2 rounded" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Dirección *</label>
                <input required value={createForm.address} onChange={(e) => handleCreateInput("address", e.target.value)} className="w-full border px-3 py-2 rounded" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha *</label>
                  <input type="date" required value={createForm.date} onChange={(e) => handleCreateInput("date", e.target.value)} className="w-full border px-3 py-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hora *</label>
                  <input type="time" required value={createForm.time} onChange={(e) => handleCreateInput("time", e.target.value)} className="w-full border px-3 py-2 rounded" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nombre del Organizador *</label>
                <input required value={createForm.organizer_name} onChange={(e) => handleCreateInput("organizer_name", e.target.value)} className="w-full border px-3 py-2 rounded" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">País</label>
                <input value={createForm.country} onChange={(e) => handleCreateInput("country", e.target.value)} className="w-full border px-3 py-2 rounded" placeholder="Ej: Colombia" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Meta de donaciones (COP)</label>
                  <input type="number" value={createForm.donation_goal} onChange={(e) => handleCreateInput("donation_goal", e.target.value)} className="w-full border px-3 py-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Máximo participantes</label>
                  <input type="number" value={createForm.max_participants} onChange={(e) => handleCreateInput("max_participants", e.target.value)} className="w-full border px-3 py-2 rounded" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Foto del organizador</label>
                <div className="border-2 border-dashed rounded-2xl p-4 text-center">
                  <input id="create-photo" type="file" accept="image/*" className="hidden" onChange={(e) => handleCreatePhoto(e.target.files)} />
                  <label htmlFor="create-photo" className="cursor-pointer flex flex-col items-center">
                    <Upload className="w-6 h-6 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">{uploadingPhoto ? "Subiendo..." : "Subir foto del organizador"}</span>
                  </label>
                </div>
                {createPhotoUrl && <img src={createPhotoUrl} alt="organizer" className="w-full h-40 object-cover rounded-xl mt-2" />}
              </div>

              <div className="flex gap-2 mt-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 border rounded">Cancelar</button>
                <button type="submit" disabled={creating || uploadingPhoto} className="flex-1 px-4 py-2 bg-green-600 text-white rounded">
                  {creating ? "Creando..." : "Guardar Evento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
