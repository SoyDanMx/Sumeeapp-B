// src/lib/supabase/client.ts

import { createClient } from '@supabase/supabase-js';

// Asegúrate de que tienes estas variables en tu archivo .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Verifica que las variables de entorno existan
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Las variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY deben estar definidas.');
}

import { getRedirectUrl, getEmailConfirmationUrl } from '@/lib/utils';

// Inicializa el cliente Supabase con configuración PKCE específica para resolver el error
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // CONFIGURACIÓN PKCE ESPECÍFICA PARA RESOLVER EL ERROR
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Configuraciones de almacenamiento específicas para PKCE
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'sb-auth-token',
    // Configuración de debug para desarrollo
    debug: process.env.NODE_ENV === 'development',
    // SOLUCIÓN CLAVE: Redirección dinámica que se adapta al entorno
    redirectTo: getRedirectUrl('/auth/callback'),
    // Configuraciones adicionales para PKCE
    ...(typeof window !== 'undefined' && {
      // Forzar regeneración de code_verifier si es necesario
      refreshToken: true,
      // Configuración específica para el navegador
      browser: {
        localStorage: window.localStorage,
        sessionStorage: window.sessionStorage
      }
    })
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'sumee-app',
      'X-Requested-With': 'XMLHttpRequest',
      // Headers adicionales para PKCE
      'X-PKCE-Flow': 'enabled'
    }
  }
});

// Re-exportar funciones helper para compatibilidad
export { getRedirectUrl, getEmailConfirmationUrl };