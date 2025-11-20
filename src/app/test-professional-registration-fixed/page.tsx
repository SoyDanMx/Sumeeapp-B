'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBug, faCheckCircle, faExclamationTriangle, faSpinner, faArrowRight, faWrench } from '@fortawesome/free-solid-svg-icons';

export default function TestProfessionalRegistrationFixedPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const testProfessionalRegistration = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // 1. Establecer cookie de registro profesional
      document.cookie = `registration_type=profesional; path=/; max-age=3600; SameSite=Lax`;
      console.log('🍪 Cookie establecida: registration_type=profesional');

      // 2. Crear usuario profesional de prueba
      const testEmail = `test-profesional-fixed-${Date.now()}@sumeeapp.com`;
      const testPassword = 'TestProfesional123!';
      const testName = 'Test Profesional Fixed';
      
      console.log('📧 Creando usuario profesional de prueba:', testEmail);

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: testName,
            registration_type: 'profesional'
          }
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.user) {
        console.log('✅ Usuario profesional creado exitosamente:', data.user.id);
        
        setResult({
          success: true,
          message: 'Usuario profesional creado exitosamente',
          user: {
            id: data.user.id,
            email: data.user.email,
            metadata: data.user.user_metadata
          },
          expectedRedirect: 'Después de confirmar el email, debería ser redirigido a /professional-dashboard',
          testUrls: [
            '/dashboard/profesionales',
            '/dashboard/professionals',
            '/professional-dashboard',
            '/dashboard'
          ],
          debugUrl: '/debug-professional-registration'
        });
      }
    } catch (err: any) {
      console.error('❌ Error en flujo de registro profesional:', err);
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const testCurrentUserStatus = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        setError('Error obteniendo usuario: ' + error.message);
        return;
      }

      if (!user) {
        setResult({
          success: false,
          message: 'No hay usuario autenticado. Haz login primero.'
        });
        return;
      }

      // Obtener perfil del usuario
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setResult({
        success: true,
        message: 'Estado del usuario actual',
        user: {
          id: user.id,
          email: user.email,
          metadata: user.user_metadata
        },
        profile: profile || null,
        profileError: profileError?.message || null,
        currentRole: (profile as any)?.role || 'No encontrado',
        expectedRedirect: (profile as any)?.role === 'profesional' ? 
          'Debería ser redirigido a /professional-dashboard' : 
          'Debería ser redirigido a /dashboard/client',
        isCorrect: (profile as any)?.role === 'profesional',
        debugUrl: '/debug-professional-registration'
      });
    } catch (err: any) {
      setError('Error verificando usuario: ' + err.message);
    }
  };

  const testUrls = [
    { url: '/registro', description: 'Página de Registro Mejorada' },
    { url: '/join-as-pro', description: 'Registro Específico de Profesionales' },
    { url: '/dashboard/profesionales', description: 'Dashboard Profesionales (Español)' },
    { url: '/dashboard/professionals', description: 'Dashboard Professionals (English)' },
    { url: '/professional-dashboard', description: 'Dashboard Profesional Principal' },
    { url: '/dashboard/client', description: 'Dashboard Cliente' },
    { url: '/dashboard', description: 'RoleRouter (Redirección automática)' },
    { url: '/debug-professional-registration', description: 'Debug de Registro Profesional' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <FontAwesomeIcon icon={faWrench} className="mr-3 text-green-600" />
            Prueba de Registro Profesional Corregido
          </h1>

          <div className="space-y-6">
            {/* Botón de Prueba de Registro Profesional */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-900 mb-3">
                Prueba de Registro Profesional Corregido
              </h2>
              <p className="text-blue-800 mb-4">
                Este botón creará un usuario profesional con la lógica corregida y simulará el flujo completo.
              </p>
              <button
                onClick={testProfessionalRegistration}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <FontAwesomeIcon icon={faSpinner} spin />
                ) : (
                  <FontAwesomeIcon icon={faUser} />
                )}
                <span>
                  {loading ? 'Probando Registro Profesional...' : 'Probar Registro Profesional Corregido'}
                </span>
              </button>
            </div>

            {/* Botón de Verificación de Usuario Actual */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-green-900 mb-3">
                Verificar Estado del Usuario Actual
              </h2>
              <p className="text-green-800 mb-4">
                Verifica el estado del usuario actualmente autenticado y si tiene el rol correcto.
              </p>
              <button
                onClick={testCurrentUserStatus}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <FontAwesomeIcon icon={faCheckCircle} />
                <span>Verificar Estado Actual</span>
              </button>
            </div>

            {/* URLs de Prueba */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-yellow-900 mb-3">
                URLs de Prueba Disponibles
              </h2>
              <p className="text-yellow-800 mb-4">
                Prueba estas URLs para verificar el flujo de registro y redirección:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {testUrls.map((test, index) => (
                  <a
                    key={index}
                    href={test.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-white border border-yellow-300 rounded-lg hover:bg-yellow-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{test.description}</p>
                      <p className="text-sm text-gray-600">{test.url}</p>
                    </div>
                    <FontAwesomeIcon icon={faArrowRight} className="text-yellow-600" />
                  </a>
                ))}
              </div>
            </div>

            {/* Resultados */}
            {result && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Resultado:</h3>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <strong>Estado:</strong> {result.success ? 'Éxito' : 'Error'}
                  </p>
                  <p className="text-gray-700">
                    <strong>Mensaje:</strong> {result.message}
                  </p>
                  {result.expectedRedirect && (
                    <p className="text-gray-700">
                      <strong>Redirección Esperada:</strong> {result.expectedRedirect}
                    </p>
                  )}
                  {result.currentRole && (
                    <p className="text-gray-700">
                      <strong>Rol Actual:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                        result.currentRole === 'profesional' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {result.currentRole}
                      </span>
                    </p>
                  )}
                  {result.isCorrect !== undefined && (
                    <p className="text-gray-700">
                      <strong>¿Es Correcto?:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                        result.isCorrect 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.isCorrect ? 'Sí' : 'No'}
                      </span>
                    </p>
                  )}
                  {result.user && (
                    <div className="mt-3">
                      <p className="font-semibold text-gray-800">Datos del Usuario:</p>
                      <pre className="bg-white p-2 rounded text-xs overflow-auto mt-1">
                        {JSON.stringify(result.user, null, 2)}
                      </pre>
                    </div>
                  )}
                  {result.profile && (
                    <div className="mt-3">
                      <p className="font-semibold text-gray-800">Perfil en Base de Datos:</p>
                      <pre className="bg-white p-2 rounded text-xs overflow-auto mt-1">
                        {JSON.stringify(result.profile, null, 2)}
                      </pre>
                    </div>
                  )}
                  {result.testUrls && (
                    <div className="mt-3">
                      <p className="font-semibold text-gray-800">URLs de Prueba:</p>
                      <ul className="list-disc list-inside text-sm text-gray-700">
                        {result.testUrls.map((url: string, index: number) => (
                          <li key={index}>
                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {url}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.debugUrl && (
                    <div className="mt-3">
                      <p className="font-semibold text-gray-800">Debug:</p>
                      <a href={result.debugUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {result.debugUrl}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Errores */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 text-xl mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-800">Error:</h3>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Instrucciones */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-indigo-900 mb-3">Instrucciones de Prueba:</h3>
              <ol className="text-indigo-800 space-y-2 text-sm">
                <li>1. Haz clic en "Probar Registro Profesional Corregido" para crear un usuario de prueba</li>
                <li>2. Revisa los logs del servidor para ver el flujo del callback</li>
                <li>3. Verifica que el usuario sea creado con rol 'profesional' en Supabase</li>
                <li>4. Confirma que después de confirmar el email, sea redirigido a /professional-dashboard</li>
                <li>5. Si hay problemas, usa la página de debug: <a href="/debug-professional-registration" className="text-blue-600 underline">/debug-professional-registration</a></li>
                <li>6. Prueba las URLs de redirección para verificar que funcionen</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
