import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log("IMPORTMETA env url:", supabaseUrl)
console.log("IMPORTMETA env anon:", supabaseAnonKey)

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Variables de entorno de Supabase faltantes.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

