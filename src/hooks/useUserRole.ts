'use client';

import { useMemo } from 'react';
import { useUser } from './useUser';

export type UserRole = 'profesional' | 'client';

// ✅ OPTIMIZACIÓN: Usar useUser hook en lugar de hacer consulta separada
export function useUserRole() {
  const { user, isLoading } = useUser();

  // Extraer rol del usuario (ya viene del hook useUser que tiene caché)
  const roleData = useMemo(() => {
    if (isLoading) {
      return { role: 'client' as UserRole, loading: true, error: null };
        }

        if (!user) {
      return { role: 'client' as UserRole, loading: false, error: null };
          }
          
          // @ts-ignore - Supabase types inference issue
    const userRole = (user as any)?.role as UserRole;
          
          if (userRole === 'profesional' || userRole === 'client') {
      return { role: userRole, loading: false, error: null };
          } else {
      return { 
        role: 'client' as UserRole, 
        loading: false, 
        error: `Rol inválido detectado: ${userRole}. Contacta a soporte.` 
      };
        }
  }, [user, isLoading]);

  return roleData;
}
