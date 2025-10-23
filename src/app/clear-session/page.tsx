'use client';

import React, { useEffect, useState } from 'react';
import { clearAuthSession } from '@/lib/auth-utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

export default function ClearSessionPage() {
  const [status, setStatus] = useState<'clearing' | 'completed' | 'error'>('clearing');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const clearSession = async () => {
      try {
        setStatus('clearing');
        await clearAuthSession();
        setStatus('completed');
        
        // Redirigir al inicio después de 2 segundos
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } catch (err: any) {
        console.error('Error clearing session:', err);
        setError(err.message || 'Error desconocido');
        setStatus('error');
      }
    };

    clearSession();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === 'clearing' && (
          <>
            <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-blue-600 mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Limpiando Sesión...
            </h1>
            <p className="text-gray-600">
              Eliminando datos de autenticación corruptos...
            </p>
          </>
        )}

        {status === 'completed' && (
          <>
            <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-green-600 mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Sesión Limpiada
            </h1>
            <p className="text-gray-600">
              Redirigiendo al inicio...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <FontAwesomeIcon icon={faSpinner} className="text-4xl text-red-600 mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Error
            </h1>
            <p className="text-gray-600 mb-4">
              {error}
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Ir al Inicio
            </button>
          </>
        )}
      </div>
    </div>
  );
}
