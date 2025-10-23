'use client';

import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faCheck, faTimes, faUser, faEnvelope, faPhone, faLock, faGoogle } from '@fortawesome/free-solid-svg-icons';

export default function CompareRegistrationPages() {
  const features = [
    {
      feature: 'Autenticación con Google',
      joinAsPro: false,
      registro: false,
      optimized: false
    },
    {
      feature: 'Campo de contraseña',
      joinAsPro: false,
      registro: true,
      optimized: true
    },
    {
      feature: 'Confirmar contraseña',
      joinAsPro: false,
      registro: true,
      optimized: true
    },
    {
      feature: 'Campo de WhatsApp',
      joinAsPro: true,
      registro: false,
      optimized: true
    },
    {
      feature: 'Validación en tiempo real',
      joinAsPro: true,
      registro: false,
      optimized: true
    },
    {
      feature: 'Mostrar/ocultar contraseña',
      joinAsPro: false,
      registro: false,
      optimized: true
    },
    {
      feature: 'UX/UI moderna',
      joinAsPro: true,
      registro: false,
      optimized: true
    },
    {
      feature: 'Beneficios destacados',
      joinAsPro: true,
      registro: false,
      optimized: true
    },
    {
      feature: 'Selector de tipo de usuario',
      joinAsPro: false,
      registro: true,
      optimized: false
    },
    {
      feature: 'Formulario completo',
      joinAsPro: false,
      registro: true,
      optimized: true
    },
    {
      feature: 'Mensajes de error mejorados',
      joinAsPro: true,
      registro: false,
      optimized: true
    },
    {
      feature: 'Diseño responsive',
      joinAsPro: true,
      registro: true,
      optimized: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Comparación de Páginas de Registro
          </h1>
          <p className="text-lg text-gray-600">
            Análisis de las diferentes opciones de registro para profesionales
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Página Original /join-as-pro */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Página Original</h2>
              <p className="text-gray-600">/join-as-pro</p>
              <div className="mt-4">
                <Link 
                  href="/join-as-pro" 
                  target="_blank"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ver Página
                  <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                </Link>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faTimes} className="text-red-500 mr-2" />
                <span className="text-sm">Sin Google OAuth</span>
              </div>
              <div className="flex items-center">
                <FontAwesomeIcon icon={faLock} className="text-green-500 mr-2" />
                <span className="text-sm">Con campo de contraseña</span>
              </div>
              <div className="flex items-center">
                <FontAwesomeIcon icon={faPhone} className="text-green-500 mr-2" />
                <span className="text-sm">Con campo de WhatsApp</span>
              </div>
              <div className="flex items-center">
                <FontAwesomeIcon icon={faCheck} className="text-green-500 mr-2" />
                <span className="text-sm">Validación avanzada</span>
              </div>
            </div>
          </div>

          {/* Página /registro */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Página /registro</h2>
              <p className="text-gray-600">Formulario completo</p>
              <div className="mt-4">
                <Link 
                  href="/registro" 
                  target="_blank"
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Ver Página
                  <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                </Link>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faTimes} className="text-red-500 mr-2" />
                <span className="text-sm">Sin Google OAuth</span>
              </div>
              <div className="flex items-center">
                <FontAwesomeIcon icon={faLock} className="text-blue-500 mr-2" />
                <span className="text-sm">Incluye contraseña</span>
              </div>
              <div className="flex items-center">
                <FontAwesomeIcon icon={faTimes} className="text-red-500 mr-2" />
                <span className="text-sm">Sin campo de WhatsApp</span>
              </div>
              <div className="flex items-center">
                <FontAwesomeIcon icon={faUser} className="text-blue-500 mr-2" />
                <span className="text-sm">Selector de tipo de usuario</span>
              </div>
            </div>
          </div>

          {/* Página Optimizada */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg shadow-lg p-6 border-2 border-blue-200">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Página Optimizada</h2>
              <p className="text-gray-600">/join-as-pro (Mejorada)</p>
              <div className="mt-4">
                <Link 
                  href="/join-as-pro" 
                  target="_blank"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-lg"
                >
                  Ver Página Mejorada
                  <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                </Link>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faTimes} className="text-red-500 mr-2" />
                <span className="text-sm">Sin Google OAuth (eliminado)</span>
              </div>
              <div className="flex items-center">
                <FontAwesomeIcon icon={faTimes} className="text-red-500 mr-2" />
                <span className="text-sm">Sin campo de contraseña</span>
              </div>
              <div className="flex items-center">
                <FontAwesomeIcon icon={faPhone} className="text-green-500 mr-2" />
                <span className="text-sm">Campo de WhatsApp incluido</span>
              </div>
              <div className="flex items-center">
                <FontAwesomeIcon icon={faCheck} className="text-green-500 mr-2" />
                <span className="text-sm">UX/UI moderna y proactiva</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de comparación detallada */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Comparación Detallada de Características</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Característica
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    /join-as-pro (Original)
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    /registro
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    /join-as-pro (Optimizada)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {features.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.feature}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {item.joinAsPro ? (
                        <FontAwesomeIcon icon={faCheck} className="text-green-500 text-lg" />
                      ) : (
                        <FontAwesomeIcon icon={faTimes} className="text-red-500 text-lg" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {item.registro ? (
                        <FontAwesomeIcon icon={faCheck} className="text-green-500 text-lg" />
                      ) : (
                        <FontAwesomeIcon icon={faTimes} className="text-red-500 text-lg" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {item.optimized ? (
                        <FontAwesomeIcon icon={faCheck} className="text-green-500 text-lg" />
                      ) : (
                        <FontAwesomeIcon icon={faTimes} className="text-red-500 text-lg" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recomendación */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-8 text-white">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Recomendación</h3>
            <p className="text-lg mb-6">
              La página <strong>/join-as-pro</strong> optimizada es la más eficiente y proactiva para el registro de profesionales.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl mb-2">🚀</div>
                <h4 className="font-semibold mb-2">Más Rápida</h4>
                <p className="text-sm opacity-90">Solo 3 campos esenciales</p>
              </div>
              <div>
                <div className="text-3xl mb-2">📱</div>
                <h4 className="font-semibold mb-2">WhatsApp Incluido</h4>
                <p className="text-sm opacity-90">Contacto directo con clientes</p>
              </div>
              <div>
                <div className="text-3xl mb-2">✨</div>
                <h4 className="font-semibold mb-2">UX Moderna</h4>
                <p className="text-sm opacity-90">Diseño atractivo y funcional</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enlaces de prueba */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            href="/join-as-pro" 
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-blue-200"
          >
            <div className="text-center">
              <FontAwesomeIcon icon={faUser} className="text-3xl text-blue-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Página Optimizada</h3>
              <p className="text-sm text-gray-600 mb-4">Registro profesional mejorado</p>
              <div className="text-blue-600 font-medium">Probar Ahora →</div>
            </div>
          </Link>

          <Link 
            href="/registro" 
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-green-200"
          >
            <div className="text-center">
              <FontAwesomeIcon icon={faUser} className="text-3xl text-green-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Página /registro</h3>
              <p className="text-sm text-gray-600 mb-4">Formulario completo con selector</p>
              <div className="text-green-600 font-medium">Probar Ahora →</div>
            </div>
          </Link>

          <Link 
            href="/debug-professional-registration" 
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-purple-200"
          >
            <div className="text-center">
              <FontAwesomeIcon icon={faUser} className="text-3xl text-purple-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Debug</h3>
              <p className="text-sm text-gray-600 mb-4">Verificar estado del usuario</p>
              <div className="text-purple-600 font-medium">Debug Ahora →</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
