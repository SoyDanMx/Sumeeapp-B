'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faKey, faCopy, faCheckCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function TestCredentialsPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>('');

  const testCredentials = {
    professional: {
      email: 'profesional@sumeeapp.com',
      password: 'TestProfesional123!',
      name: 'Juan Pérez - Profesional'
    },
    client: {
      email: 'cliente@sumeeapp.com', 
      password: 'TestCliente123!',
      name: 'María García - Cliente'
    }
  };

  const createTestUser = async (userType: 'professional' | 'client') => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const credentials = testCredentials[userType];
      
      // Intentar crear el usuario
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.name,
            registration_type: userType === 'professional' ? 'profesional' : 'client'
          }
        }
      });

      if (signUpError) {
        // Si el usuario ya existe, intentar hacer login
        if (signUpError.message.includes('already registered')) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password
          });

          if (signInError) {
            throw signInError;
          }

          setSuccess(true);
          // Redirigir al dashboard correspondiente
          setTimeout(() => {
            if (userType === 'professional') {
              window.location.href = '/professional-dashboard';
            } else {
              window.location.href = '/dashboard/client';
            }
          }, 2000);
        } else {
          throw signUpError;
        }
      } else {
        setSuccess(true);
        // Redirigir al dashboard correspondiente
        setTimeout(() => {
          if (userType === 'professional') {
            window.location.href = '/professional-dashboard';
          } else {
            window.location.href = '/dashboard/client';
          }
        }, 2000);
      }
    } catch (err: any) {
      console.error('Error creating test user:', err);
      setError(err.message || 'Error al crear usuario de prueba');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Credenciales de Prueba
          </h1>
          <p className="text-lg text-gray-600">
            Usa estas credenciales para probar el sistema como profesional o cliente
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Credenciales de Profesional */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <FontAwesomeIcon icon={faUser} className="text-blue-600 text-2xl mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Profesional</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email:
                </label>
                <div className="flex items-center space-x-2">
                  <code className="bg-gray-100 px-3 py-2 rounded text-sm flex-1">
                    {testCredentials.professional.email}
                  </code>
                  <button
                    onClick={() => copyToClipboard(testCredentials.professional.email)}
                    className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded text-sm"
                  >
                    <FontAwesomeIcon icon={faCopy} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña:
                </label>
                <div className="flex items-center space-x-2">
                  <code className="bg-gray-100 px-3 py-2 rounded text-sm flex-1">
                    {testCredentials.professional.password}
                  </code>
                  <button
                    onClick={() => copyToClipboard(testCredentials.professional.password)}
                    className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded text-sm"
                  >
                    <FontAwesomeIcon icon={faCopy} />
                  </button>
                </div>
              </div>

              <button
                onClick={() => createTestUser('professional')}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <FontAwesomeIcon icon={faSpinner} spin />
                ) : (
                  <FontAwesomeIcon icon={faUser} />
                )}
                <span>
                  {loading ? 'Creando...' : 'Ingresar como Profesional'}
                </span>
              </button>
            </div>
          </div>

          {/* Credenciales de Cliente */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <FontAwesomeIcon icon={faUser} className="text-green-600 text-2xl mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Cliente</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email:
                </label>
                <div className="flex items-center space-x-2">
                  <code className="bg-gray-100 px-3 py-2 rounded text-sm flex-1">
                    {testCredentials.client.email}
                  </code>
                  <button
                    onClick={() => copyToClipboard(testCredentials.client.email)}
                    className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded text-sm"
                  >
                    <FontAwesomeIcon icon={faCopy} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña:
                </label>
                <div className="flex items-center space-x-2">
                  <code className="bg-gray-100 px-3 py-2 rounded text-sm flex-1">
                    {testCredentials.client.password}
                  </code>
                  <button
                    onClick={() => copyToClipboard(testCredentials.client.password)}
                    className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded text-sm"
                  >
                    <FontAwesomeIcon icon={faCopy} />
                  </button>
                </div>
              </div>

              <button
                onClick={() => createTestUser('client')}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <FontAwesomeIcon icon={faSpinner} spin />
                ) : (
                  <FontAwesomeIcon icon={faUser} />
                )}
                <span>
                  {loading ? 'Creando...' : 'Ingresar como Cliente'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Mensajes de Estado */}
        {success && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-xl mr-3" />
              <p className="text-green-800 font-medium">
                ¡Usuario creado exitosamente! Redirigiendo al dashboard...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faKey} className="text-red-600 text-xl mr-3" />
              <p className="text-red-800 font-medium">
                Error: {error}
              </p>
            </div>
          </div>
        )}

        {/* Información adicional */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Información Importante:
          </h3>
          <ul className="text-blue-800 space-y-2">
            <li>• Estas credenciales son solo para pruebas en desarrollo</li>
            <li>• Los usuarios se crean automáticamente si no existen</li>
            <li>• El sistema detectará automáticamente el tipo de usuario</li>
            <li>• Los profesionales van al dashboard profesional</li>
            <li>• Los clientes van al dashboard de cliente</li>
          </ul>
        </div>
      </div>
    </div>
  );
}