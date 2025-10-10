import React, { useState } from "react";
import { CleanupEvent } from "@/entities/CleanupEvent";
import { User } from "@/entities/User";
import { UploadFile } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload, X, MapPin } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    address: "",
    date: "",
    time: "",
    materials_needed: [],
    donation_goal: "",
    max_participants: ""
  });
  const [currentMaterial, setCurrentMaterial] = useState("");
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addMaterial = () => {
    if (currentMaterial.trim()) {
      setFormData(prev => ({
        ...prev,
        materials_needed: [...prev.materials_needed, currentMaterial.trim()]
      }));
      setCurrentMaterial("");
    }
  };

  const removeMaterial = (index) => {
    setFormData(prev => ({
      ...prev,
      materials_needed: prev.materials_needed.filter((_, i) => i !== index)
    }));
  };

  const handlePhotoUpload = async (files) => {
    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const result = await UploadFile({ file });
        return result.file_url;
      });
      
      const uploadedUrls = await Promise.all(uploadPromises);
      setPhotos(prev => [...prev, ...uploadedUrls]);
    } catch (error) {
      console.error("Error uploading photos:", error);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      const user = await User.me();
      
      // Geocoding simulation - in a real app you'd use a geocoding service
      const coordinates = {
        latitude: 40.4168 + (Math.random() - 0.5) * 0.1,
        longitude: -3.7038 + (Math.random() - 0.5) * 0.1
      };

      await CleanupEvent.create({
        ...formData,
        ...coordinates,
        organizer_photos: photos,
        participants: [user.email],
        donation_goal: parseFloat(formData.donation_goal) || 0,
        max_participants: parseInt(formData.max_participants) || 50,
        donations_received: 0,
        status: "upcoming"
      });

      navigate(createPageUrl("Events"));
    } catch (error) {
      console.error("Error creating event:", error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to={createPageUrl("Events")}>
          <Button variant="outline" size="icon" className="clay-button rounded-2xl">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Crear Evento</h2>
          <p className="text-gray-600">Organiza una jornada de limpieza</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="clay-card p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Información Básica</h3>
          
          <div className="space-y-2">
            <Label htmlFor="title">Título del Evento *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Ej: Limpieza del Parque del Retiro"
              className="rounded-2xl"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe los objetivos y detalles del evento..."
              className="rounded-2xl min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Dirección completa del lugar"
                className="rounded-2xl pl-10"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                className="rounded-2xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Hora *</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange("time", e.target.value)}
                className="rounded-2xl"
                required
              />
            </div>
          </div>
        </div>

        {/* Materials */}
        <div className="clay-card p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Materiales Necesarios</h3>
          
          <div className="flex gap-2">
            <Input
              value={currentMaterial}
              onChange={(e) => setCurrentMaterial(e.target.value)}
              placeholder="Ej: Guantes, bolsas de basura..."
              className="rounded-2xl"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMaterial())}
            />
            <Button 
              type="button" 
              onClick={addMaterial}
              className="clay-button bg-mint-400 hover:bg-mint-500 text-white rounded-2xl"
            >
              Añadir
            </Button>
          </div>

          {formData.materials_needed.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.materials_needed.map((material, index) => (
                <div key={index} className="flex items-center gap-2 bg-mint-100 text-mint-700 px-3 py-1 rounded-full text-sm">
                  <span>{material}</span>
                  <button
                    type="button"
                    onClick={() => removeMaterial(index)}
                    className="hover:bg-mint-200 rounded-full p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Photos */}
        <div className="clay-card p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Fotos del Lugar</h3>
          
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handlePhotoUpload(e.target.files)}
              className="hidden"
              id="photo-upload"
            />
            <label htmlFor="photo-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Haz clic para subir fotos del área a limpiar</p>
              <p className="text-sm text-gray-400 mt-2">PNG, JPG hasta 10MB</p>
            </label>
          </div>

          {photos.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img 
                    src={photo} 
                    alt={`Foto ${index + 1}`}
                    className="w-full h-32 object-cover rounded-2xl clay-card"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Additional Settings */}
        <div className="clay-card p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Configuración Adicional</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="donation_goal">Meta de Donaciones (COP)</Label>
              <Input
                id="donation_goal"
                type="number"
                min="0"
                step="100"
                value={formData.donation_goal}
                onChange={(e) => handleInputChange("donation_goal", e.target.value)}
                placeholder="50000"
                className="rounded-2xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_participants">Máximo Participantes</Label>
              <Input
                id="max_participants"
                type="number"
                min="1"
                value={formData.max_participants}
                onChange={(e) => handleInputChange("max_participants", e.target.value)}
                placeholder="50"
                className="rounded-2xl"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          disabled={creating || uploading}
          className="w-full clay-button bg-lavender-400 hover:bg-lavender-500 text-white rounded-2xl py-3"
        >
          {creating ? "Creando evento..." : "Crear Evento"}
        </Button>
      </form>
    </div>
  );
}