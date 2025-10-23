'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheckCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

export default function VerifySessionPage() {
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [message, setMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const verifySession = async () => {
      try {
        console.log('🔍 Verifying session...');
        
        // Verificar sesión
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setStatus('error');
          setMessage(`Error de sesión: ${sessionError.message}`);
          return;
        }

        if (!session) {
          console.log('No session found, retrying...');
          setRetryCount(prev => prev + 1);
          
          if (retryCount < 3) {
            // Reintentar después de un delay
            setTimeout(() => {
              verifySession();
            }, 1000);
            return;
          } else {
            setStatus('error');
            setMessage('No se pudo establecer la sesión. Por favor, intenta registrarte de nuevo.');
            return;
          }
        }

        console.log('✅ Session verified:', session.user?.id);
        
        // Verificar perfil
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('user_id', session.user.id)
          .single();

        if (profileError) {
          console.error('Profile error:', profileError);
          setStatus('error');
          setMessage(`Error al cargar el perfil: ${profileError.message}`);
          return;
        }

        console.log('✅ Profile verified:', profile.role);
        
        setStatus('success');
        setMessage(`¡Bienvenido ${profile.full_name}! Redirigiendo a tu panel...`);
        
        // Redirigir basado en el rol
        setTimeout(() => {
          if (profile.role === 'profesional') {
            router.push('/professional-dashboard');
          } else {
            router.push('/dashboard/client');
          }
        }, 2000);

      } catch (error: any) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage(`Error inesperado: ${error.message}`);
      }
    };

    verifySession();
  }, [retryCount, router]);

  const handleRetry = () => {
    setStatus('checking');
    setMessage('');
    setRetryCount(0);
    window.location.reload();
  };

  const handleGoToLogin = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          {status === 'checking' && (
            <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-blue-600 mb-4" />
          )}
          {status === 'success' && (
            <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-green-600 mb-4" />
          )}
          {status === 'error' && (
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl text-red-600 mb-4" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {status === 'checking' && 'Verificando Sesión...'}
          {status === 'success' && '¡Sesión Verificada!'}
          {status === 'error' && 'Error de Verificación'}
        </h1>

        <p className="text-gray-600 mb-6">
          {status === 'checking' && 'Estamos verificando tu sesión y perfil...'}
          {status === 'success' && message}
          {status === 'error' && message}
        </p>

        {status === 'checking' && (
          <div className="text-sm text-gray-500">
            <p>Intento {retryCount + 1} de 3</p>
            <p>Esto puede tomar unos segundos...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
            <button
              onClick={handleGoToLogin}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Ir a Login
            </button>
          </div>
        )}

        {status === 'success' && (
          <div className="text-sm text-gray-500">
            <p>Redirigiendo automáticamente...</p>
          </div>
        )}
      </div>
    </div>
  );
}
