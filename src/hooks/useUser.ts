"use client";

import { useEffect, useState, useRef } from "react";
// 1. Usamos el cliente del NAVEGADOR, que es el correcto para un hook de cliente.
import { supabase } from "@/lib/supabase/client";
import { AppUser } from "@/types/supabase"; // Nuestro tipo de usuario personalizado
import { User } from "@supabase/supabase-js";

// ✅ OPTIMIZACIÓN: Cache del perfil para evitar consultas redundantes
const profileCache = new Map<string, { role: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// ✅ OPTIMIZACIÓN: Sistema de cola para evitar consultas duplicadas simultáneas
const pendingQueries = new Map<string, Promise<{ role: string }>>();

// ✅ OPTIMIZACIÓN: Singleton para el listener de auth - solo un listener global
let globalAuthListener: ReturnType<typeof supabase.auth.onAuthStateChange> | null = null;
const authStateSubscribers = new Set<(event: string, session: any) => void>();

// Función para inicializar el listener global (solo una vez)
// Se inicializa lazy cuando se necesita por primera vez
function initGlobalAuthListener() {
  if (globalAuthListener) {
    return; // Ya está inicializado
  }

  // Usar el supabase importado al inicio del módulo
  globalAuthListener = supabase.auth.onAuthStateChange((event, session) => {
    // Notificar a todos los suscriptores
    authStateSubscribers.forEach(callback => {
      try {
        callback(event, session);
      } catch (error) {
        console.error('Error en callback de auth state:', error);
      }
    });
  });
}

// El hook ahora devuelve el usuario y un estado de carga.
export function useUser(): { user: AppUser | null; isLoading: boolean } {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Empezamos asumiendo que estamos cargando
  const fetchingRef = useRef<Set<string>>(new Set()); // Evitar múltiples consultas simultáneas

  useEffect(() => {
    // ✅ OPTIMIZACIÓN: Función mejorada con caché y prevención de consultas duplicadas
    const fetchUserWithProfile = async (
      authUser: User | null
    ): Promise<AppUser | null> => {
      if (!authUser) {
        return null;
      }

      // Verificar caché primero
      const cached = profileCache.get(authUser.id);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('✅ useUser: Usando perfil desde caché');
        return {
          ...authUser,
          // @ts-ignore - Supabase types inference issue
          role: cached.role || "client",
        };
      }

      // ✅ OPTIMIZACIÓN: Usar sistema de cola para evitar consultas duplicadas
      // Si ya hay una consulta en progreso para este usuario, esperar su resultado
      if (pendingQueries.has(authUser.id)) {
        console.log('⏳ useUser: Esperando consulta existente para usuario:', authUser.id);
        try {
          const cachedResult = await pendingQueries.get(authUser.id)!;
          // Verificar si el resultado ya está en caché antes de retornar
          const finalCached = profileCache.get(authUser.id);
          return {
            ...authUser,
            // @ts-ignore - Supabase types inference issue
            role: finalCached?.role || cachedResult.role || "client",
          };
        } catch (error) {
          // Si la consulta pendiente falla, verificar caché antes de hacer nueva consulta
          const fallbackCached = profileCache.get(authUser.id);
          if (fallbackCached) {
            return {
              ...authUser,
              // @ts-ignore - Supabase types inference issue
              role: fallbackCached.role || "client",
            };
          }
          // Si no hay caché, continuar con nueva consulta
          console.warn('⚠️ useUser: Consulta pendiente falló, iniciando nueva:', error);
        }
      }

      // Crear nueva consulta y agregarla a la cola
      const queryPromise = (async () => {
        try {
      // Obtenemos el perfil para sacar el 'role'
          const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", authUser.id)
        .single();

          if (error) {
            console.warn('⚠️ useUser: Error al obtener perfil:', error);
          }

          // Guardar en caché
          const role = (profile as any)?.role || "client";
          profileCache.set(authUser.id, { role, timestamp: Date.now() });

          return { role };
        } catch (error) {
          // En caso de error, retornar rol por defecto
          const defaultRole = "client";
          profileCache.set(authUser.id, { role: defaultRole, timestamp: Date.now() });
          return { role: defaultRole };
        } finally {
          // Limpiar de la cola después de completar
          pendingQueries.delete(authUser.id);
        }
      })();

      // Agregar a la cola antes de ejecutar
      pendingQueries.set(authUser.id, queryPromise);

      // Esperar el resultado
      const result = await queryPromise;

      // Construimos y devolvemos el objeto AppUser completo
      return {
        ...authUser,
        // @ts-ignore - Supabase types inference issue
        role: result.role,
      };
    };

    // ✅ OPTIMIZACIÓN: Inicializar listener global (solo una vez)
    initGlobalAuthListener();

    // ✅ OPTIMIZACIÓN: Callback para manejar cambios de auth state
    const handleAuthStateChange = async (event: string, session: any) => {
      // ✅ OPTIMIZACIÓN: Ignorar eventos que no requieren actualización del perfil
      // TOKEN_REFRESHED no cambia el usuario, solo refresca el token
      if (event === "TOKEN_REFRESHED") {
        // Solo actualizar isLoading si aún está cargando
        if (isLoading) {
          setIsLoading(false);
        }
        return; // No hacer consulta al perfil en refresh de token
      }

        console.log("Auth event:", event); // Útil para depurar

        // Manejar errores de refresh token silenciosamente
        try {
          const appUser = await fetchUserWithProfile(session?.user ?? null);
          setUser(appUser);
        } catch (error: unknown) {
          // Si hay un error relacionado con refresh token, limpiar y continuar
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          if (
            errorMessage.includes("Invalid Refresh Token") ||
            errorMessage.includes("Refresh Token Not Found") ||
            errorMessage.includes("refresh_token_not_found")
          ) {
            // Limpiar tokens inválidos
            const authKeys = Object.keys(localStorage).filter(
              (key) =>
                key.includes("supabase") ||
                key.includes("sb-") ||
                key.includes("auth-token")
            );
            authKeys.forEach((key) => localStorage.removeItem(key));
            setUser(null);
          } else {
            // Para otros errores, propagar normalmente
            throw error;
          }
        }

        // Si la carga inicial no ha terminado, la terminamos aquí.
        if (isLoading) {
          setIsLoading(false);
        }
    };

    // ✅ OPTIMIZACIÓN: Suscribirse al listener global en lugar de crear uno nuevo
    authStateSubscribers.add(handleAuthStateChange);

    // --- LA LÓGICA CLAVE ESTÁ AQUÍ ---
    // 1. Obtenemos la sesión inicial para saber si el usuario ya está logueado al cargar la página.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log(
        "🔍 useUser - Sesión inicial:",
        session?.user?.id || "No hay usuario"
      );
      const appUser = await fetchUserWithProfile(session?.user ?? null);
      console.log(
        "🔍 useUser - AppUser creado:",
        appUser?.id || "No hay usuario"
      );
      setUser(appUser);
      setIsLoading(false); // La carga inicial ha terminado
    });

    // Limpiamos la suscripción cuando el componente que usa el hook se desmonta.
    return () => {
      authStateSubscribers.delete(handleAuthStateChange);
    };
  }, [isLoading]); // El array de dependencias puede estar vacío o incluir isLoading

  return { user, isLoading };
}

// ✅ OPTIMIZACIÓN: Función helper para limpiar caché cuando sea necesario
export function clearUserProfileCache(userId?: string) {
  if (userId) {
    profileCache.delete(userId);
  } else {
    profileCache.clear();
  }
}
