'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { verifyPKCEStatus, clearPKCEState, getPKCEInfo } from '@/lib/supabase/pkce-fix';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBug, faCheckCircle, faExclamationTriangle, faSpinner, faShield, faDatabase } from '@fortawesome/free-solid-svg-icons';

export default function DebugPKCESimplePage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [pkceInfo, setPkceInfo] = useState<any>(null);

  useEffect(() => {
    // Cargar información inicial
    const info = getPKCEInfo();
    setPkceInfo(info);
  }, []);

  const runDiagnostic = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      console.log('🔍 EJECUTANDO DIAGNÓSTICO PKCE SIMPLE...');
      
      const status = await verifyPKCEStatus();
      setResults(status);
      
      console.log('✅ Diagnóstico completado:', status);

    } catch (err: any) {
      console.error('❌ Error en diagnóstico:', err);
      setError(err.message || 'Error durante el diagnóstico');
    } finally {
      setLoading(false);
    }
  };

  const clearState = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🧹 LIMPIANDO ESTADO PKCE...');
      
      await clearPKCEState();
      setResults(null);
      
      // Actualizar información
      const info = getPKCEInfo();
      setPkceInfo(info);
      
      console.log('✅ Estado limpiado');

    } catch (err: any) {
      console.error('❌ Error limpiando estado:', err);
      setError(err.message || 'Error limpiando estado');
    } finally {
      setLoading(false);
    }
  };

  const refreshInfo = () => {
    const info = getPKCEInfo();
    setPkceInfo(info);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <FontAwesomeIcon icon={faBug} className="text-4xl text-red-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Diagnóstico PKCE Simple
          </h1>
          <p className="text-lg text-gray-600">
            Herramienta para diagnosticar y solucionar el error PKCE
          </p>
        </div>

        {/* Controles de Prueba */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FontAwesomeIcon icon={faBug} className="text-blue-600 mr-2" />
              Diagnóstico
            </h3>
            <p className="text-gray-600 mb-4">Verifica el estado del PKCE</p>
            <button
              onClick={runDiagnostic}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faBug} />}
              <span>{loading ? 'Diagnosticando...' : 'Ejecutar'}</span>
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FontAwesomeIcon icon={faShield} className="text-red-600 mr-2" />
              Limpiar Estado
            </h3>
            <p className="text-gray-600 mb-4">Limpia el estado PKCE</p>
            <button
              onClick={clearState}
              disabled={loading}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faShield} />}
              <span>{loading ? 'Limpiando...' : 'Limpiar'}</span>
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FontAwesomeIcon icon={faDatabase} className="text-green-600 mr-2" />
              Actualizar Info
            </h3>
            <p className="text-gray-600 mb-4">Actualiza la información</p>
            <button
              onClick={refreshInfo}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <FontAwesomeIcon icon={faDatabase} />
              <span>Actualizar</span>
            </button>
          </div>
        </div>

        {/* Resultados del Diagnóstico */}
        {results && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              {results.isWorking ? (
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 mr-2" />
              ) : (
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 mr-2" />
              )}
              Resultados del Diagnóstico
            </h2>
            
            <div className="space-y-4">
              {/* Estado General */}
              <div className={`p-4 rounded-lg ${
                results.isWorking ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <h3 className={`font-semibold mb-2 ${
                  results.isWorking ? 'text-green-800' : 'text-red-800'
                }`}>
                  Estado del PKCE
                </h3>
                <p className={`text-sm ${
                  results.isWorking ? 'text-green-700' : 'text-red-700'
                }`}>
                  {results.isWorking ? 'PKCE funcionando correctamente' : 'PKCE tiene problemas'}
                </p>
              </div>

              {/* Issues */}
              {results.issues && results.issues.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-800 mb-2">Problemas Detectados</h3>
                  <ul className="text-sm text-red-700 space-y-1">
                    {results.issues.map((issue: string, index: number) => (
                      <li key={index}>• {issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {results.recommendations && results.recommendations.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">Recomendaciones</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {results.recommendations.map((rec: string, index: number) => (
                      <li key={index}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Información PKCE */}
        {pkceInfo && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <FontAwesomeIcon icon={faDatabase} className="text-blue-600 mr-2" />
                Información PKCE
              </h2>
              <button
                onClick={refreshInfo}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Actualizar
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Configuración */}
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Configuración Supabase</h3>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p><strong>URL:</strong> {pkceInfo.supabaseConfig.url}</p>
                    <p><strong>Anon Key:</strong> {pkceInfo.supabaseConfig.anonKey}</p>
                    <p><strong>Flow Type:</strong> {pkceInfo.supabaseConfig.flowType}</p>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">URL Actual</h3>
                  <p className="text-sm text-green-700 break-all">{pkceInfo.url}</p>
                </div>
              </div>

              {/* Storage */}
              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">LocalStorage</h3>
                  <div className="text-sm text-purple-700 space-y-1">
                    {Object.keys(pkceInfo.localStorage).length > 0 ? (
                      Object.entries(pkceInfo.localStorage).map(([key, value]) => (
                        <p key={key}><strong>{key}:</strong> {value ? 'Presente' : 'Ausente'}</p>
                      ))
                    ) : (
                      <p>No hay datos en localStorage</p>
                    )}
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-800 mb-2">Parámetros URL</h3>
                  <div className="text-sm text-orange-700 space-y-1">
                    {Object.keys(pkceInfo.urlParams).length > 0 ? (
                      <>
                        {Object.entries(pkceInfo.urlParams).map(([key, value]) => (
                          <p key={key}><strong>{key}:</strong> {value ? (typeof value === 'object' ? JSON.stringify(value) : String(value)) : 'No presente'}</p>
                        ))}
                      </>
                    ) : (
                      <p>No hay parámetros en la URL</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 mr-2" />
              <h3 className="text-lg font-semibold text-red-800">Error</h3>
            </div>
            <p className="text-red-700 mt-2">{error}</p>
          </div>
        )}

        {/* Enlaces de Prueba */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/test-pkce-fix"
            className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            <FontAwesomeIcon icon={faBug} className="mr-2" />
            Herramientas Avanzadas
          </a>
          <a
            href="/join-as-pro"
            className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors text-center"
          >
            <FontAwesomeIcon icon={faDatabase} className="mr-2" />
            Probar Registro
          </a>
          <a
            href="/test-dynamic-redirects"
            className="bg-gray-600 text-white p-4 rounded-lg hover:bg-gray-700 transition-colors text-center"
          >
            <FontAwesomeIcon icon={faShield} className="mr-2" />
            URLs Dinámicas
          </a>
        </div>
      </div>
    </div>
  );
}
