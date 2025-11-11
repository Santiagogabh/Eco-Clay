import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, CreditCard, Smartphone, Building, Check, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function DonationsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [donationMessage, setDonationMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("nequi");
  const [currentUser, setCurrentUser] = useState(null);
  const [myDonations, setMyDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
    
    // Check for event_id in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('event_id');
    if (eventId) {
      loadEventForDonation(eventId);
    }
  }, []);

  const loadData = async () => {
    try {
      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      // Cargar eventos con meta de donaciones
      const { data: eventsData } = await supabase
        .from("events")
        .select("*")
        .gt("donation_goal", 0)
        .order("created_at", { ascending: false });

      setEvents(eventsData || []);
      
      // Cargar donaciones del usuario
      if (user) {
        const { data: donationsData } = await supabase
          .from("donations")
          .select(`
            *,
            events:event_id (
              title,
              address
            )
          `)
          .eq("donor_email", user.email)
          .order("created_at", { ascending: false });

        setMyDonations(donationsData || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadEventForDonation = async (eventId) => {
    try {
      const { data: event } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (event && event.donation_goal > 0) {
        setSelectedEvent(event);
      }
    } catch (error) {
      console.error("Error loading event:", error);
    }
  };

  const handleDonation = async () => {
    if (!selectedEvent || !donationAmount || !currentUser) {
      alert("⚠️ Por favor completa todos los campos");
      return;
    }
    
    setProcessing(true);
    
    try {
      const amount = parseFloat(donationAmount);
      
      if (amount < 1000) {
        alert("⚠️ El monto mínimo de donación es $1.000 COP");
        setProcessing(false);
        return;
      }

      // Simular procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Crear registro de donación
      const { error: donationError } = await supabase
        .from("donations")
        .insert([{
          event_id: selectedEvent.id,
          donor_email: currentUser.email,
          donor_name: currentUser.user_metadata?.full_name || currentUser.email.split('@')[0],
          amount: amount,
          message: donationMessage || null,
          payment_method: paymentMethod,
          status: 'completed'
        }]);

      if (donationError) throw donationError;

      // Actualizar el total de donaciones del evento
      const newTotal = (selectedEvent.donations_received || 0) + amount;
      const { error: updateError } = await supabase
        .from("events")
        .update({ donations_received: newTotal })
        .eq("id", selectedEvent.id);

      if (updateError) throw updateError;

      // Reset form y recargar datos
      setDonationAmount("");
      setDonationMessage("");
      setSelectedEvent(null);
      await loadData();
      
      alert(`✅ ¡Gracias por tu donación de $${amount.toLocaleString('es-CO')} COP!`);
    } catch (error) {
      console.error("Error processing donation:", error);
      alert("❌ Error al procesar la donación. Por favor intenta de nuevo.");
    } finally {
      setProcessing(false);
    }
  };

  const EventDonationCard = ({ event }) => {
    const progress = event.donation_goal > 0 ? ((event.donations_received || 0) / event.donation_goal) * 100 : 0;
    
    return (
      <Card className="clay-card cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedEvent(event)}>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800">{event.title}</h3>
              <p className="text-sm text-gray-600">{event.address}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Recaudado</span>
                <span className="font-medium">
                  ${(event.donations_received || 0).toLocaleString('es-CO')} / ${event.donation_goal.toLocaleString('es-CO')} COP
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-coral-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">{Math.round(progress)}% de la meta</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded-2xl w-48 clay-card"></div>
          <div className="h-32 bg-gray-200 rounded-2xl clay-card"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        {selectedEvent && (
          <Button 
            variant="outline" 
            size="icon" 
            className="clay-button rounded-2xl"
            onClick={() => setSelectedEvent(null)}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        )}
        <div>
          <h2 className="text-3xl font-black text-gray-800">
            {selectedEvent ? 'Hacer Donación' : 'Donaciones'}
          </h2>
          <p className="text-gray-600">
            {selectedEvent ? 'Apoya este evento de limpieza' : 'Apoya los eventos de limpieza de la ciudad'}
          </p>
        </div>
      </div>

      {selectedEvent ? (
        /* Donation Form */
        <div className="space-y-6">
          {/* Event Info */}
          <Card className="clay-card">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-coral-100 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-coral-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-2">{selectedEvent.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{selectedEvent.address}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Meta de donaciones</span>
                      <span className="font-medium">${selectedEvent.donation_goal.toLocaleString('es-CO')} COP</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Recaudado</span>
                      <span className="font-medium">${(selectedEvent.donations_received || 0).toLocaleString('es-CO')} COP</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Donation Form */}
          <Card className="clay-card">
            <CardHeader>
              <CardTitle>Realizar Donación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Cantidad a donar (COP) *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1000"
                  step="1000"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  placeholder="50000"
                  className="rounded-2xl"
                />
                <div className="flex gap-2 mt-2 flex-wrap">
                  {[10000, 25000, 50000, 100000].map(amount => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      className="rounded-2xl"
                      onClick={() => setDonationAmount(amount.toString())}
                    >
                      ${amount.toLocaleString('es-CO')}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-3">
                <Label>Método de pago</Label>
                <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
                  <TabsList className="grid grid-cols-3 bg-gray-100 p-1 rounded-2xl">
                    <TabsTrigger value="nequi" className="rounded-xl">
                      <Smartphone className="w-4 h-4 mr-2" />
                      Nequi
                    </TabsTrigger>
                    <TabsTrigger value="bank" className="rounded-xl">
                      <Building className="w-4 h-4 mr-2" />
                      Banco
                    </TabsTrigger>
                    <TabsTrigger value="card" className="rounded-xl">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Tarjeta
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="nequi" className="mt-4">
                    <div className="clay-card p-4 text-center">
                      <Smartphone className="w-12 h-12 text-purple-500 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 mb-2">
                        Serás redirigido a Nequi para completar el pago
                      </p>
                      <p className="text-xs text-gray-500">
                        Necesitarás tu número de teléfono y clave Nequi
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="bank" className="mt-4">
                    <div className="clay-card p-4 text-center">
                      <Building className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 mb-2">
                        Transferencia bancaria a través de PSE
                      </p>
                      <p className="text-xs text-gray-500">
                        Compatible con todos los bancos en Colombia
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="card" className="mt-4">
                    <div className="clay-card p-4 text-center">
                      <CreditCard className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 mb-2">
                        Pago con tarjeta de crédito o débito
                      </p>
                      <p className="text-xs text-gray-500">
                        Visa, Mastercard, American Express
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Mensaje opcional</Label>
                <Textarea
                  id="message"
                  value={donationMessage}
                  onChange={(e) => setDonationMessage(e.target.value)}
                  placeholder="Escribe un mensaje de apoyo..."
                  className="rounded-2xl"
                  rows={3}
                />
              </div>

              {/* Donate Button */}
              <Button
                onClick={handleDonation}
                disabled={!donationAmount || processing || !currentUser}
                className="w-full clay-button bg-coral-400 hover:bg-coral-500 text-white rounded-2xl py-3"
              >
                {processing ? "Procesando..." : `Donar $${donationAmount ? parseFloat(donationAmount).toLocaleString('es-CO') : '0'} COP`}
              </Button>

              {!currentUser && (
                <p className="text-sm text-center text-red-600">
                  Debes iniciar sesión para hacer una donación
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Events List and Donations History */
        <Tabs defaultValue="events" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1.5 rounded-2xl">
            <TabsTrigger value="events" className="rounded-xl">
              Eventos
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-xl">
              Mis Donaciones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-4 mt-6">
            {events.length > 0 ? (
              <div className="grid gap-4">
                {events.map(event => (
                  <EventDonationCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="clay-card p-8 text-center">
                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No hay eventos que necesiten donaciones</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-6">
            {myDonations.length > 0 ? (
              <div className="space-y-4">
                {myDonations.map(donation => (
                  <Card key={donation.id} className="clay-card">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Heart className="w-5 h-5 text-coral-500" />
                            <p className="font-semibold text-gray-800">
                              ${donation.amount.toLocaleString('es-CO')} COP
                            </p>
                          </div>
                          {donation.events && (
                            <p className="text-sm text-gray-600 mb-1">
                              {donation.events.title}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            {new Date(donation.created_at).toLocaleDateString('es-CO', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          {donation.message && (
                            <p className="text-sm text-gray-600 mt-2 italic">
                              "{donation.message}"
                            </p>
                          )}
                        </div>
                        <Check className="w-5 h-5 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="clay-card p-8 text-center">
                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aún no has realizado donaciones</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}