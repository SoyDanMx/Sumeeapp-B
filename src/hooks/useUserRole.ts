'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export type UserRole = 'profesional' | 'client';

export function useUserRole() {
  const [role, setRole] = useState<UserRole>('client');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        setLoading(true);
        
        // Obtener usuario actual
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Error getting user:', userError);
          setRole('client'); // Default to client
          setLoading(false);
          return;
        }

        if (!user) {
          setRole('client'); // Default to client if no user
          setLoading(false);
          return;
        }

        // Obtener perfil del usuario para determinar el rol
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          console.error('Error getting profile:', profileError);
          setRole('client'); // Default to client if no profile
        } else {
          // Validar que el rol sea válido
          const userRole = profile?.role as UserRole;
          if (userRole === 'profesional' || userRole === 'client') {
            setRole(userRole);
          } else {
            setRole('client'); // Default to client if invalid role
          }
        }
      } catch (error) {
        console.error('Error in useUserRole:', error);
        setError('Error al determinar el rol del usuario');
        setRole('client'); // Default to client on error
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  return { role, loading, error };
}
