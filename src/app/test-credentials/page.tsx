'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faKey, faCrown, faCheckCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

export default function TestCredentialsPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createTestClient = async () => {
    setIsCreating(true);
    setMessage(null);
    setError(null);

    try {
      const testEmail = 'cliente@sumeeapp.com';
      const testPassword = 'TestPassword123!';
      const testName = 'Cliente Demo Premium';

      // Intentar crear usuario
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            full_name: testName,
          }
        }
      });

      if (authError && authError.message.includes('already registered')) {
        setMessage('✅ Usuario de prueba ya existe. Puedes usar estas credenciales:');
      } else if (authError) {
        throw authError;
      } else {
        setMessage('✅ Usuario de prueba creado exitosamente!');
      }

      // Intentar crear/actualizar perfil con membresía premium
      if (authData?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            user_id: authData.user.id,
            full_name: testName,
            email: testEmail,
            role: 'client',
            membership_status: 'premium',
            phone: '+525512345678',
            profession: null,
            work_area: 'CDMX'
          });

        if (profileError) {
          console.warn('Error updating profile:', profileError);
        }
      }

    } catch (err: any) {
      setError(err.message || 'Error al crear usuario de prueba');
    } finally {
      setIsCreating(false);
    }
  };

  const testCredentials = {
    email: 'cliente@sumeeapp.com',
    password: 'TestPassword123!',
    name: 'Cliente Demo Premium'
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🧪 Credenciales de Prueba
          </h1>
          <p className="text-gray-600">
            Usuario cliente con membresía premium para probar funcionalidades
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Credenciales */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <FontAwesomeIcon icon={faUser} className="text-2xl text-blue-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Credenciales de Cliente Premium</h2>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center mb-2">
                  <FontAwesomeIcon icon={faKey} className="text-blue-600 mr-2" />
                  <span className="font-semibold text-blue-800">Email:</span>
                </div>
                <code className="text-blue-900 font-mono text-lg">{testCredentials.email}</code>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center mb-2">
                  <FontAwesomeIcon icon={faKey} className="text-green-600 mr-2" />
                  <span className="font-semibold text-green-800">Contraseña:</span>
                </div>
                <code className="text-green-900 font-mono text-lg">{testCredentials.password}</code>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center mb-2">
                  <FontAwesomeIcon icon={faCrown} className="text-purple-600 mr-2" />
                  <span className="font-semibold text-purple-800">Membresía:</span>
                </div>
                <span className="text-purple-900 font-semibold">Premium (Pagada)</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <a
                href="/login"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                Ir a Login
              </a>
            </div>
          </div>

          {/* Acciones */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <FontAwesomeIcon icon={faCheckCircle} className="text-2xl text-green-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Preparar Usuario de Prueba</h2>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-gray-600">
                Haz clic en el botón para crear o verificar que el usuario de prueba existe en la base de datos.
              </p>
              
              {message && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 mr-2" />
                    <span className="text-green-800">{message}</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 mr-2" />
                    <span className="text-red-800">{error}</span>
                  </div>
                </div>
              )}

              <button
                onClick={createTestClient}
                disabled={isCreating}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                {isCreating ? 'Creando...' : 'Crear/Verificar Usuario de Prueba'}
              </button>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-800 mb-2">Pasos para probar:</h3>
              <ol className="text-sm text-yellow-700 space-y-1">
                <li>1. Haz clic en "Crear/Verificar Usuario"</li>
                <li>2. Ve a /login e inicia sesión</li>
                <li>3. Ve a "Mi Panel" → "Dashboard Cliente"</li>
                <li>4. Explora el mapa y haz click en los marcadores</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Funcionalidades que puedes probar */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">🎯 Funcionalidades del Cliente Premium:</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mr-2" />
                <span>Dashboard exclusivo para clientes pagadores</span>
              </div>
              <div className="flex items-center">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mr-2" />
                <span>Mapa con profesionales verificados</span>
              </div>
              <div className="flex items-center">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mr-2" />
                <span>Filtrado por tipo de servicio</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mr-2" />
                <span>Marcadores personalizados con foto y oficio</span>
              </div>
              <div className="flex items-center">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mr-2" />
                <span>Tarjeta de verificación ID al hacer click</span>
              </div>
              <div className="flex items-center">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mr-2" />
                <span>Información completa del profesional</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
