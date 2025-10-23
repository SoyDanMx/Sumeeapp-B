'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { getUrlDebugInfo } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDatabase, faExclamationTriangle, faCheckCircle, faSpinner, faBug, faShield } from '@fortawesome/free-solid-svg-icons';

export default function DebugPKCEPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [pkceTest, setPkceTest] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Obtener información de debug
    const info = getUrlDebugInfo();
    setDebugInfo(info);
  }, []);

  const testPKCEFlow = async () => {
    setLoading(true);
    setError(null);
    setPkceTest(null);

    try {
      console.log('🔍 INICIANDO DIAGNÓSTICO PKCE...');

      // 1. Verificar configuración del cliente Supabase
      const clientConfig = {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing',
        baseUrl: getUrlDebugInfo().baseUrl,
        redirectUrl: getUrlDebugInfo().redirectUrl,
        emailConfirmationUrl: getUrlDebugInfo().emailConfirmationUrl
      };

      console.log('📊 Configuración del cliente:', clientConfig);

      // 2. Verificar sesión actual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('🔐 Sesión actual:', { session: sessionError ? 'Error' : 'Present', error: sessionError });

      // 3. Verificar usuario actual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('👤 Usuario actual:', { user: userError ? 'Error' : 'Present', error: userError });

      // 4. Verificar configuración de PKCE
      const pkceConfig = {
        flowType: 'pkce',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? 'localStorage' : 'undefined',
        storageKey: 'sb-auth-token'
      };

      console.log('🔧 Configuración PKCE:', pkceConfig);

      // 5. Verificar localStorage para PKCE
      const localStorageData = typeof window !== 'undefined' ? {
        'sb-auth-token': localStorage.getItem('sb-auth-token'),
        'supabase.auth.token': localStorage.getItem('supabase.auth.token'),
        [`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`]: 
          localStorage.getItem(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`)
      } : {};

      console.log('💾 LocalStorage PKCE:', localStorageData);

      // 6. Verificar URL actual y parámetros
      const currentUrl = typeof window !== 'undefined' ? window.location.href : 'Server';
      const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const urlParamsData = urlParams ? {
        code: urlParams.get('code'),
        state: urlParams.get('state'),
        error: urlParams.get('error'),
        error_description: urlParams.get('error_description')
      } : {};

      console.log('🌐 URL actual:', currentUrl);
      console.log('📋 Parámetros URL:', urlParamsData);

      // 7. Verificar configuración de Supabase Dashboard
      const dashboardConfig = {
        siteUrl: 'Configurado en Supabase Dashboard',
        redirectUrls: 'Configurado en Supabase Dashboard',
        note: 'Verificar manualmente en Supabase Dashboard > Authentication > URL Configuration'
      };

      const result = {
        timestamp: new Date().toISOString(),
        clientConfig,
        session: { present: !!session, error: sessionError?.message },
        user: { present: !!user, error: userError?.message },
        pkceConfig,
        localStorageData,
        currentUrl,
        urlParams: urlParamsData,
        dashboardConfig,
        recommendations: [] as string[]
      };

      // 8. Generar recomendaciones
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        result.recommendations.push('❌ NEXT_PUBLIC_SUPABASE_URL no está configurado');
      }
      if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        result.recommendations.push('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY no está configurado');
      }
      if (urlParamsData.code && !urlParamsData.state) {
        result.recommendations.push('⚠️ Código presente pero sin state - posible problema PKCE');
      }
      if (urlParamsData.error) {
        result.recommendations.push(`❌ Error en URL: ${urlParamsData.error} - ${urlParamsData.error_description}`);
      }
      if (!localStorageData['sb-auth-token']) {
        result.recommendations.push('⚠️ No hay token de autenticación en localStorage');
      }

      setPkceTest(result);
      console.log('✅ Diagnóstico PKCE completado:', result);

    } catch (err: any) {
      console.error('❌ Error en diagnóstico PKCE:', err);
      setError(err.message || 'Error durante el diagnóstico');
    } finally {
      setLoading(false);
    }
  };

  const clearAuthData = async () => {
    try {
      console.log('🧹 LIMPIANDO DATOS DE AUTENTICACIÓN...');
      
      // Cerrar sesión
      await supabase.auth.signOut();
      
      // Limpiar localStorage
      if (typeof window !== 'undefined') {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.includes('supabase') || key.includes('sb-')) {
            localStorage.removeItem(key);
          }
        });
      }
      
      console.log('✅ Datos de autenticación limpiados');
      setPkceTest(null);
      setError(null);
      
    } catch (err: any) {
      console.error('❌ Error limpiando datos:', err);
      setError(err.message || 'Error limpiando datos');
    }
  };

  const testSignUp = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🧪 PROBANDO SIGNUP CON PKCE...');
      
      const testEmail = `test-pkce-${Date.now()}@sumeeapp.com`;
      const testPassword = 'TestPKCE123!';
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          emailRedirectTo: getEmailConfirmationUrl(),
          data: {
            full_name: 'Test PKCE User',
            registration_type: 'profesional'
          }
        }
      });

      if (signUpError) {
        throw new Error(`Error en signUp: ${signUpError.message}`);
      }

      console.log('✅ SignUp exitoso:', data);
      setError(null);
      
    } catch (err: any) {
      console.error('❌ Error en test signUp:', err);
      setError(err.message || 'Error en test signUp');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <FontAwesomeIcon icon={faBug} className="text-4xl text-red-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Diagnóstico PKCE Avanzado
          </h1>
          <p className="text-lg text-gray-600">
            Herramienta completa para diagnosticar y solucionar el error PKCE
          </p>
        </div>

        {/* Información de Debug */}
        {debugInfo && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FontAwesomeIcon icon={faDatabase} className="text-blue-600 mr-2" />
              Información del Sistema
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Configuración Base</h3>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p><strong>Base URL:</strong> {debugInfo.baseUrl}</p>
                    <p><strong>Entorno:</strong> {debugInfo.environment}</p>
                    <p><strong>Cliente:</strong> {debugInfo.isClient ? 'Sí' : 'No'}</p>
                    <p><strong>Servidor:</strong> {debugInfo.isServer ? 'Sí' : 'No'}</p>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">URLs Generadas</h3>
                  <div className="text-sm text-green-700 space-y-1">
                    <p><strong>Redirect URL:</strong> {debugInfo.redirectUrl}</p>
                    <p><strong>Email Confirmation:</strong> {debugInfo.emailConfirmationUrl}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">Variables de Entorno</h3>
                  <div className="text-sm text-purple-700 space-y-1">
                    <p><strong>Vercel URL:</strong> {debugInfo.vercelUrl || 'No configurado'}</p>
                    <p><strong>Site URL:</strong> {debugInfo.siteUrl || 'No configurado'}</p>
                  </div>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-800 mb-2">Estado Actual</h3>
                  <div className="text-sm text-orange-700 space-y-1">
                    <p><strong>URL Actual:</strong> {typeof window !== 'undefined' ? window.location.href : 'Server'}</p>
                    <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controles de Prueba */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Diagnóstico PKCE</h3>
            <p className="text-gray-600 mb-4">Ejecuta un diagnóstico completo del flujo PKCE</p>
            <button
              onClick={testPKCEFlow}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faBug} />}
              <span>{loading ? 'Diagnosticando...' : 'Ejecutar Diagnóstico'}</span>
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Probar SignUp</h3>
            <p className="text-gray-600 mb-4">Prueba el registro con PKCE</p>
            <button
              onClick={testSignUp}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faCheckCircle} />}
              <span>{loading ? 'Probando...' : 'Probar SignUp'}</span>
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Limpiar Datos</h3>
            <p className="text-gray-600 mb-4">Limpia todos los datos de autenticación</p>
            <button
              onClick={clearAuthData}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
            >
              <FontAwesomeIcon icon={faShield} />
              <span>Limpiar Datos</span>
            </button>
          </div>
        </div>

        {/* Resultados del Diagnóstico */}
        {pkceTest && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 mr-2" />
              Resultados del Diagnóstico
            </h2>
            
            <div className="space-y-6">
              {/* Configuración del Cliente */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Configuración del Cliente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Supabase URL:</strong> {pkceTest.clientConfig.url ? 'Configurado' : 'No configurado'}</p>
                    <p><strong>Anon Key:</strong> {pkceTest.clientConfig.anonKey}</p>
                    <p><strong>Base URL:</strong> {pkceTest.clientConfig.baseUrl}</p>
                  </div>
                  <div>
                    <p><strong>Redirect URL:</strong> {pkceTest.clientConfig.redirectUrl}</p>
                    <p><strong>Email Confirmation:</strong> {pkceTest.clientConfig.emailConfirmationUrl}</p>
                  </div>
                </div>
              </div>

              {/* Estado de Autenticación */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Estado de Autenticación</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Sesión:</strong> {pkceTest.session.present ? 'Presente' : 'Ausente'}</p>
                    {pkceTest.session.error && <p className="text-red-600"><strong>Error:</strong> {pkceTest.session.error}</p>}
                  </div>
                  <div>
                    <p><strong>Usuario:</strong> {pkceTest.user.present ? 'Presente' : 'Ausente'}</p>
                    {pkceTest.user.error && <p className="text-red-600"><strong>Error:</strong> {pkceTest.user.error}</p>}
                  </div>
                </div>
              </div>

              {/* Parámetros de URL */}
              {Object.keys(pkceTest.urlParams).length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Parámetros de URL</h3>
                  <div className="text-sm space-y-1">
                    {Object.entries(pkceTest.urlParams).map(([key, value]) => (
                      <p key={key}><strong>{key}:</strong> {value || 'No presente'}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* LocalStorage */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">LocalStorage PKCE</h3>
                <div className="text-sm space-y-1">
                  {Object.entries(pkceTest.localStorageData).map(([key, value]) => (
                    <p key={key}><strong>{key}:</strong> {value ? 'Presente' : 'Ausente'}</p>
                  ))}
                </div>
              </div>

              {/* Recomendaciones */}
              {pkceTest.recommendations.length > 0 && (
                <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800 mb-3">Recomendaciones</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {pkceTest.recommendations.map((rec: string, index: number) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
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
            href="/join-as-pro"
            className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            <FontAwesomeIcon icon={faDatabase} className="mr-2" />
            Probar Registro
          </a>
          <a
            href="/test-dynamic-redirects"
            className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors text-center"
          >
            <FontAwesomeIcon icon={faShield} className="mr-2" />
            Probar URLs Dinámicas
          </a>
          <a
            href="/login"
            className="bg-gray-600 text-white p-4 rounded-lg hover:bg-gray-700 transition-colors text-center"
          >
            <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
            Probar Login
          </a>
        </div>
      </div>
    </div>
  );
}
