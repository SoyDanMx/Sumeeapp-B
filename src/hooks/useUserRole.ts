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
        console.log('🔍 useUserRole: Fetching profile for user:', user.id);
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, full_name, email, created_at')
          .eq('user_id', user.id)
          .single();
        
        console.log('🔍 useUserRole: Profile query result:', { 
          profile, 
          profileError,
          userEmail: user.email,
          userMetadata: user.user_metadata
        });

        if (profileError) {
          console.error('Error getting profile:', {
            message: profileError.message,
            code: profileError.code,
            details: profileError.details,
            hint: profileError.hint
          });
          
          // Si el error es "no rows found", el perfil debería haber sido creado en el callback
          // Si no existe, es un error del sistema
          if (profileError.code === 'PGRST116') {
            console.error('No profile found - this should not happen after auth callback');
            setError('Perfil de usuario no encontrado. Por favor, contacta a soporte.');
          } else {
            setError('Error al cargar el perfil del usuario');
          }
          
          setRole('client'); // Default to client if no profile
        } else {
          // Validar que el rol sea válido
          const userRole = profile?.role as UserRole;
          console.log('🔍 useUserRole: Profile role found:', userRole);
          console.log('🔍 useUserRole: Full profile data:', profile);
          
          if (userRole === 'profesional' || userRole === 'client') {
            console.log('✅ useUserRole: Setting role to:', userRole);
            setRole(userRole);
            setError(null); // Clear any previous errors
          } else {
            console.log('❌ useUserRole: Invalid role, defaulting to client:', userRole);
            setRole('client'); // Default to client if invalid role
            setError(`Rol inválido detectado: ${userRole}. Contacta a soporte.`);
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
