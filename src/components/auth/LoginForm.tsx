'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faInfoCircle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendingConfirmation, setResendingConfirmation] = useState(false);
  const [isTestCredentials, setIsTestCredentials] = useState(false);
  const [callbackError, setCallbackError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Manejar errores de callback de autenticación
  useEffect(() => {
    const errorParam = searchParams.get('error');
    const detailsParam = searchParams.get('details');
    
    if (errorParam) {
      let errorMessage = '';
      
      switch (errorParam) {
        case 'auth_callback_error':
          errorMessage = 'Error en la confirmación del email. Por favor, intenta registrarte de nuevo.';
          break;
        case 'profile_creation_error':
          errorMessage = 'Error al crear tu perfil. Por favor, contacta a soporte.';
          break;
        case 'profile_check_error':
          errorMessage = 'Error al verificar tu perfil. Por favor, intenta de nuevo.';
          break;
        case 'unexpected_error':
          errorMessage = 'Error inesperado durante el registro. Por favor, intenta de nuevo.';
          break;
        case 'no_code_provided':
          errorMessage = 'Enlace de confirmación inválido. Por favor, solicita un nuevo email de confirmación.';
          break;
        default:
          errorMessage = 'Error durante el proceso de registro. Por favor, intenta de nuevo.';
      }
      
      if (detailsParam) {
        errorMessage += ` (Detalles: ${decodeURIComponent(detailsParam)})`;
      }
      
      setCallbackError(errorMessage);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Timeout de seguridad de 20 segundos solo para signInWithPassword
    let timeoutId: NodeJS.Timeout | null = null;
    let loginCompleted = false;

    try {
      console.log('🔐 Intentando login...');
      
      // ✅ OPTIMIZACIÓN: Timeout reducido a 15 segundos (suficiente para login normal)
      timeoutId = setTimeout(() => {
        if (!loginCompleted) {
          setLoading(false);
          setError('La autenticación está tardando más de lo normal. Por favor, verifica tu conexión a internet e intenta de nuevo.');
        }
      }, 15000); // Reducido de 45s a 15s para mejor UX
      
      // ✅ OPTIMIZACIÓN: Simplificar lógica de retry - solo 1 reintento rápido
      let authData: any = null;
      let error: any = null;
      const maxRetries = 1; // Reducido de 2 a 1
      
      try {
        const result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        authData = result.data;
        error = result.error;
        
        // Solo reintentar si es un error de red claro y es el primer intento
        if (error && maxRetries > 0) {
          const errorMsg = error.message?.toLowerCase() || '';
          const isNetworkError = errorMsg.includes('timeout') || 
                                errorMsg.includes('network') || 
                                errorMsg.includes('fetch') ||
                                errorMsg.includes('connection');
          
          if (isNetworkError) {
            console.log('⚠️ Error de red detectado, reintentando una vez...');
            await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1s antes de reintentar
            
            const retryResult = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            
            authData = retryResult.data;
            error = retryResult.error;
          }
        }
      } catch (err: any) {
        error = err;
      }

      loginCompleted = true;
      if (timeoutId) clearTimeout(timeoutId);

      if (error) {
        // Manejar específicamente el error de email no confirmado
        if (error.message.includes('Email not confirmed')) {
          // Verificar si son credenciales de prueba
          const testEmail = 'cliente@sumeeapp.com';
          const testPassword = 'TestPassword123!';
          
          if (email === testEmail && password === testPassword && process.env.NODE_ENV === 'development') {
            // Para credenciales de prueba, intentar una solución alternativa
            setIsTestCredentials(true);
            throw new Error('TEST_CREDENTIALS_NOT_CONFIRMED');
          } else {
            throw new Error('EMAIL_NOT_CONFIRMED');
          }
        }
        throw error;
      }

      if (!authData.user) {
        throw new Error('No se pudo autenticar al usuario');
      }

      console.log('✅ Login exitoso, redirigiendo...');
      
      // ✅ OPTIMIZACIÓN: Eliminada consulta no bloqueante al perfil
      // El perfil se obtendrá cuando sea necesario en el dashboard
      
      // Verificar si hay un redirect guardado (de sessionStorage o URL)
      const redirectParam = searchParams.get('redirect');
      const redirectFromStorage = typeof window !== 'undefined' 
        ? sessionStorage.getItem('redirectAfterLogin') 
        : null;
      const redirectTo = redirectParam || redirectFromStorage;
      
      // Limpiar sessionStorage si existe
      if (redirectFromStorage && typeof window !== 'undefined') {
        sessionStorage.removeItem('redirectAfterLogin');
      }
      
      // Redirigir inmediatamente sin esperar el perfil
      // El dashboard determinará el rol automáticamente
      if (redirectTo) {
        console.log('🎯 Redirigiendo a:', redirectTo);
        router.push(redirectTo);
      } else {
        // Redirigir a /dashboard que maneja el routing automáticamente
        console.log('🎯 Redirigiendo a dashboard...');
        router.push('/dashboard');
      }

    } catch (error: any) {
      if (timeoutId) clearTimeout(timeoutId);
      loginCompleted = true;
      
      if (error.message === 'EMAIL_NOT_CONFIRMED') {
        setError('Tu correo electrónico no ha sido confirmado. Haz clic en "Reenviar confirmación" para recibir el enlace de activación.');
      } else if (error.message === 'TEST_CREDENTIALS_NOT_CONFIRMED') {
        setError('Las credenciales de prueba necesitan confirmación. Este es un problema común en desarrollo. Puedes: 1) Reenviar confirmación, 2) Verificar manualmente en Supabase, o 3) Usar la función de crear usuario de prueba.');
      } else {
        setError(error.message || 'No se pudo iniciar sesión. Revisa tus credenciales.');
      }
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      setError('Por favor, ingresa tu correo electrónico primero.');
      return;
    }

    setResendingConfirmation(true);
    setError(null);

    try {
      // Para credenciales de prueba en desarrollo, intentar confirmar directamente
      if (process.env.NODE_ENV === 'development' && email === 'cliente@sumeeapp.com') {
        const response = await fetch('/api/confirm-test-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        if (response.ok) {
          alert('Email de prueba confirmado exitosamente. Ahora puedes hacer login.');
          return;
        }
      }

      // Método normal de reenvío
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;

      alert('Se ha enviado un nuevo enlace de confirmación a tu correo electrónico. Revisa tu bandeja de entrada.');
    } catch (error: any) {
      setError('Error al reenviar la confirmación: ' + (error.message || 'Error desconocido'));
    } finally {
      setResendingConfirmation(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <Link href="/">
          <Image
            src="/logo.png" // CORRECCIÓN: Cambiado de .jpeg a .png para que coincida con tu archivo
            alt="Logo de Sumee"
            width={150}
            height={40}
            className="mx-auto mb-4"
          />
        </Link>
        <h2 className="text-2xl font-bold text-gray-900">Bienvenido de Nuevo</h2>
        <p className="text-gray-600 mt-2">Inicia sesión para continuar.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        {/* Error de callback de autenticación */}
        {callbackError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error de Confirmación</h3>
                <p className="text-sm text-red-700 mt-1">{callbackError}</p>
                <div className="mt-3">
                  <Link 
                    href="/join-as-pro" 
                    className="text-sm text-blue-600 hover:text-blue-700 underline"
                  >
                    Intentar registro nuevamente
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="text-gray-900 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="text-gray-900 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 focus:border-blue-500"
          />
        </div>
        
        {error && (
          <div className="text-center">
            <p className="text-red-500 text-sm mb-3">{error}</p>
            {(error.includes('correo electrónico no ha sido confirmado') || error.includes('credenciales de prueba')) && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={resendingConfirmation}
                  className="text-sm text-blue-600 hover:text-blue-700 underline disabled:text-gray-400 block mx-auto"
                >
                  {resendingConfirmation ? 'Enviando...' : 'Reenviar confirmación'}
                </button>
                {error.includes('credenciales de prueba') && (
                  <div>
                    <Link 
                      href="/test-credentials"
                      className="text-sm text-green-600 hover:text-green-700 underline block mt-2"
                    >
                      Ir a página de credenciales de prueba
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
          >
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        ¿No tienes una cuenta?{' '}
        <Link href="/registro" className="font-medium text-blue-600 hover:text-blue-500">
          Regístrate aquí
        </Link>
      </p>
      
      {/* Credenciales de prueba - solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 text-center mb-3">
            <strong>🧪 Modo Desarrollo:</strong> Credenciales de prueba
          </p>
          <div className="text-xs text-center space-y-1 mb-3">
            <div><strong>Email:</strong> cliente@sumeeapp.com</div>
            <div><strong>Password:</strong> TestPassword123!</div>
          </div>
          <div className="text-center space-y-2">
            <button
              type="button"
              onClick={() => {
                setEmail('cliente@sumeeapp.com');
                setPassword('TestPassword123!');
                setError(null);
              }}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
            >
              Rellenar credenciales de prueba
            </button>
            <div>
              <Link 
                href="/test-credentials" 
                className="text-xs text-blue-600 hover:text-blue-500 underline"
              >
                Ver página de credenciales completas
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
