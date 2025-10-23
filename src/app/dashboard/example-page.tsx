'use client';

import { useUser } from '@/hooks/useUser';
import AuthGuard from '@/components/AuthGuard';

export default function ExampleDashboardPage() {
  const { user, isLoading } = useUser();

  // Guarda de carga: Muestra un spinner mientras la sesión se está verificando.
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

  // Guarda de autenticación: Si no hay usuario, redirige al login.
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">No Autenticado</h1>
          <p className="text-gray-600">Redirigiendo al login...</p>
        </div>
      </div>
    );
  }

  // Guarda de rol: Si el usuario no es un profesional, muéstrale un error.
  if (user.role !== 'profesional') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600">Esta área es solo para profesionales.</p>
        </div>
      </div>
    );
  }

  // Si todas las guardas pasan, renderiza el contenido del dashboard.
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Bienvenido, Profesional {user.email}
      </h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Información del Perfil
        </h2>
        
        <div className="space-y-2">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Rol:</strong> {user.role}</p>
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Última actualización:</strong> {new Date(user.updated_at).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

// Alternativa usando AuthGuard (más limpio)
export function ExampleDashboardPageWithGuard() {
  return (
    <AuthGuard requiredRole="profesional">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Dashboard Profesional
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Contenido del Dashboard
          </h2>
          
          <p className="text-gray-600">
            Este contenido solo es visible para profesionales autenticados.
          </p>
        </div>
      </div>
    </AuthGuard>
  );
}
