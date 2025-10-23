'use client';

import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faBug, faArrowRight } from '@fortawesome/free-solid-svg-icons';

export default function TestCallbackErrorPage() {
  const testErrors = [
    {
      error: 'auth_callback_error',
      description: 'Error en la confirmación del email',
      url: '/login?error=auth_callback_error&details=Error%20exchanging%20code%20for%20session'
    },
    {
      error: 'profile_creation_error',
      description: 'Error al crear perfil',
      url: '/login?error=profile_creation_error&details=Failed%20to%20insert%20profile'
    },
    {
      error: 'profile_check_error',
      description: 'Error al verificar perfil',
      url: '/login?error=profile_check_error&details=Database%20connection%20failed'
    },
    {
      error: 'unexpected_error',
      description: 'Error inesperado',
      url: '/login?error=unexpected_error&details=Unexpected%20server%20error'
    },
    {
      error: 'no_code_provided',
      description: 'Sin código de confirmación',
      url: '/login?error=no_code_provided'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <FontAwesomeIcon icon={faBug} className="text-4xl text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Prueba de Errores de Callback
          </h1>
          <p className="text-lg text-gray-600">
            Simula diferentes errores que pueden ocurrir durante la confirmación de email
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testErrors.map((testError, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {testError.error}
                </h3>
              </div>
              
              <p className="text-gray-600 mb-4">
                {testError.description}
              </p>
              
              <Link
                href={testError.url}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Probar Error</span>
                <FontAwesomeIcon icon={faArrowRight} />
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            ¿Cómo usar esta página?
          </h3>
          <div className="text-blue-800 space-y-2">
            <p>1. Haz clic en cualquier botón "Probar Error"</p>
            <p>2. Serás redirigido a la página de login con el error simulado</p>
            <p>3. Verifica que el mensaje de error se muestre correctamente</p>
            <p>4. Prueba el enlace "Intentar registro nuevamente"</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <FontAwesomeIcon icon={faArrowRight} className="mr-2" />
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
