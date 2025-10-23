'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useProfessionalRegistration } from '@/hooks/useProfessionalRegistration';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheckCircle, faExclamationTriangle, faUser, faEnvelope, faDatabase } from '@fortawesome/free-solid-svg-icons';

export default function TestRPCRegistrationPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { registerProfessional, createProfileAfterConfirmation } = useProfessionalRegistration();

  const testRPCRegistration = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 TESTING RPC REGISTRATION...');

      const testData = {
        fullName: `Test Professional ${Date.now()}`,
        email: `test-rpc-${Date.now()}@sumeeapp.com`,
        password: 'TestRPC123!',
        whatsapp: '+52 55 1234 5678',
        profession: 'Electricista',
        descripcionPerfil: 'Profesional de prueba con RPC'
      };

      console.log('Test data:', testData);

      const result = await registerProfessional(testData);

      if (result.success) {
        setResult({
          success: true,
          message: result.message,
          userId: result.userId,
          profileId: result.profileId,
          professionalId: result.professionalId,
          needsEmailConfirmation: result.needsEmailConfirmation,
          nextStep: result.needsEmailConfirmation 
            ? 'Revisa tu email para confirmar' 
            : 'Perfil creado exitosamente'
        });
      } else {
        setResult({
          success: false,
          message: result.message,
          error: result.error
        });
      }

    } catch (err: any) {
      console.error('Test RPC registration error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testProfileCreation = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 TESTING PROFILE CREATION AFTER CONFIRMATION...');

      const result = await createProfileAfterConfirmation();

      if (result.success) {
        setResult({
          success: true,
          message: result.message,
          userId: result.userId,
          profileId: result.profileId,
          professionalId: result.professionalId,
          nextStep: 'Perfil creado exitosamente'
        });
      } else {
        setResult({
          success: false,
          message: result.message,
          error: result.error
        });
      }

    } catch (err: any) {
      console.error('Test profile creation error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testRPCFunction = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 TESTING RPC FUNCTION DIRECTLY...');

      // Probar la función RPC directamente
      const { data, error: rpcError } = await supabase.rpc('create_professional_complete', {
        p_full_name: 'Test RPC Direct',
        p_email: 'test-rpc-direct@sumeeapp.com',
        p_profession: 'Plomero',
        p_whatsapp: '+52 55 9999 8888',
        p_descripcion_perfil: 'Prueba directa de RPC'
      });

      if (rpcError) {
        setResult({
          success: false,
          message: 'Error en función RPC',
          error: rpcError.message,
          nextStep: 'Esto es normal si no estás autenticado'
        });
      } else {
        setResult({
          success: true,
          message: 'Función RPC ejecutada exitosamente',
          data: data,
          nextStep: 'Verificar en base de datos'
        });
      }

    } catch (err: any) {
      console.error('Test RPC function error:', err);
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
          <FontAwesomeIcon icon={faDatabase} className="text-4xl text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Prueba de Registro con RPC
          </h1>
          <p className="text-lg text-gray-600">
            Herramientas para probar el flujo transaccional de registro de profesionales
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Prueba de Registro RPC */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <FontAwesomeIcon icon={faUser} className="text-2xl text-green-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                Registro RPC
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              Prueba el registro completo usando RPC transaccional.
            </p>
            <button
              onClick={testRPCRegistration}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <FontAwesomeIcon icon={faUser} />
              )}
              <span>{loading ? 'Probando...' : 'Probar Registro RPC'}</span>
            </button>
          </div>

          {/* Prueba de Creación de Perfil */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <FontAwesomeIcon icon={faEnvelope} className="text-2xl text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                Crear Perfil
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              Prueba la creación de perfil después de confirmación.
            </p>
            <button
              onClick={testProfileCreation}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <FontAwesomeIcon icon={faEnvelope} />
              )}
              <span>{loading ? 'Probando...' : 'Probar Crear Perfil'}</span>
            </button>
          </div>

          {/* Prueba de Función RPC */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <FontAwesomeIcon icon={faDatabase} className="text-2xl text-yellow-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                Función RPC
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              Prueba la función RPC directamente.
            </p>
            <button
              onClick={testRPCFunction}
              disabled={loading}
              className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <FontAwesomeIcon icon={faDatabase} />
              )}
              <span>{loading ? 'Probando...' : 'Probar RPC Directo'}</span>
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
              <div className={`border rounded-lg p-4 ${
                result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center mb-2">
                  {result.success ? (
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 mr-2" />
                  ) : (
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 mr-2" />
                  )}
                  <h4 className={`text-lg font-semibold ${
                    result.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.message}
                  </h4>
                </div>
                <div className={`space-y-1 ${
                  result.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {result.userId && <p><strong>User ID:</strong> {result.userId}</p>}
                  {result.profileId && <p><strong>Profile ID:</strong> {result.profileId}</p>}
                  {result.professionalId && <p><strong>Professional ID:</strong> {result.professionalId}</p>}
                  {result.error && <p><strong>Error:</strong> {result.error}</p>}
                  {result.needsEmailConfirmation && (
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
            🔍 Información de Debug - Flujo RPC Transaccional
          </h3>
          <div className="text-blue-700 space-y-2">
            <p><strong>1. Registro:</strong> Usuario se registra con <code>auth.signUp()</code></p>
            <p><strong>2. Confirmación:</strong> Usuario confirma email</p>
            <p><strong>3. RPC:</strong> Se llama a <code>create_professional_complete</code></p>
            <p><strong>4. Transacción:</strong> Se crean perfil y datos profesionales atómicamente</p>
            <p><strong>5. Resultado:</strong> Usuario y perfil se crean juntos o ninguno</p>
            <p><strong>6. Redirección:</strong> Al dashboard profesional</p>
          </div>
        </div>

        <div className="mt-6 text-center space-x-4">
          <a
            href="/join-as-pro"
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <FontAwesomeIcon icon={faUser} className="mr-2" />
            Ir a Registro Profesional
          </a>
          <a
            href="/auth/confirm-profile"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
            Confirmar Perfil
          </a>
        </div>
      </div>
    </div>
  );
}
