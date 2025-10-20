// src/lib/supabase/client.ts

import { createClient } from '@supabase/supabase-js';

// Asegúrate de que tienes estas variables en tu archivo .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Verifica que las variables de entorno existan
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Las variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY deben estar definidas.');
}

// Inicializa el cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  // Opciones opcionales, como esquema de la base de datos
  db: {
    schema: 'public',
  },
});