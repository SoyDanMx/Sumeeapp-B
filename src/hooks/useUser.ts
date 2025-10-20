'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
// 1. IMPORTAMOS nuestro nuevo tipo personalizado
import { AppUser } from '@/types/supabase';

// El hook ahora devuelve nuestro tipo AppUser
export function useUser(): AppUser | null {
  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      // Obtenemos el usuario de la sesión de Supabase
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (authUser) {
        // Si hay un usuario autenticado, buscamos su perfil para obtener el rol
        const { data: profile } = await supabase
          .from('profiles')
          .select('role') // Solo necesitamos el rol
          .eq('user_id', authUser.id)
          .single();

        // 2. CONSTRUIMOS el objeto AppUser correctamente
        const appUser: AppUser = {
          ...authUser,
          role: profile?.role || 'client', // Asignamos el rol del perfil, o 'client' por defecto
        };
        
        setUser(appUser);
      } else {
        setUser(null);
      }
    };

    fetchUserAndProfile();

    // Escuchamos cambios en la autenticación para actualizar el estado
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      fetchUserAndProfile();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return user;
}