'use client';

import React, { useState } from 'react';
import { supabase, getRedirectUrl } from '@/lib/supabase/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheckCircle, faExclamationTriangle, faDatabase } from '@fortawesome/free-solid-svg-icons';
import { faGoogle, faGithub, faFacebook } from '@fortawesome/free-brands-svg-icons';

export default function TestOAuthSimplePage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testOAuthProvider = async (provider: 'google' | 'github' | 'facebook') => {
    setLoading(provider);
    setError(null);
    setResult(null);

    try {
      console.log(`🧪 TESTING OAUTH WITH ${provider.toUpperCase()}...`);

      const redirectTo = getRedirectUrl('/auth/callback');
      console.log('🔗 Redirect URL:', redirectTo);

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (oauthError) {
        throw new Error(`OAuth Error: ${oauthError.message}`);
      }

      setResult({
        success: true,
        provider,
        redirectUrl: data.url,
        message: `OAuth ${provider} iniciado correctamente`
      });

      console.log(`✅ OAuth ${provider} iniciado correctamente`);

    } catch (err: any) {
      console.error(`❌ Error en OAuth ${provider}:`, err);
      setError(err.message || `Error al iniciar sesión con ${provider}`);
    } finally {
      setLoading(null);
    }
  };

  const clearResults = () => {
    setResult(null);
    setError(null);
  };

  const providers = [
    { id: 'google', name: 'Google', icon: faGoogle, color: 'bg-red-600' },
    { id: 'github', name: 'GitHub', icon: faGithub, color: 'bg-gray-800' },
    { id: 'facebook', name: 'Facebook', icon: faFacebook, color: 'bg-blue-600' }
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <FontAwesomeIcon icon={faDatabase} className="text-4xl text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Prueba Simple de OAuth
          </h1>
          <p className="text-lg text-gray-600">
            Prueba el flujo OAuth con configuración PKCE optimizada
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {providers.map((provider) => (
            <div key={provider.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <FontAwesomeIcon 
                  icon={provider.icon} 
                  className={`text-2xl mr-3 ${
                    provider.color.includes('red') ? 'text-red-600' : 
                    provider.color.includes('blue') ? 'text-blue-600' : 'text-gray-600'
                  }`} 
                />
                <h2 className="text-xl font-semibold text-gray-900">
                  {provider.name}
                </h2>
              </div>
              
              <button
                onClick={() => testOAuthProvider(provider.id)}
                disabled={loading !== null}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                  loading === provider.id
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : `${provider.color} text-white hover:shadow-md transform hover:-translate-y-0.5`
                }`}
              >
                {loading === provider.id ? (
                  <FontAwesomeIcon icon={faSpinner} spin />
                ) : (
                  <FontAwesomeIcon icon={faCheckCircle} />
                )}
                <span>
                  {loading === provider.id 
                    ? `Conectando...` 
                    : `Probar ${provider.name}`
                  }
                </span>
              </button>
            </div>
          ))}
        </div>

        {/* Resultados */}
        {(result || error) && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Resultado de la Prueba</h3>
              <button
                onClick={clearResults}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Limpiar
              </button>
            </div>
            
            {result && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 mr-2" />
                  <h4 className="text-lg font-semibold text-green-800">
                    {result.message}
                  </h4>
                </div>
                <div className="text-green-700 space-y-1">
                  <p><strong>Proveedor:</strong> {result.provider}</p>
                  <p><strong>Redirect URL:</strong> {result.redirectUrl}</p>
                  <p><strong>Estado:</strong> {result.success ? 'Éxito' : 'Error'}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 mr-2" />
                  <h4 className="text-lg font-semibold text-red-800">Error</h4>
                </div>
                <p className="text-red-700">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* Información de Debug */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            🔍 Información de Debug - OAuth con PKCE
          </h3>
          <div className="text-blue-700 space-y-2">
            <p><strong>PKCE Flow:</strong> Habilitado para mayor seguridad</p>
            <p><strong>Redirect URLs:</strong> Configuradas con comodines (**) para flexibilidad</p>
            <p><strong>Session Storage:</strong> localStorage para persistencia</p>
            <p><strong>Auto Refresh:</strong> Habilitado para mantener sesiones</p>
            <p><strong>Debug Mode:</strong> {process.env.NODE_ENV === 'development' ? 'Habilitado' : 'Deshabilitado'}</p>
            <p><strong>Base URL:</strong> {typeof window !== 'undefined' ? window.location.origin : 'Server'}</p>
            <p><strong>Redirect URL:</strong> {getRedirectUrl('/auth/callback')}</p>
          </div>
        </div>

        <div className="mt-6 text-center space-x-4">
          <a
            href="/login"
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
            Ir a Login
          </a>
          <a
            href="/join-as-pro"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FontAwesomeIcon icon={faDatabase} className="mr-2" />
            Ir a Registro
          </a>
        </div>
      </div>
    </div>
  );
}
