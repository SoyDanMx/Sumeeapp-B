'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheckCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

export default function ClearSessionPage() {
  const [status, setStatus] = useState<'clearing' | 'success' | 'error'>('clearing');
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const clearSession = async () => {
      try {
        console.log('🧹 Iniciando limpieza de sesión...');
        
        // Limpiar sesión de Supabase
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          console.error('❌ Error al cerrar sesión:', error);
          setStatus('error');
          setMessage('Error al cerrar sesión: ' + error.message);
          return;
        }

        // Limpiar localStorage
        if (typeof window !== 'undefined') {
          // Limpiar tokens de Supabase
          localStorage.removeItem('sb-auth-token');
          localStorage.removeItem('supabase.auth.token');
          
          // Limpiar otros datos de sesión
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('supabase') || key.includes('sb-'))) {
              keysToRemove.push(key);
            }
          }
          
          keysToRemove.forEach(key => localStorage.removeItem(key));
          
          console.log('✅ LocalStorage limpiado');
        }

        setStatus('success');
        setMessage('Sesión limpiada exitosamente. Redirigiendo...');
        
        // Redirigir después de 2 segundos
        setTimeout(() => {
          router.push('/');
        }, 2000);

      } catch (error) {
        console.error('❌ Error inesperado:', error);
        setStatus('error');
        setMessage('Error inesperado: ' + (error as Error).message);
      }
    };

    clearSession();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        {status === 'clearing' && (
          <>
            <FontAwesomeIcon icon={faSpinner} className="text-blue-500 text-4xl mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Limpiando Sesión</h1>
            <p className="text-gray-600">Cerrando sesión y limpiando datos...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-4xl mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Listo!</h1>
            <p className="text-gray-600 mb-4">{message}</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                Tu sesión ha sido limpiada completamente. Ahora puedes iniciar sesión nuevamente.
              </p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-4xl mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
            <p className="text-gray-600 mb-4">{message}</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                Hubo un problema al limpiar la sesión. Intenta cerrar el navegador y volver a abrir.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </>
        )}
      </div>
    </div>
  );
}