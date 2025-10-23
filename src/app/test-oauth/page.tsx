'use client';

import React, { useState } from 'react';
import { useOAuth } from '@/hooks/useOAuth';
import { OAuthLogin } from '@/components/OAuthLogin';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheckCircle, faExclamationTriangle, faDatabase } from '@fortawesome/free-solid-svg-icons';
import { faGoogle, faGithub, faFacebook } from '@fortawesome/free-brands-svg-icons';

export default function TestOAuthPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { signInWithOAuth, signUpWithOAuth, loading: oauthLoading, error: oauthError } = useOAuth();

  const testOAuthProvider = async (provider: 'google' | 'github' | 'facebook', type: 'signin' | 'signup') => {
    setLoading(true);
    const startTime = Date.now();

    try {
      console.log(`🧪 TESTING ${type.toUpperCase()} WITH ${provider.toUpperCase()}...`);

      const result = type === 'signin' 
        ? await signInWithOAuth(provider)
        : await signUpWithOAuth(provider);

      const duration = Date.now() - startTime;

      const testResult = {
        id: Date.now(),
        provider,
        type,
        success: result.success,
        duration,
        timestamp: new Date().toISOString(),
        error: result.error,
        redirectUrl: result.redirectUrl,
        needsRedirect: result.needsRedirect
      };

      setResults(prev => [testResult, ...prev]);
      console.log(`✅ ${type.toUpperCase()} ${provider.toUpperCase()} test completed:`, testResult);

    } catch (err: any) {
      const duration = Date.now() - startTime;
      const testResult = {
        id: Date.now(),
        provider,
        type,
        success: false,
        duration,
        timestamp: new Date().toISOString(),
        error: err.message || 'Unknown error'
      };

      setResults(prev => [testResult, ...prev]);
      console.error(`❌ ${type.toUpperCase()} ${provider.toUpperCase()} test failed:`, err);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  const providers = [
    { id: 'google', name: 'Google', icon: faGoogle, color: 'bg-red-600' },
    { id: 'github', name: 'GitHub', icon: faGithub, color: 'bg-gray-800' },
    { id: 'facebook', name: 'Facebook', icon: faFacebook, color: 'bg-blue-600' }
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <FontAwesomeIcon icon={faDatabase} className="text-4xl text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Prueba de OAuth con PKCE
          </h1>
          <p className="text-lg text-gray-600">
            Herramientas para probar el flujo OAuth con configuración PKCE optimizada
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panel de Pruebas */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Pruebas de OAuth
            </h2>

            {/* OAuth Login Component */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Componente OAuth Login
              </h3>
              <OAuthLogin 
                onError={(error) => console.error('OAuth Error:', error)}
                onSuccess={() => console.log('OAuth Success')}
              />
            </div>

            {/* Pruebas Manuales */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Pruebas Manuales
              </h3>
              
              {providers.map((provider) => (
                <div key={provider.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <FontAwesomeIcon icon={provider.icon} className={`text-2xl mr-3 ${provider.color.includes('red') ? 'text-red-600' : provider.color.includes('blue') ? 'text-blue-600' : 'text-gray-600'}`} />
                    <h4 className="text-lg font-medium text-gray-800">{provider.name}</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => testOAuthProvider(provider.id, 'signin')}
                      disabled={loading || oauthLoading}
                      className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
                    >
                      {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faCheckCircle} />}
                      <span>Sign In</span>
                    </button>
                    
                    <button
                      onClick={() => testOAuthProvider(provider.id, 'signup')}
                      disabled={loading || oauthLoading}
                      className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
                    >
                      {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faCheckCircle} />}
                      <span>Sign Up</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Estado de OAuth */}
            {oauthError && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 mr-2" />
                  <p className="text-red-800 text-sm">{oauthError}</p>
                </div>
              </div>
            )}

            {oauthLoading && (
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faSpinner} spin className="text-blue-600 mr-2" />
                  <p className="text-blue-800 text-sm">Procesando OAuth...</p>
                </div>
              </div>
            )}
          </div>

          {/* Panel de Resultados */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Resultados de Pruebas
              </h2>
              <button
                onClick={clearResults}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Limpiar
              </button>
            </div>

            {results.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <FontAwesomeIcon icon={faDatabase} className="text-4xl mb-4" />
                <p>No hay resultados de pruebas aún</p>
                <p className="text-sm">Ejecuta algunas pruebas para ver los resultados</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className={`border rounded-lg p-4 ${
                      result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {result.success ? (
                          <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 mr-2" />
                        ) : (
                          <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 mr-2" />
                        )}
                        <span className={`font-semibold ${
                          result.success ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {result.type.toUpperCase()} {result.provider.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {result.duration}ms
                      </span>
                    </div>
                    
                    <div className={`text-sm space-y-1 ${
                      result.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                      <p><strong>Estado:</strong> {result.success ? 'Éxito' : 'Error'}</p>
                      <p><strong>Timestamp:</strong> {new Date(result.timestamp).toLocaleString()}</p>
                      {result.redirectUrl && (
                        <p><strong>Redirect URL:</strong> {result.redirectUrl}</p>
                      )}
                      {result.error && (
                        <p><strong>Error:</strong> {result.error}</p>
                      )}
                      {result.needsRedirect && (
                        <p><strong>Needs Redirect:</strong> {result.needsRedirect ? 'Sí' : 'No'}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Información de Debug */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
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
