'use client';

import React, { useState } from 'react';
import { verifyPKCEStatus, clearPKCEState, regeneratePKCEVerifier, testPKCEFlow, getPKCEInfo } from '@/lib/supabase/pkce-fix';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBug, faCheckCircle, faExclamationTriangle, faSpinner, faShield, faDatabase, faCog } from '@fortawesome/free-solid-svg-icons';

export default function TestPKCEFixPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [pkceInfo, setPkceInfo] = useState<any>(null);

  const runDiagnostic = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      console.log('🔍 EJECUTANDO DIAGNÓSTICO PKCE...');
      
      const status = await verifyPKCEStatus();
      const info = getPKCEInfo();
      
      setResults(status);
      setPkceInfo(info);
      
      console.log('✅ Diagnóstico completado:', status);
      console.log('📊 Información PKCE:', info);

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
      setPkceInfo(null);
      
      console.log('✅ Estado limpiado');

    } catch (err: any) {
      console.error('❌ Error limpiando estado:', err);
      setError(err.message || 'Error limpiando estado');
    } finally {
      setLoading(false);
    }
  };

  const regenerateVerifier = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 REGENERANDO CODE VERIFIER...');
      
      await regeneratePKCEVerifier();
      
      console.log('✅ Code verifier regenerado');

    } catch (err: any) {
      console.error('❌ Error regenerando verifier:', err);
      setError(err.message || 'Error regenerando verifier');
    } finally {
      setLoading(false);
    }
  };

  const testFlow = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      console.log('🧪 PROBANDO FLUJO PKCE...');
      
      const flowResult = await testPKCEFlow();
      setResults(flowResult);
      
      console.log('✅ Prueba de flujo completada:', flowResult);

    } catch (err: any) {
      console.error('❌ Error en prueba de flujo:', err);
      setError(err.message || 'Error en prueba de flujo');
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
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <FontAwesomeIcon icon={faBug} className="text-4xl text-red-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Solución PKCE Específica
          </h1>
          <p className="text-lg text-gray-600">
            Herramientas avanzadas para diagnosticar y solucionar el error PKCE en Supabase
          </p>
        </div>

        {/* Controles de Prueba */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            <p className="text-gray-600 mb-4">Limpia completamente el estado PKCE</p>
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
              <FontAwesomeIcon icon={faCog} className="text-yellow-600 mr-2" />
              Regenerar
            </h3>
            <p className="text-gray-600 mb-4">Regenera el code verifier</p>
            <button
              onClick={regenerateVerifier}
              disabled={loading}
              className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faCog} />}
              <span>{loading ? 'Regenerando...' : 'Regenerar'}</span>
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FontAwesomeIcon icon={faDatabase} className="text-green-600 mr-2" />
              Probar Flujo
            </h3>
            <p className="text-gray-600 mb-4">Prueba el flujo PKCE completo</p>
            <button
              onClick={testFlow}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faDatabase} />}
              <span>{loading ? 'Probando...' : 'Probar'}</span>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              {/* Steps (para testFlow) */}
              {results.steps && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Pasos del Flujo</h3>
                  <div className="space-y-2">
                    {results.steps.map((step: any, index: number) => (
                      <div key={index} className="flex items-center text-sm">
                        <FontAwesomeIcon 
                          icon={step.success ? faCheckCircle : faExclamationTriangle} 
                          className={`mr-2 ${step.success ? 'text-green-600' : 'text-red-600'}`} 
                        />
                        <span className="font-medium">{step.step}:</span>
                        <span className="ml-2 text-gray-600">{step.message}</span>
                      </div>
                    ))}
                  </div>
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
                      Object.entries(pkceInfo.urlParams).map(([key, value]) => (
                        <p key={key}><strong>{key}:</strong> {value || 'No presente'}</p>
                      ))
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
            href="/debug-pkce"
            className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            <FontAwesomeIcon icon={faBug} className="mr-2" />
            Diagnóstico Completo
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
