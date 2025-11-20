'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBug, faUser, faDatabase, faExclamationTriangle, faCheckCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function DebugProfessionalRegistrationPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchDebugInfo = async () => {
      try {
        setLoading(true);
        
        // 1. Obtener usuario actual
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          setError('Error obteniendo usuario: ' + userError.message);
          return;
        }

        if (!user) {
          setDebugInfo({
            authenticated: false,
            message: 'No hay usuario autenticado'
          });
          return;
        }

        // 2. Obtener perfil del usuario
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        // 3. Obtener cookies del navegador
        const cookies = document.cookie;
        const registrationTypeCookie = cookies
          .split(';')
          .find(cookie => cookie.trim().startsWith('registration_type='));

        // 4. Verificar metadata del usuario
        const userMetadata = user.user_metadata || {};
        const registrationTypeFromMetadata = userMetadata.registration_type;

        // 5. Verificar si hay indicadores de profesional en el email
        const emailIndicators = {
          containsProfesional: user.email?.includes('profesional'),
          containsPro: user.email?.includes('pro'),
          containsTest: user.email?.includes('test')
        };

        // 6. Verificar si el nombre contiene indicadores
        const nameIndicators = {
          containsProfesional: userMetadata.full_name?.toLowerCase().includes('profesional'),
          containsTest: userMetadata.full_name?.toLowerCase().includes('test')
        };

        setDebugInfo({
          authenticated: true,
          user: {
            id: user.id,
            email: user.email,
            metadata: userMetadata,
            created_at: user.created_at,
            email_confirmed_at: user.email_confirmed_at
          },
          profile: profile || null,
          profileError: profileError?.message || null,
          cookies: {
            all: cookies,
            registrationType: registrationTypeCookie || 'No encontrada'
          },
          detection: {
            registrationTypeFromMetadata,
            emailIndicators,
            nameIndicators,
            shouldBeProfessional: registrationTypeFromMetadata === 'profesional' || 
                                 emailIndicators.containsProfesional || 
                                 emailIndicators.containsPro ||
                                 nameIndicators.containsProfesional
          },
          currentRole: (profile as any)?.role || 'No encontrado',
          expectedRedirect: (profile as any)?.role === 'profesional' ? 
            '/professional-dashboard' : 
            '/dashboard/client'
        });

      } catch (err: any) {
        setError('Error en debug: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDebugInfo();
  }, []);

  const fixUserRole = async () => {
    if (!debugInfo?.user) return;

    try {
      setLoading(true);
      
      // Intentar corregir el rol del usuario
      const updatePayload: any = { 
        role: 'profesional',
        updated_at: new Date().toISOString()
      };
      const { data, error } = await (supabase
        .from('profiles') as any)
        .update(updatePayload)
        .eq('user_id', debugInfo.user.id)
        .select();

      if (error) {
        setError('Error corrigiendo rol: ' + error.message);
      } else {
        setDebugInfo((prev: any) => ({
          ...prev,
          profile: data[0],
          currentRole: 'profesional',
          expectedRedirect: '/professional-dashboard'
        }));
      }
    } catch (err: any) {
      setError('Error en corrección: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-blue-600 mb-4" />
          <p className="text-gray-600">Analizando información del usuario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <FontAwesomeIcon icon={faBug} className="mr-3 text-red-600" />
            Debug: Registro de Profesionales
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 text-xl mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800">Error:</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {debugInfo && (
            <div className="space-y-6">
              {/* Estado de Autenticación */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                  <FontAwesomeIcon icon={faUser} className="mr-2" />
                  Estado de Autenticación
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-blue-800">
                      <strong>Autenticado:</strong> {debugInfo.authenticated ? 'Sí' : 'No'}
                    </p>
                    {debugInfo.user && (
                      <>
                        <p className="text-sm text-blue-800">
                          <strong>ID:</strong> {debugInfo.user.id}
                        </p>
                        <p className="text-sm text-blue-800">
                          <strong>Email:</strong> {debugInfo.user.email}
                        </p>
                        <p className="text-sm text-blue-800">
                          <strong>Email Confirmado:</strong> {debugInfo.user.email_confirmed_at ? 'Sí' : 'No'}
                        </p>
                      </>
                    )}
                  </div>
                  <div>
                    {debugInfo.user?.metadata && (
                      <div>
                        <p className="text-sm text-blue-800">
                          <strong>Nombre:</strong> {debugInfo.user.metadata.full_name || 'No especificado'}
                        </p>
                        <p className="text-sm text-blue-800">
                          <strong>Tipo de Registro:</strong> {debugInfo.user.metadata.registration_type || 'No especificado'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Perfil en Base de Datos */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                  <FontAwesomeIcon icon={faDatabase} className="mr-2" />
                  Perfil en Base de Datos
                </h2>
                {debugInfo.profile ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-green-800">
                        <strong>Rol Actual:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                          (debugInfo.profile as any).role === 'profesional' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {(debugInfo.profile as any).role}
                        </span>
                      </p>
                      <p className="text-sm text-green-800">
                        <strong>Nombre:</strong> {(debugInfo.profile as any).full_name}
                      </p>
                      <p className="text-sm text-green-800">
                        <strong>Email:</strong> {(debugInfo.profile as any).email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-green-800">
                        <strong>Creado:</strong> {new Date((debugInfo.profile as any).created_at).toLocaleString()}
                      </p>
                      <p className="text-sm text-green-800">
                        <strong>Actualizado:</strong> {new Date((debugInfo.profile as any).updated_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-red-600">
                    <p><strong>Error:</strong> {debugInfo.profileError}</p>
                    <p className="text-sm mt-2">El perfil no se pudo cargar desde la base de datos.</p>
                  </div>
                )}
              </div>

              {/* Cookies y Detección */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-yellow-900 mb-3">
                  Cookies y Detección de Tipo
                </h2>
                <div className="space-y-2">
                  <p className="text-sm text-yellow-800">
                    <strong>Cookie registration_type:</strong> {debugInfo.cookies.registrationType}
                  </p>
                  <p className="text-sm text-yellow-800">
                    <strong>Tipo desde metadata:</strong> {debugInfo.detection.registrationTypeFromMetadata || 'No encontrado'}
                  </p>
                  <p className="text-sm text-yellow-800">
                    <strong>Debería ser profesional:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                      debugInfo.detection.shouldBeProfessional 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {debugInfo.detection.shouldBeProfessional ? 'Sí' : 'No'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Redirección Esperada */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-purple-900 mb-3">
                  Redirección Esperada
                </h2>
                <div className="space-y-2">
                  <p className="text-sm text-purple-800">
                    <strong>Rol actual:</strong> {debugInfo.currentRole}
                  </p>
                  <p className="text-sm text-purple-800">
                    <strong>Redirección esperada:</strong> {debugInfo.expectedRedirect}
                  </p>
                  <p className="text-sm text-purple-800">
                    <strong>Problema detectado:</strong> 
                    {debugInfo.currentRole === 'client' && debugInfo.detection.shouldBeProfessional 
                      ? ' Usuario debería ser profesional pero está registrado como cliente'
                      : ' No se detectó problema'
                    }
                  </p>
                </div>
              </div>

              {/* Acciones */}
              {debugInfo.currentRole === 'client' && debugInfo.detection.shouldBeProfessional && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h2 className="text-lg font-semibold text-red-900 mb-3">
                    Corrección Automática
                  </h2>
                  <p className="text-sm text-red-800 mb-4">
                    Se detectó que el usuario debería ser profesional pero está registrado como cliente. 
                    Puedes corregir esto automáticamente.
                  </p>
                  <button
                    onClick={fixUserRole}
                    disabled={loading}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 flex items-center space-x-2"
                  >
                    {loading ? (
                      <FontAwesomeIcon icon={faSpinner} spin />
                    ) : (
                      <FontAwesomeIcon icon={faCheckCircle} />
                    )}
                    <span>Corregir Rol a Profesional</span>
                  </button>
                </div>
              )}

              {/* Información Completa */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Información Completa (JSON)
                </h2>
                <pre className="bg-white p-4 rounded text-xs overflow-auto max-h-96">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Instrucciones */}
          <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-indigo-900 mb-3">Instrucciones:</h3>
            <ol className="text-indigo-800 space-y-2 text-sm">
              <li>1. Revisa la información del usuario y su perfil</li>
              <li>2. Verifica si el rol es correcto según los indicadores</li>
              <li>3. Si hay discrepancia, usa el botón de corrección automática</li>
              <li>4. Después de corregir, prueba ir a <a href="/dashboard" className="text-blue-600 underline">/dashboard</a></li>
              <li>5. Verifica que sea redirigido al dashboard correcto</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
