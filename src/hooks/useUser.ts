"use client";

import { useEffect, useState } from "react";
// 1. Usamos el cliente del NAVEGADOR, que es el correcto para un hook de cliente.
import { supabase } from "@/lib/supabase/client";
import { AppUser } from "@/types/supabase"; // Nuestro tipo de usuario personalizado
import { User } from "@supabase/supabase-js";

// El hook ahora devuelve el usuario y un estado de carga.
export function useUser(): { user: AppUser | null; isLoading: boolean } {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Empezamos asumiendo que estamos cargando

  useEffect(() => {
    // Definimos una función asíncrona para obtener el perfil y construir nuestro AppUser
    const fetchUserWithProfile = async (
      authUser: User | null
    ): Promise<AppUser | null> => {
      if (!authUser) {
        return null;
      }

      // Obtenemos el perfil para sacar el 'role'
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", authUser.id)
        .single();

      // Construimos y devolvemos el objeto AppUser completo
      return {
        ...authUser,
        // @ts-ignore - Supabase types inference issue
        role: (profile as any)?.role || "client",
      };
    };

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

    // 2. Establecemos un listener que se ejecuta CADA VEZ que el estado de auth cambia.
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
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
      }
    );

    // Limpiamos el listener cuando el componente que usa el hook se desmonta.
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [isLoading]); // El array de dependencias puede estar vacío o incluir isLoading

  return { user, isLoading };
}
