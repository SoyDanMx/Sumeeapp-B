// src/lib/supabase/client.ts
'use client';

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

// SINGLETON: Asegurar que solo se cree una instancia del cliente
// Esto previene el warning "Multiple GoTrueClient instances detected"
let supabaseInstance: ReturnType<typeof createClient> | null = null;

// Inicializa el cliente Supabase con configuración PKCE específica para resolver el error
const createSupabaseClient = () => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
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
  });

  return supabaseInstance;
};

// Exportar instancia singleton
export const supabase = createSupabaseClient();

// Manejo global de errores de refresh token (solo en el navegador)
if (typeof window !== "undefined") {
  // Limpiar tokens inválidos al iniciar si no hay sesión válida
  supabase.auth
    .getSession()
    .then(({ data: { session }, error }) => {
      if (error || !session) {
        // Limpiar tokens residuales si no hay sesión válida
        const authKeys = Object.keys(localStorage).filter(
          (key) =>
            key.includes("supabase") ||
            key.includes("sb-") ||
            key.includes("auth-token")
        );
        if (authKeys.length > 0) {
          authKeys.forEach((key) => localStorage.removeItem(key));
        }
      }
    })
    .catch(() => {
      // Ignorar errores en getSession inicial
    });

  // Interceptar errores no capturados relacionados con refresh token
  window.addEventListener("unhandledrejection", (event) => {
    const errorMessage =
      event.reason?.message || event.reason?.toString() || "";
    if (
      typeof errorMessage === "string" &&
      (errorMessage.includes("Invalid Refresh Token") ||
        errorMessage.includes("Refresh Token Not Found") ||
        errorMessage.includes("refresh_token_not_found"))
    ) {
      // Prevenir que el error se muestre en la consola
      event.preventDefault();
      // Limpiar tokens inválidos automáticamente
      const authKeys = Object.keys(localStorage).filter(
        (key) =>
          key.includes("supabase") ||
          key.includes("sb-") ||
          key.includes("auth-token")
      );
      if (authKeys.length > 0) {
        authKeys.forEach((key) => localStorage.removeItem(key));
      }
    }
  });

  // Listener para errores de autenticación
  supabase.auth.onAuthStateChange(async (event, session) => {
    // Si la sesión es null después de un TOKEN_REFRESHED, podría indicar un error
    if (event === "TOKEN_REFRESHED" && !session) {
      // Limpiar datos de autenticación silenciosamente
      const authKeys = Object.keys(localStorage).filter(
        (key) =>
          key.includes("supabase") ||
          key.includes("sb-") ||
          key.includes("auth-token")
      );
      if (authKeys.length > 0) {
        authKeys.forEach((key) => localStorage.removeItem(key));
      }
    }

    // Manejar errores de refresh token en eventos de error
    if (event === "SIGNED_OUT" || (!session && event !== "INITIAL_SESSION")) {
      // Limpiar tokens residuales
      const authKeys = Object.keys(localStorage).filter(
        (key) =>
          key.includes("supabase") ||
          key.includes("sb-") ||
          key.includes("auth-token")
      );
      if (authKeys.length > 0) {
        authKeys.forEach((key) => localStorage.removeItem(key));
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
              errorData.message.includes("Refresh Token Not Found") ||
              errorData.message.includes("refresh_token_not_found"))
          ) {
            // Limpiar sesión silenciosamente
            try {
              await supabase.auth.signOut();
            } catch (e) {
              // Ignorar errores al hacer signOut
            }
            // Limpiar localStorage
            const authKeys = Object.keys(localStorage).filter(
              (key) =>
                key.includes("supabase") ||
                key.includes("sb-") ||
                key.includes("auth-token")
            );
            authKeys.forEach((key) => localStorage.removeItem(key));
            // No propagar el error - es esperado cuando no hay sesión válida
            return response;
          }
        } catch (e) {
          // Si no se puede parsear como JSON, ignorar
        }
      }

      return response;
    } catch (error: any) {
      // Si el error contiene información de refresh token, limpiar sesión silenciosamente
      if (
        error?.message &&
        (error.message.includes("Invalid Refresh Token") ||
          error.message.includes("Refresh Token Not Found") ||
          error.message.includes("refresh_token_not_found"))
      ) {
        try {
          await supabase.auth.signOut();
        } catch (e) {
          // Ignorar errores al hacer signOut
        }
        const authKeys = Object.keys(localStorage).filter(
          (key) =>
            key.includes("supabase") ||
            key.includes("sb-") ||
            key.includes("auth-token")
        );
        authKeys.forEach((key) => localStorage.removeItem(key));
        // No propagar el error - crear una respuesta vacía en su lugar
        return new Response(JSON.stringify({ error: "Session expired" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
      throw error;
    }
  };
}

// Re-exportar funciones helper para compatibilidad
export { getRedirectUrl, getEmailConfirmationUrl };
