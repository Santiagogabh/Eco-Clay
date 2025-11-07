import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function CreateEventPage() {
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    address: "",
    date: "",
    time: "",
    organizer_name: "",
    country: "",
    donation_goal: "",
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = async (files) => {
    setUploading(true);
    try {
      const file = files[0];
      const fileName = `${Date.now()}_${file.name}`;
      const { error } = await supabase.storage
        .from("event-photos")
        .upload(fileName, file);

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from("event-photos")
        .getPublicUrl(fileName);

      setPhotoUrl(publicUrlData.publicUrl);
    } catch (error) {
      console.error("Error subiendo la foto:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      const { error } = await supabase.from("events").insert([
        {
          title: formData.title,
          address: formData.address,
          date: formData.date,
          time: formData.time,
          organizer_name: formData.organizer_name,
          country: formData.country,
          donation_goal: parseFloat(formData.donation_goal) || 0,
          photo_url: photoUrl,
        },
      ]);

      if (error) throw error;

      alert("✅ Evento creado con éxito");
      setShowModal(false);
      setFormData({
        title: "",
        address: "",
        date: "",
        time: "",
        organizer_name: "",
        country: "",
        donation_goal: "",
      });
      setPhotoUrl("");
    } catch (error) {
      console.error("Error creando el evento:", error);
      alert("❌ Error creando el evento");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <Button
        onClick={() => setShowModal(true)}
        className="bg-lavender-500 hover:bg-lavender-600 text-white rounded-2xl px-6 py-3"
      >
        Crear Evento
      </Button>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">Detalles del Evento</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nombre del Evento *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Ej: Limpieza del Parque"
                  required
                />
              </div>

              <div>
                <Label>Dirección *</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Dirección completa"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Fecha *</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Hora *</Label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange("time", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Nombre del Organizador *</Label>
                <Input
                  value={formData.organizer_name}
                  onChange={(e) => handleInputChange("organizer_name", e.target.value)}
                  placeholder="Tu nombre"
                  required
                />
              </div>

              <div>
                <Label>País *</Label>
                <Input
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  placeholder="Ej: Colombia"
                  required
                />
              </div>

              <div>
                <Label>Meta de Donaciones (COP)</Label>
                <Input
                  type="number"
                  min="0"
                  step="100"
                  value={formData.donation_goal}
                  onChange={(e) => handleInputChange("donation_goal", e.target.value)}
                  placeholder="Ej: 100000"
                />
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePhotoUpload(e.target.files)}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {uploading ? "Subiendo..." : "Subir foto del organizador"}
                  </p>
                </label>
              </div>

              {photoUrl && (
                <img
                  src={photoUrl}
                  alt="Foto del organizador"
                  className="w-full h-40 object-cover rounded-2xl"
                />
              )}

              <Button
                type="submit"
                disabled={creating || uploading}
                className="w-full bg-mint-500 hover:bg-mint-600 text-white rounded-2xl mt-4"
              >
                {creating ? "Creando evento..." : "Guardar Evento"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
