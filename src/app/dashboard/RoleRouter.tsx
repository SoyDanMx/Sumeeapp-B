'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserRole } from '@/hooks/useUserRole';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function RoleRouter() {
  const { role, loading, error } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !error) {
      // Redirección basada en el rol del usuario
      if (role === 'profesional') {
        router.push('/professional-dashboard');
      } else {
        router.push('/dashboard/client');
      }
    }
  }, [role, loading, error, router]);

  // Mostrar loading mientras se determina el rol
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-blue-600 mb-4" />
          <p className="text-gray-600">Determinando tu panel...</p>
        </div>
      </div>
    );
  }

  // Mostrar error si hay problema
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Este componente no debería renderizarse nunca, ya que siempre redirige
  return null;
}
