
import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Participation } from "@/entities/Participation";
import { CleanupEvent } from "@/entities/CleanupEvent";
import { Donation } from "@/entities/Donation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Award, Heart, Users, Clock } from "lucide-react";

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

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const [userParticipations, userEvents, userDonations] = await Promise.all([
        Participation.filter({ user_email: currentUser.email }, '-created_date'),
        CleanupEvent.filter({ created_by: currentUser.email }, '-created_date'),
        Donation.filter({ donor_email: currentUser.email }, '-created_date')
      ]);

      setParticipations(userParticipations);
      setMyEvents(userEvents);
      setDonations(userDonations);

      // Calculate stats
      const totalHours = userParticipations.reduce((sum, p) => sum + (p.hours_contributed || 0), 0);
      const totalDonated = userDonations.reduce((sum, d) => sum + d.amount, 0);

      setStats({
        totalEvents: userParticipations.length,
        totalHours,
        totalDonations: totalDonated,
        eventsCreated: userEvents.length
      });

    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await User.logout();
    } catch (error) {
      console.error("Error logging out:", error);
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
        <h2 className="text-xl font-semibold mb-4">Bienvenido a EcoClean</h2>
        <p className="text-gray-600 mb-6">Inicia sesión para comenzar a participar en eventos de limpieza</p>
        <Button 
          onClick={() => User.login()}
          className="clay-button bg-mint-400 hover:bg-mint-500 text-white rounded-2xl"
        >
          Iniciar Sesión con Google
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Profile Header */}
      <div className="clay-card p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-mint-400 to-baby-blue-400 flex items-center justify-center">
            <span className="text-white text-xl font-bold">
              {user.full_name?.charAt(0) || user.email.charAt(0)}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800">{user.full_name || 'Usuario'}</h2>
            <p className="text-gray-600">{user.email}</p>
            <Badge className="mt-2 bg-mint-100 text-mint-700 rounded-full">
              Eco-Voluntario
            </Badge>
          </div>
        </div>
        
        <Button 
          onClick={handleLogout}
          variant="outline"
          className="clay-button rounded-2xl"
        >
          Cerrar Sesión
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          title="Eventos Participados"
          value={stats.totalEvents}
          icon={Calendar}
          color="bg-mint-400"
        />
        <StatCard
          title="Horas Contribuidas"
          value={stats.totalHours}
          icon={Clock}
          color="bg-baby-blue-400"
        />
        <StatCard
          title="Total Donado"
          value={stats.totalDonations.toLocaleString('es-CO')}
          icon={Heart}
          color="bg-coral-400"
          suffix=" COP"
        />
        <StatCard
          title="Eventos Creados"
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
        <div className="grid grid-cols-2 gap-3">
          {stats.totalEvents >= 1 && (
            <Badge className="bg-mint-100 text-mint-700 p-3 rounded-2xl text-center">
              🌱 Primer Paso
            </Badge>
          )}
          {stats.totalEvents >= 5 && (
            <Badge className="bg-baby-blue-100 text-baby-blue-700 p-3 rounded-2xl text-center">
              🌿 Eco-Guerrero
            </Badge>
          )}
          {stats.totalHours >= 10 && (
            <Badge className="bg-lavender-100 text-lavender-700 p-3 rounded-2xl text-center">
              ⏰ Tiempo Verde
            </Badge>
          )}
          {stats.totalDonations > 0 && (
            <Badge className="bg-coral-100 text-coral-700 p-3 rounded-2xl text-center">
              💚 Corazón Generoso
            </Badge>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="clay-card p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Actividad Reciente</h3>
        <div className="space-y-3">
          {participations.slice(0, 3).map((participation, index) => (
            <div key={participation.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Te uniste a un evento</p>
                <p className="text-xs text-gray-500">{participation.joined_date}</p>
              </div>
            </div>
          ))}
          {participations.length === 0 && (
            <p className="text-gray-500 text-center py-4">
              Aún no has participado en ningún evento
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
