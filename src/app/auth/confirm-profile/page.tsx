'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useProfessionalRegistration } from '@/hooks/useProfessionalRegistration';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheckCircle, faExclamationTriangle, faUser, faEnvelope } from '@fortawesome/free-solid-svg-icons';

export default function ConfirmProfilePage() {
  const [status, setStatus] = useState<'checking' | 'creating' | 'success' | 'error'>('checking');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { createProfileAfterConfirmation, loading } = useProfessionalRegistration();

  useEffect(() => {
    const handleProfileCreation = async () => {
      try {
        setStatus('checking');
        setMessage('Verificando estado de tu cuenta...');

        // Verificar si el usuario está autenticado
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          setStatus('error');
          setError('Usuario no autenticado. Por favor, inicia sesión.');
          return;
        }

        console.log('👤 Usuario autenticado:', user.id);
        console.log('📧 Email confirmado:', user.email_confirmed_at);

        // Verificar si ya tiene perfil
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          throw new Error(`Error al verificar perfil: ${profileError.message}`);
        }

        if (existingProfile) {
          // @ts-ignore - Supabase type inference issue
          const profile = existingProfile as any;
          console.log('✅ Perfil ya existe:', profile.role);
          setStatus('success');
          setMessage('¡Tu perfil ya está creado! Redirigiendo...');
          
          // Redirigir basado en el rol
          setTimeout(() => {
            if (profile.role === 'profesional') {
              router.push('/professional-dashboard');
            } else {
              router.push('/dashboard/client');
            }
          }, 2000);
          return;
        }

        // Crear perfil usando RPC
        setStatus('creating');
        setMessage('Creando tu perfil profesional...');

        const result = await createProfileAfterConfirmation();

        if (result.success) {
          setStatus('success');
          setMessage('¡Perfil profesional creado exitosamente! Redirigiendo...');
          
          // Redirigir al dashboard profesional
          setTimeout(() => {
            router.push('/professional-dashboard');
          }, 2000);
        } else {
          setStatus('error');
          setError(result.error || 'Error al crear perfil profesional');
        }

      } catch (err: any) {
        console.error('Error en handleProfileCreation:', err);
        setStatus('error');
        setError(err.message || 'Error inesperado al crear perfil');
      }
    };

    handleProfileCreation();
  }, [createProfileAfterConfirmation, router]);

  const handleRetry = () => {
    setStatus('checking');
    setError(null);
    setMessage('');
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
          {status === 'creating' && (
            <FontAwesomeIcon icon={faUser} className="text-4xl text-yellow-600 mb-4" />
          )}
          {status === 'success' && (
            <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-green-600 mb-4" />
          )}
          {status === 'error' && (
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl text-red-600 mb-4" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {status === 'checking' && 'Verificando Cuenta...'}
          {status === 'creating' && 'Creando Perfil...'}
          {status === 'success' && '¡Perfil Creado!'}
          {status === 'error' && 'Error de Confirmación'}
        </h1>

        <p className="text-gray-600 mb-6">
          {status === 'checking' && 'Estamos verificando tu cuenta y creando tu perfil profesional...'}
          {status === 'creating' && 'Creando tu perfil profesional con datos seguros...'}
          {status === 'success' && message}
          {status === 'error' && message}
        </p>

        {status === 'creating' && (
          <div className="text-sm text-gray-500">
            <p>Esto puede tomar unos segundos...</p>
            <p>Creando perfil de forma transaccional...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-3">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
              <h3 className="text-sm font-semibold text-red-800 mb-2">Detalles del Error:</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
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

        {loading && (
          <div className="text-sm text-gray-500">
            <p>Procesando...</p>
          </div>
        )}
      </div>
    </div>
  );
}
