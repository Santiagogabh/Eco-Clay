// src/integrations/supabase/client.js
import { createClient } from "@supabase/supabase-js";

// Estas variables deben estar definidas en tu entorno (.env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validación simple para evitar errores en producción
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ Variables de entorno de Supabase faltantes. Asegúrate de tener VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY definidas.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
