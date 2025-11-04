// src/lib/supabase/client.ts

import { createClient } from "@supabase/supabase-js";

// Asegúrate de que tienes estas variables en tu archivo .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Verifica que las variables de entorno existan
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Las variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY deben estar definidas."
  );
}

import { getRedirectUrl, getEmailConfirmationUrl } from "@/lib/utils";

// Inicializa el cliente Supabase con configuración PKCE específica para resolver el error
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // CONFIGURACIÓN PKCE ESPECÍFICA PARA RESOLVER EL ERROR
    flowType: "pkce",
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Configuraciones de almacenamiento específicas para PKCE
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    storageKey: "sb-auth-token",
    // Configuración de debug para desarrollo
    debug: process.env.NODE_ENV === "development",
    // Configuraciones adicionales para PKCE
    ...(typeof window !== "undefined" && {
      // Forzar regeneración de code_verifier si es necesario
      refreshToken: true,
      // Configuración específica para el navegador
      browser: {
        localStorage: window.localStorage,
        sessionStorage: window.sessionStorage,
      },
    }),
  },
  db: {
    schema: "public",
  },
  global: {
    headers: {
      "X-Client-Info": "sumee-app",
      "X-Requested-With": "XMLHttpRequest",
      // Headers adicionales para PKCE
      "X-PKCE-Flow": "enabled",
    },
  },
});

// Manejo global de errores de refresh token (solo en el navegador)
if (typeof window !== "undefined") {
  // Listener para errores de autenticación
  supabase.auth.onAuthStateChange((event, session) => {
    // Si la sesión es null después de un TOKEN_REFRESHED, podría indicar un error
    if (event === "TOKEN_REFRESHED" && !session) {
      console.warn(
        "Token refresh resulted in null session, clearing auth data"
      );
      // Limpiar datos de autenticación
      if (typeof window !== "undefined") {
        Object.keys(localStorage).forEach((key) => {
          if (
            key.includes("supabase") ||
            key.includes("sb-") ||
            key.includes("auth-token")
          ) {
            localStorage.removeItem(key);
          }
        });
      }
    }
  });

  // Interceptar errores de fetch para detectar errores de refresh token
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    try {
      const response = await originalFetch(...args);

      // Si la respuesta es un error 401 o 400, verificar si es un error de refresh token
      if (
        !response.ok &&
        (response.status === 401 || response.status === 400)
      ) {
        const clonedResponse = response.clone();
        try {
          const errorData = await clonedResponse.json();
          if (
            errorData?.message &&
            (errorData.message.includes("Invalid Refresh Token") ||
              errorData.message.includes("Refresh Token Not Found"))
          ) {
            console.warn("Refresh token error detected, clearing session");
            // Limpiar sesión
            await supabase.auth.signOut();
            // Limpiar localStorage
            Object.keys(localStorage).forEach((key) => {
              if (
                key.includes("supabase") ||
                key.includes("sb-") ||
                key.includes("auth-token")
              ) {
                localStorage.removeItem(key);
              }
            });
          }
        } catch (e) {
          // Si no se puede parsear como JSON, ignorar
        }
      }

      return response;
    } catch (error: any) {
      // Si el error contiene información de refresh token, limpiar sesión
      if (
        error?.message &&
        (error.message.includes("Invalid Refresh Token") ||
          error.message.includes("Refresh Token Not Found"))
      ) {
        console.warn("Refresh token error in fetch, clearing session");
        await supabase.auth.signOut();
        if (typeof window !== "undefined") {
          Object.keys(localStorage).forEach((key) => {
            if (
              key.includes("supabase") ||
              key.includes("sb-") ||
              key.includes("auth-token")
            ) {
              localStorage.removeItem(key);
            }
          });
        }
      }
      throw error;
    }
  };
}

// Re-exportar funciones helper para compatibilidad
export { getRedirectUrl, getEmailConfirmationUrl };
