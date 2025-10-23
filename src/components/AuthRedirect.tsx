'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';

interface AuthRedirectProps {
  children: React.ReactNode;
}

export default function AuthRedirect({ children }: AuthRedirectProps) {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // No hacer nada mientras la sesión se está cargando
    if (isLoading) {
      return;
    }

    // Si hay un usuario logueado
    if (user) {
      // Ahora 'user' es el objeto AppUser, que sí tiene la propiedad 'role'
      const userRole = user.role || 'client';
      
      if (userRole === 'profesional') {
        // Si es profesional, redirigir al dashboard profesional
        router.push('/professional-dashboard');
      } else {
        // Si es cliente, redirigir al dashboard del cliente
        router.push('/dashboard/client');
      }
    }
  }, [user, isLoading, router]);

  // Mientras se determina el rol, mostrar loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo a tu panel...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
