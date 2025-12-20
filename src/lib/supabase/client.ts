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
      // Configuración de debug para desarrollo (desactivado para evitar ruido)
      debug: false,
      // Configuraciones adicionales para PKCE
      ...(typeof window !== "undefined" ? {
        // Configuración específica para el navegador
        browser: {
          localStorage: window.localStorage,
          sessionStorage: window.sessionStorage,
        },
      } : {}),
    },
    db: {
      schema: "public" as any,
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
      // Si hay error de refresh token, limpiar silenciosamente
      if (error) {
        const errorMessage = error.message || String(error);
        if (
          errorMessage.includes("Invalid Refresh Token") ||
          errorMessage.includes("Refresh Token Not Found") ||
          errorMessage.includes("refresh_token_not_found")
        ) {
          // Limpiar tokens inválidos silenciosamente
          const authKeys = Object.keys(localStorage).filter(
            (key) =>
              key.includes("supabase") ||
              key.includes("sb-") ||
              key.includes("auth-token")
          );
          if (authKeys.length > 0) {
            authKeys.forEach((key) => localStorage.removeItem(key));
          }
          return;
        }
      }
      
      if (!session) {
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
    .catch((error: any) => {
      // Silenciar errores de refresh token en getSession inicial
      const errorMessage = error?.message || String(error);
      if (
        errorMessage.includes("Invalid Refresh Token") ||
        errorMessage.includes("Refresh Token Not Found") ||
        errorMessage.includes("refresh_token_not_found")
      ) {
        // Limpiar tokens y continuar silenciosamente
        const authKeys = Object.keys(localStorage).filter(
          (key) =>
            key.includes("supabase") ||
            key.includes("sb-") ||
            key.includes("auth-token")
        );
        if (authKeys.length > 0) {
          authKeys.forEach((key) => localStorage.removeItem(key));
        }
        return;
      }
      // Para otros errores, ignorar también (no críticos en inicialización)
    });

  // Interceptar errores no capturados relacionados con refresh token
  // MEJORADO: Captura más específica del error AuthApiError
  window.addEventListener("unhandledrejection", (event) => {
    const error = event.reason;
    const errorMessage = error?.message || error?.toString() || "";
    const errorCode = error?.code || error?.status || "";
    const errorName = error?.name || "";
    
    // Detectar errores de refresh token de múltiples formas
    const isRefreshTokenError = 
      (typeof errorMessage === "string" &&
        (errorMessage.includes("Invalid Refresh Token") ||
          errorMessage.includes("Refresh Token Not Found") ||
          errorMessage.includes("refresh_token_not_found") ||
          errorMessage.includes("refresh_token_not_found"))) ||
      errorCode === "refresh_token_not_found" ||
      errorName === "AuthApiError" && errorMessage.includes("refresh");
    
    if (isRefreshTokenError) {
      // Prevenir que el error se muestre en la consola
      event.preventDefault();
      event.stopPropagation();
      
      // Limpiar tokens inválidos automáticamente (silenciosamente)
      const authKeys = Object.keys(localStorage).filter(
        (key) =>
          key.includes("supabase") ||
          key.includes("sb-") ||
          key.includes("auth-token")
      );
      if (authKeys.length > 0) {
        authKeys.forEach((key) => localStorage.removeItem(key));
      }
      
      // Intentar cerrar sesión silenciosamente
      supabase.auth.signOut({ scope: 'local' }).catch(() => {
        // Ignorar errores al hacer signOut
      });
      
      // No loguear nada - error manejado silenciosamente
      return;
    }
  });

  // Interceptar errores de consola también (para errores que se loguean directamente)
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const errorString = args.join(' ');
    if (
      errorString.includes("Invalid Refresh Token") ||
      errorString.includes("Refresh Token Not Found") ||
      errorString.includes("refresh_token_not_found") ||
      errorString.includes("AuthApiError") && errorString.includes("refresh")
    ) {
      // Silenciar este error específico - ya está siendo manejado
      return;
    }
    // Para otros errores, usar el console.error original
    originalConsoleError.apply(console, args);
  };

  // Listener optimizado: Solo maneja limpieza de tokens, no lógica de negocio
  // Se ejecuta solo una vez al inicializar el cliente, no en cada cambio de estado
  let authCleanupListener: ReturnType<typeof supabase.auth.onAuthStateChange> | null = null;
  
  // Solo registrar listener si no existe ya (evitar múltiples suscripciones)
  if (!authCleanupListener) {
    authCleanupListener = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        // Manejar errores de refresh token en el evento
        if (event === "TOKEN_REFRESHED" && !session) {
          // Limpiar tokens inválidos silenciosamente
          const authKeys = Object.keys(localStorage).filter(
            (key) =>
              key.includes("supabase") ||
              key.includes("sb-") ||
              key.includes("auth-token")
          );
          if (authKeys.length > 0) {
            authKeys.forEach((key) => localStorage.removeItem(key));
          }
        } else if (event === "SIGNED_OUT") {
          // Limpiar tokens al cerrar sesión
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
      } catch (error: any) {
        // Silenciar errores de refresh token en el listener
        const errorMessage = error?.message || String(error);
        if (
          errorMessage.includes("Invalid Refresh Token") ||
          errorMessage.includes("Refresh Token Not Found") ||
          errorMessage.includes("refresh_token_not_found")
        ) {
          // Error ya manejado, no hacer nada
          return;
        }
        // Para otros errores, permitir que se propaguen
        throw error;
      }
      // Ignorar otros eventos - los hooks se encargan de ellos
    });
  }

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
