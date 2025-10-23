'use client';

import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'client' | 'profesional';
  redirectTo?: string;
}

export default function AuthGuard({ 
  children, 
  requiredRole, 
  redirectTo = '/login' 
}: AuthGuardProps) {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Si aún está cargando, no hacer nada
    if (isLoading) return;

    // Si no hay usuario, redirigir al login
    if (!user) {
      router.push(redirectTo);
      return;
    }

    // Si se requiere un rol específico y el usuario no lo tiene
    if (requiredRole && user.role !== requiredRole) {
      router.push('/dashboard'); // Redirigir al dashboard por defecto
      return;
    }
  }, [user, isLoading, requiredRole, redirectTo, router]);

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, no mostrar nada (se está redirigiendo)
  if (!user) {
    return null;
  }

  // Si se requiere un rol específico y el usuario no lo tiene
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos para acceder a esta área.</p>
        </div>
      </div>
    );
  }

  // Si todo está bien, mostrar el contenido
  return <>{children}</>;
}
