// src/lib/supabase/client-new.ts
'use client'; // Opcional, pero ayuda a indicar que es para el cliente

import { createBrowserClient } from '@supabase/ssr';

// Define el tipo para las variables de entorno para mayor seguridad
type SupabaseEnv = {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
};

// Obtenemos las variables de entorno
const supabaseEnv: SupabaseEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
};

// Creamos un cliente singleton para el navegador
export const supabase = createBrowserClient(
  supabaseEnv.NEXT_PUBLIC_SUPABASE_URL,
  supabaseEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
