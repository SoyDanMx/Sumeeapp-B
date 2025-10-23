'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheckCircle, faExclamationTriangle, faUser, faEnvelope, faPhone, faLock } from '@fortawesome/free-solid-svg-icons';

export default function TestProfessionalRegistrationPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testRegistration = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Datos de prueba para profesional
      const testData = {
        email: `test-profesional-${Date.now()}@sumeeapp.com`,
        password: 'TestProfesional123!',
        fullName: 'Juan Pérez - Profesional',
        whatsapp: '+52 55 1234 5678'
      };

      console.log('🧪 TESTING PROFESSIONAL REGISTRATION...');
      console.log('Test data:', testData);

      // Establecer cookie temporal
      document.cookie = `registration_type=profesional; path=/; max-age=3600; SameSite=Lax`;
      console.log('🍪 Cookie establecida: registration_type=profesional');

      // Registrar usuario
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: testData.email,
        password: testData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: testData.fullName,
            whatsapp: testData.whatsapp,
            registration_type: 'profesional',
            profession: 'Electricista',
            descripcion_perfil: 'Profesional verificado en Sumee App'
          }
        }
      });

      if (signUpError) {
        throw new Error(`Error en registro: ${signUpError.message}`);
      }

      if (data.user) {
        console.log('✅ USER CREATED SUCCESSFULLY:', data.user.id);
        
        setResult({
          success: true,
          message: 'Usuario creado exitosamente',
          userId: data.user.id,
          email: data.user.email,
          needsConfirmation: !data.user.email_confirmed_at,
          nextStep: 'Revisa tu email para confirmar la cuenta'
        });
      } else {
        throw new Error('No se pudo crear el usuario');
      }

    } catch (err: any) {
      console.error('Test registration error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testExistingUser = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Intentar iniciar sesión con credenciales de prueba
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'profesional@sumeeapp.com',
        password: 'TestProfesional123!'
      });

      if (signInError) {
        throw new Error(`Error en inicio de sesión: ${signInError.message}`);
      }

      if (data.user) {
        setResult({
          success: true,
          message: 'Inicio de sesión exitoso',
          userId: data.user.id,
          email: data.user.email,
          nextStep: 'Redirigiendo al dashboard...'
        });

        // Redirigir al dashboard
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      }

    } catch (err: any) {
      console.error('Test sign in error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <FontAwesomeIcon icon={faUser} className="text-4xl text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Prueba de Registro Profesional
          </h1>
          <p className="text-lg text-gray-600">
            Herramientas para probar el flujo completo de registro de profesionales
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Prueba de Registro Nuevo */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <FontAwesomeIcon icon={faEnvelope} className="text-2xl text-green-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                Registro Nuevo
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              Prueba el registro de un nuevo profesional con datos de prueba.
            </p>
            <button
              onClick={testRegistration}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <FontAwesomeIcon icon={faUser} />
              )}
              <span>{loading ? 'Probando...' : 'Probar Registro Nuevo'}</span>
            </button>
          </div>

          {/* Prueba de Usuario Existente */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <FontAwesomeIcon icon={faLock} className="text-2xl text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                Usuario Existente
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              Prueba el inicio de sesión con credenciales de profesional existente.
            </p>
            <button
              onClick={testExistingUser}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <FontAwesomeIcon icon={faLock} />
              )}
              <span>{loading ? 'Probando...' : 'Probar Usuario Existente'}</span>
            </button>
          </div>
        </div>

        {/* Resultados */}
        {(result || error) && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Resultado de la Prueba</h3>
              <button
                onClick={clearResults}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Limpiar
              </button>
            </div>
            
            {result && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 mr-2" />
                  <h4 className="text-lg font-semibold text-green-800">{result.message}</h4>
                </div>
                <div className="text-green-700 space-y-1">
                  <p><strong>User ID:</strong> {result.userId}</p>
                  <p><strong>Email:</strong> {result.email}</p>
                  {result.needsConfirmation && (
                    <p><strong>Estado:</strong> Necesita confirmación de email</p>
                  )}
                  <p><strong>Siguiente paso:</strong> {result.nextStep}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 mr-2" />
                  <h4 className="text-lg font-semibold text-red-800">Error</h4>
                </div>
                <p className="text-red-700">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* Información de Debug */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            🔍 Información de Debug
          </h3>
          <div className="text-blue-700 space-y-2">
            <p><strong>Callback URL:</strong> <code>/auth/callback</code></p>
            <p><strong>Cookie de registro:</strong> <code>registration_type=profesional</code></p>
            <p><strong>Metadatos incluidos:</strong> full_name, whatsapp, registration_type, profession</p>
            <p><strong>Redirección:</strong> /dashboard (RoleRouter se encarga de la redirección final)</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a
            href="/join-as-pro"
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <FontAwesomeIcon icon={faUser} className="mr-2" />
            Ir a Registro Profesional
          </a>
        </div>
      </div>
    </div>
  );
}