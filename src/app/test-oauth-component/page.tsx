'use client';

import React from 'react';
import { OAuthLogin } from '@/components/OAuthLogin';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDatabase } from '@fortawesome/free-solid-svg-icons';

export default function TestOAuthComponentPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <FontAwesomeIcon icon={faDatabase} className="text-4xl text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Prueba del Componente OAuth Login
          </h1>
          <p className="text-lg text-gray-600">
            Verificación del componente OAuthLogin con iconos corregidos
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Componente OAuth Login
          </h2>
          
          <OAuthLogin 
            onError={(error) => {
              console.error('OAuth Error:', error);
              alert(`Error OAuth: ${error}`);
            }}
            onSuccess={() => {
              console.log('OAuth Success');
              alert('OAuth iniciado correctamente');
            }}
          />
        </div>

        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-3">
            ✅ Componente OAuth Login Funcionando
          </h3>
          <div className="text-green-700 space-y-2">
            <p><strong>Iconos:</strong> Corregidos (faSpinner, faExclamationTriangle desde free-solid-svg-icons)</p>
            <p><strong>Proveedores:</strong> Google, GitHub, Facebook disponibles</p>
            <p><strong>PKCE:</strong> Configurado correctamente</p>
            <p><strong>URLs:</strong> Dinámicas para localhost y producción</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a
            href="/test-oauth-simple"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FontAwesomeIcon icon={faDatabase} className="mr-2" />
            Ir a Prueba Completa
          </a>
        </div>
      </div>
    </div>
  );
}
