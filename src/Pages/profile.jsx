import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Award, Heart, Users, Clock, LogOut, Trash2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [participations, setParticipations] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalHours: 0,
    totalDonations: 0,
    eventsCreated: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Obtener usuario actual
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        navigate("/login");
        return;
      }
      setUser(currentUser);

      // Cargar participaciones
      const { data: participationsData } = await supabase
        .from("participations")
        .select(`
          *,
          events:event_id (*)
        `)
        .eq("user_email", currentUser.email)
        .order("created_at", { ascending: false });

      // Cargar eventos creados por el usuario
      const { data: eventsData } = await supabase
        .from("events")
        .select("*")
        .contains("participants", [currentUser.email])
        .order("created_at", { ascending: false });

      // Cargar donaciones
      const { data: donationsData } = await supabase
        .from("donations")
        .select(`
          *,
          events:event_id (*)
        `)
        .eq("donor_email", currentUser.email)
        .order("created_at", { ascending: false });

      setParticipations(participationsData || []);
      setMyEvents(eventsData || []);
      setDonations(donationsData || []);

      // Calcular estadísticas
      const totalDonated = (donationsData || []).reduce((sum, d) => sum + (d.amount || 0), 0);

      setStats({
        totalEvents: (participationsData || []).length,
        totalHours: (participationsData || []).length * 2, // Estimado
        totalDonations: totalDonated,
        eventsCreated: (eventsData || []).length
      });

    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Error al cerrar sesión");
    }
  };

  const deleteEvent = async (eventId) => {
    if (!confirm("¿Estás seguro de eliminar este evento?")) return;

    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;
      
      alert("✅ Evento eliminado exitosamente");
      loadUserData();
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("❌ Error al eliminar evento");
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, suffix = "" }) => (
    <Card className="clay-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              {value}{suffix}
            </p>
          </div>
          <div className={`p-3 rounded-2xl ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Usuario';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded-2xl w-48 clay-card"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-gray-200 rounded-2xl clay-card"></div>
            <div className="h-24 bg-gray-200 rounded-2xl clay-card"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-center clay-card m-6">
        <h2 className="text-xl font-semibold mb-4">Bienvenido a Mapa Limpio</h2>
        <p className="text-gray-600 mb-6">Inicia sesión para comenzar a participar en eventos de limpieza</p>
        <Button 
          onClick={() => navigate("/login")}
          className="clay-button bg-mint-400 hover:bg-mint-500 text-white rounded-2xl"
        >
          Iniciar Sesión
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Profile Header */}
      <div className="clay-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
              {user.user_metadata?.avatar_url ? (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt="Avatar" 
                  className="w-20 h-20 rounded-full"
                />
              ) : (
                <span className="text-white text-2xl font-bold">
                  {getUserInitials()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800">{getUserDisplayName()}</h2>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex gap-2 mt-2">
                <Badge className="bg-mint-100 text-mint-700 rounded-full">
                  🌱 Eco-Voluntario
                </Badge>
                {user.user_metadata?.provider === 'google' && (
                  <Badge className="bg-blue-100 text-blue-700 rounded-full">
                    Google
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="clay-button rounded-xl border-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Eventos"
          value={stats.totalEvents}
          icon={Calendar}
          color="bg-mint-400"
        />
        <StatCard
          title="Horas"
          value={stats.totalHours}
          icon={Clock}
          color="bg-baby-blue-400"
          suffix="h"
        />
        <StatCard
          title="Donado"
          value={stats.totalDonations.toLocaleString('es-CO')}
          icon={Heart}
          color="bg-coral-400"
        />
        <StatCard
          title="Creados"
          value={stats.eventsCreated}
          icon={Users}
          color="bg-lavender-400"
        />
      </div>

      {/* Achievement Badges */}
      <div className="clay-card p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5" />
          Logros Eco-Friendly
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.totalEvents >= 1 && (
            <div className="bg-mint-100 text-mint-700 p-4 rounded-2xl text-center">
              <div className="text-3xl mb-2">🌱</div>
              <p className="text-sm font-semibold">Primer Paso</p>
            </div>
          )}
          {stats.totalEvents >= 5 && (
            <div className="bg-baby-blue-100 text-baby-blue-700 p-4 rounded-2xl text-center">
              <div className="text-3xl mb-2">🌿</div>
              <p className="text-sm font-semibold">Eco-Guerrero</p>
            </div>
          )}
          {stats.totalHours >= 10 && (
            <div className="bg-lavender-100 text-lavender-700 p-4 rounded-2xl text-center">
              <div className="text-3xl mb-2">⏰</div>
              <p className="text-sm font-semibold">Tiempo Verde</p>
            </div>
          )}
          {stats.totalDonations > 0 && (
            <div className="bg-coral-100 text-coral-700 p-4 rounded-2xl text-center">
              <div className="text-3xl mb-2">💚</div>
              <p className="text-sm font-semibold">Generoso</p>
            </div>
          )}
        </div>
      </div>

      {/* Activity Tabs */}
      <Tabs defaultValue="events" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1.5 rounded-2xl">
          <TabsTrigger value="events" className="rounded-xl">
            Mis Eventos
          </TabsTrigger>
          <TabsTrigger value="donations" className="rounded-xl">
            Mis Donaciones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4 mt-6">
          <h3 className="text-lg font-semibold text-gray-800">Eventos en los que participas</h3>
          {myEvents.length > 0 ? (
            <div className="grid gap-4">
              {myEvents.map((event) => (
                <Card key={event.id} className="clay-card hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-2">{event.title}</h4>
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
                      <div className="flex flex-col gap-2">
                        <Badge className={`rounded-full ${
                          event.status === 'upcoming' ? 'bg-mint-100 text-mint-700' :
                          event.status === 'active' ? 'bg-baby-blue-100 text-baby-blue-700' :
                          'bg-lavender-100 text-lavender-700'
                        }`}>
                          {event.status === 'upcoming' ? 'Próximo' : 
                           event.status === 'active' ? 'Activo' : 'Completado'}
                        </Badge>
                        {event.participants?.[0] === user.email && (
                          <Button
                            onClick={() => deleteEvent(event.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50 rounded-xl"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="clay-card p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Aún no has participado en ningún evento</p>
              <Button 
                onClick={() => navigate("/events")}
                className="bg-mint-500 hover:bg-mint-600 text-white rounded-xl"
              >
                Ver Eventos Disponibles
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="donations" className="space-y-4 mt-6">
          <h3 className="text-lg font-semibold text-gray-800">Historial de donaciones</h3>
          {donations.length > 0 ? (
            <div className="space-y-4">
              {donations.map((donation) => (
                <Card key={donation.id} className="clay-card">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Heart className="w-5 h-5 text-coral-500" />
                          <p className="font-semibold text-gray-800">
                            ${donation.amount?.toLocaleString('es-CO')} COP
                          </p>
                        </div>
                        {donation.events && (
                          <p className="text-sm text-gray-600 mb-1">
                            Evento: {donation.events.title}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {new Date(donation.created_at).toLocaleDateString('es-CO')}
                        </p>
                        {donation.message && (
                          <p className="text-sm text-gray-600 mt-2 italic">
                            "{donation.message}"
                          </p>
                        )}
                      </div>
                      <Badge className="bg-green-100 text-green-700 rounded-full">
                        ✓ Completado
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="clay-card p-8 text-center">
              <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Aún no has realizado donaciones</p>
              <Button 
                onClick={() => navigate("/donations")}
                className="bg-coral-500 hover:bg-coral-600 text-white rounded-xl"
              >
                Ver Eventos para Donar
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}