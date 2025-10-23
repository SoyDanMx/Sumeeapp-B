'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheckCircle, faExclamationTriangle, faEnvelope, faUser, faBug } from '@fortawesome/free-solid-svg-icons';

export default function TestEmailConfirmationPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testEmailConfirmation = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 TESTING EMAIL CONFIRMATION FLOW...');

      // 1. Crear usuario de prueba
      const testEmail = `test-confirmation-${Date.now()}@sumeeapp.com`;
      const testPassword = 'TestConfirmation123!';

      console.log('📧 Creating test user:', testEmail);

      // Establecer cookie temporal
      document.cookie = `registration_type=profesional; path=/; max-age=3600; SameSite=Lax`;

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: 'Test Professional',
            whatsapp: '+52 55 1234 5678',
            registration_type: 'profesional',
            profession: 'Electricista',
            descripcion_perfil: 'Profesional de prueba'
          }
        }
      });

      if (signUpError) {
        throw new Error(`Error en registro: ${signUpError.message}`);
      }

      if (!signUpData.user) {
        throw new Error('No se pudo crear el usuario');
      }

      console.log('✅ User created:', signUpData.user.id);

      setResult({
        success: true,
        message: 'Usuario creado exitosamente',
        userId: signUpData.user.id,
        email: signUpData.user.email,
        needsConfirmation: !signUpData.user.email_confirmed_at,
        nextStep: 'Revisa tu email para confirmar la cuenta',
        confirmationUrl: `${window.location.origin}/auth/callback`
      });

    } catch (err: any) {
      console.error('Test email confirmation error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testDirectConfirmation = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 TESTING DIRECT CONFIRMATION...');

      // Intentar confirmar directamente con un token de prueba
      const { data, error: confirmError } = await supabase.auth.verifyOtp({
        token_hash: 'test-token',
        type: 'email'
      });

      if (confirmError) {
        console.log('Expected error for test token:', confirmError.message);
        setResult({
          success: false,
          message: 'Error esperado con token de prueba',
          error: confirmError.message,
          nextStep: 'Esto es normal - el token de prueba no es válido'
        });
      } else {
        setResult({
          success: true,
          message: 'Confirmación inesperadamente exitosa',
          data: data
        });
      }

    } catch (err: any) {
      console.error('Test direct confirmation error:', err);
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
      console.log('🧪 TESTING EXISTING USER LOGIN...');

      // Intentar iniciar sesión con credenciales existentes
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'profesional@sumeeapp.com',
        password: 'TestProfesional123!'
      });

      if (signInError) {
        if (signInError.message.includes('Email not confirmed')) {
          setResult({
            success: false,
            message: 'Email no confirmado (esperado)',
            error: signInError.message,
            nextStep: 'Esto es normal - el email necesita confirmación'
          });
        } else {
          throw new Error(`Error en inicio de sesión: ${signInError.message}`);
        }
      } else {
        setResult({
          success: true,
          message: 'Inicio de sesión exitoso',
          userId: data.user?.id,
          email: data.user?.email,
          nextStep: 'Redirigiendo al dashboard...'
        });

        // Redirigir al dashboard
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      }

    } catch (err: any) {
      console.error('Test existing user error:', err);
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
          <FontAwesomeIcon icon={faEnvelope} className="text-4xl text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Prueba de Confirmación de Email
          </h1>
          <p className="text-lg text-gray-600">
            Herramientas para probar el flujo completo de confirmación de email
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Prueba de Confirmación de Email */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <FontAwesomeIcon icon={faEnvelope} className="text-2xl text-green-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                Confirmación Email
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              Prueba el flujo completo de confirmación de email para profesionales.
            </p>
            <button
              onClick={testEmailConfirmation}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <FontAwesomeIcon icon={faEnvelope} />
              )}
              <span>{loading ? 'Probando...' : 'Probar Confirmación'}</span>
            </button>
          </div>

          {/* Prueba de Confirmación Directa */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <FontAwesomeIcon icon={faBug} className="text-2xl text-yellow-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                Confirmación Directa
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              Prueba la confirmación directa con token (debería fallar).
            </p>
            <button
              onClick={testDirectConfirmation}
              disabled={loading}
              className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <FontAwesomeIcon icon={faBug} />
              )}
              <span>{loading ? 'Probando...' : 'Probar Directa'}</span>
            </button>
          </div>

          {/* Prueba de Usuario Existente */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <FontAwesomeIcon icon={faUser} className="text-2xl text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                Usuario Existente
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              Prueba el inicio de sesión con usuario existente.
            </p>
            <button
              onClick={testExistingUser}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <FontAwesomeIcon icon={faUser} />
              )}
              <span>{loading ? 'Probando...' : 'Probar Existente'}</span>
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
                result.success ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-center mb-2">
                  {result.success ? (
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 mr-2" />
                  ) : (
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-600 mr-2" />
                  )}
                  <h4 className={`text-lg font-semibold ${
                    result.success ? 'text-green-800' : 'text-yellow-800'
                  }`}>
                    {result.message}
                  </h4>
                </div>
                <div className={`space-y-1 ${
                  result.success ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  {result.userId && <p><strong>User ID:</strong> {result.userId}</p>}
                  {result.email && <p><strong>Email:</strong> {result.email}</p>}
                  {result.error && <p><strong>Error:</strong> {result.error}</p>}
                  {result.needsConfirmation && (
                    <p><strong>Estado:</strong> Necesita confirmación de email</p>
                  )}
                  {result.confirmationUrl && (
                    <p><strong>URL de confirmación:</strong> <code>{result.confirmationUrl}</code></p>
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
            🔍 Información de Debug - Flujo de Confirmación
          </h3>
          <div className="text-blue-700 space-y-2">
            <p><strong>1. Registro:</strong> Usuario se registra en <code>/join-as-pro</code></p>
            <p><strong>2. Email:</strong> Supabase envía email de confirmación</p>
            <p><strong>3. Click:</strong> Usuario hace click en el enlace del email</p>
            <p><strong>4. Callback:</strong> Redirige a <code>/auth/callback</code> con código</p>
            <p><strong>5. Procesamiento:</strong> Callback procesa el código y crea perfil</p>
            <p><strong>6. Redirección:</strong> Redirige a <code>/dashboard</code> (RoleRouter)</p>
            <p><strong>7. Dashboard:</strong> RoleRouter redirige a dashboard correcto</p>
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
            href="/debug-auth"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FontAwesomeIcon icon={faBug} className="mr-2" />
            Debug de Autenticación
          </a>
        </div>
      </div>
    </div>
  );
}
