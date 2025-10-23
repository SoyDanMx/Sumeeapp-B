'use client';

import React, { useState, useEffect } from 'react';
import { getUrlDebugInfo, getRedirectUrl, getEmailConfirmationUrl, getPostLoginRedirectUrl, getProfessionalDashboardUrl, getClientDashboardUrl } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDatabase, faGlobe, faShield, faCheckCircle, faExclamationTriangle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

export default function TestDynamicRedirectsPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener información de debug de URLs
    const info = getUrlDebugInfo();
    setDebugInfo(info);
    setLoading(false);
  }, []);

  const testUrls = [
    {
      name: 'Redirect URL',
      url: getRedirectUrl(),
      description: 'URL de callback de autenticación'
    },
    {
      name: 'Email Confirmation URL',
      url: getEmailConfirmationUrl(),
      description: 'URL para confirmación de email'
    },
    {
      name: 'Post Login URL',
      url: getPostLoginRedirectUrl(),
      description: 'URL después del login exitoso'
    },
    {
      name: 'Professional Dashboard URL',
      url: getProfessionalDashboardUrl(),
      description: 'URL del dashboard profesional'
    },
    {
      name: 'Client Dashboard URL',
      url: getClientDashboardUrl(),
      description: 'URL del dashboard de cliente'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faDatabase} spin className="text-4xl text-blue-600 mb-4" />
          <p className="text-lg text-gray-600">Cargando información de URLs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <FontAwesomeIcon icon={faGlobe} className="text-4xl text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Prueba de URLs Dinámicas
          </h1>
          <p className="text-lg text-gray-600">
            Verificación de la solución PKCE con URLs dinámicas basadas en window.location.origin
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Información de Debug */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FontAwesomeIcon icon={faInfoCircle} className="text-blue-600 mr-2" />
              Información de Debug
            </h2>
            
            {debugInfo && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h3 className="font-semibold text-blue-800">Base URL</h3>
                    <p className="text-blue-700 text-sm break-all">{debugInfo.baseUrl}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <h3 className="font-semibold text-green-800">Entorno</h3>
                    <p className="text-green-700 text-sm">{debugInfo.environment}</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Estado del Cliente</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center">
                      <FontAwesomeIcon 
                        icon={debugInfo.isClient ? faCheckCircle : faExclamationTriangle} 
                        className={`mr-2 ${debugInfo.isClient ? 'text-green-600' : 'text-red-600'}`} 
                      />
                      <span>Cliente: {debugInfo.isClient ? 'Sí' : 'No'}</span>
                    </div>
                    <div className="flex items-center">
                      <FontAwesomeIcon 
                        icon={debugInfo.isServer ? faCheckCircle : faExclamationTriangle} 
                        className={`mr-2 ${debugInfo.isServer ? 'text-green-600' : 'text-red-600'}`} 
                      />
                      <span>Servidor: {debugInfo.isServer ? 'Sí' : 'No'}</span>
                    </div>
                  </div>
                </div>

                {debugInfo.vercelUrl && (
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <h3 className="font-semibold text-purple-800">Vercel URL</h3>
                    <p className="text-purple-700 text-sm">{debugInfo.vercelUrl}</p>
                  </div>
                )}

                {debugInfo.siteUrl && (
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <h3 className="font-semibold text-orange-800">Site URL</h3>
                    <p className="text-orange-700 text-sm">{debugInfo.siteUrl}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* URLs de Prueba */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FontAwesomeIcon icon={faShield} className="text-green-600 mr-2" />
              URLs Generadas Dinámicamente
            </h2>
            
            <div className="space-y-4">
              {testUrls.map((testUrl, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">{testUrl.name}</h3>
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{testUrl.description}</p>
                  <div className="bg-gray-50 p-2 rounded text-sm font-mono break-all">
                    {testUrl.url}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Explicación de la Solución */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
            <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
            ¿Por qué esta solución resuelve el PKCE Error?
          </h3>
          <div className="text-green-700 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">❌ Problema Anterior:</h4>
                <ul className="text-sm space-y-1">
                  <li>• URLs hardcodeadas (localhost:3010)</li>
                  <li>• No se adaptaba a producción</li>
                  <li>• Code verifier se perdía entre entornos</li>
                  <li>• Error PKCE persistente</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">✅ Solución Actual:</h4>
                <ul className="text-sm space-y-1">
                  <li>• URLs dinámicas basadas en window.location.origin</li>
                  <li>• Se adapta automáticamente al entorno</li>
                  <li>• Code verifier se mantiene consistente</li>
                  <li>• PKCE funciona en todos los entornos</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-green-300">
              <h4 className="font-semibold text-green-800 mb-2">🔧 Implementación Técnica:</h4>
              <div className="text-sm text-green-700">
                <p><strong>1. Función getBaseUrl():</strong> Detecta automáticamente el entorno (cliente/servidor)</p>
                <p><strong>2. URLs Dinámicas:</strong> Se construyen en tiempo real basándose en el origen actual</p>
                <p><strong>3. Compatibilidad:</strong> Funciona en localhost, Vercel, y cualquier dominio</p>
                <p><strong>4. Seguridad:</strong> Validación de URLs para prevenir ataques de redirección</p>
              </div>
            </div>
          </div>
        </div>

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
            href="/test-oauth-simple"
            className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors text-center"
          >
            <FontAwesomeIcon icon={faGlobe} className="mr-2" />
            Probar OAuth
          </a>
          <a
            href="/login"
            className="bg-gray-600 text-white p-4 rounded-lg hover:bg-gray-700 transition-colors text-center"
          >
            <FontAwesomeIcon icon={faShield} className="mr-2" />
            Probar Login
          </a>
        </div>
      </div>
    </div>
  );
}
