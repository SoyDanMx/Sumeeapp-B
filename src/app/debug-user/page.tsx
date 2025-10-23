'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faDatabase, faBug, faCheckCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

export default function DebugUserPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { role, loading: roleLoading, error: roleError } = useUserRole();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Obtener usuario de auth
        const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Error getting user:', userError);
          setUser(null);
          return;
        }

        setUser(authUser);

        if (authUser) {
          // Obtener perfil de la base de datos
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', authUser.id)
            .single();

          if (profileError) {
            console.error('Error getting profile:', profileError);
            setProfile(null);
          } else {
            setProfile(profileData);
          }
        }
      } catch (error) {
        console.error('Error in fetchUserData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faBug} spin className="text-4xl text-blue-600 mb-4" />
          <p className="text-gray-600">Cargando información de debugging...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <FontAwesomeIcon icon={faBug} className="mr-3 text-blue-600" />
            Debug de Usuario y Roles
          </h1>

          {/* Estado de Autenticación */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FontAwesomeIcon icon={faUser} className="mr-2" />
              Estado de Autenticación
            </h2>
            <div className="bg-gray-100 rounded-lg p-4">
              {user ? (
                <div className="space-y-2">
                  <p><strong>Usuario ID:</strong> {user.id}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Email Confirmado:</strong> {user.email_confirmed_at ? 'Sí' : 'No'}</p>
                  <p><strong>Último Sign In:</strong> {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}</p>
                  <p><strong>User Metadata:</strong></p>
                  <pre className="bg-white p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(user.user_metadata, null, 2)}
                  </pre>
                </div>
              ) : (
                <p className="text-red-600">No hay usuario autenticado</p>
              )}
            </div>
          </div>

          {/* Estado del Perfil */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FontAwesomeIcon icon={faDatabase} className="mr-2" />
              Estado del Perfil en Base de Datos
            </h2>
            <div className="bg-gray-100 rounded-lg p-4">
              {profile ? (
                <div className="space-y-2">
                  <p><strong>User ID:</strong> {profile.user_id}</p>
                  <p><strong>Rol:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-sm ${
                      profile.role === 'profesional' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {profile.role}
                    </span>
                  </p>
                  <p><strong>Nombre Completo:</strong> {profile.full_name}</p>
                  <p><strong>Email:</strong> {profile.email}</p>
                  <p><strong>Creado:</strong> {new Date(profile.created_at).toLocaleString()}</p>
                  <p><strong>Actualizado:</strong> {new Date(profile.updated_at).toLocaleString()}</p>
                  <p><strong>Datos Completos del Perfil:</strong></p>
                  <pre className="bg-white p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(profile, null, 2)}
                  </pre>
                </div>
              ) : (
                <p className="text-red-600">No se encontró perfil en la base de datos</p>
              )}
            </div>
          </div>

          {/* Estado del Hook de Roles */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
              Estado del Hook useUserRole
            </h2>
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="space-y-2">
                <p><strong>Rol Detectado:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-sm ${
                    role === 'profesional' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {role}
                  </span>
                </p>
                <p><strong>Cargando:</strong> {roleLoading ? 'Sí' : 'No'}</p>
                {roleError && (
                  <div className="bg-red-100 border border-red-300 rounded p-3">
                    <p className="text-red-800"><strong>Error:</strong> {roleError}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recomendaciones */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Recomendaciones de Debugging:</h3>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• Si el rol es 'client' pero debería ser 'profesional', verifica los logs del callback</li>
              <li>• Si no hay perfil, el callback no se ejecutó correctamente</li>
              <li>• Si hay error en useUserRole, hay un problema de permisos RLS</li>
              <li>• Verifica que el user_metadata contenga registration_type: 'profesional'</li>
            </ul>
          </div>

          {/* Botones de Acción */}
          <div className="mt-6 flex space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Actualizar Datos
            </button>
            <button
              onClick={() => window.location.href = '/join-as-pro'}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Ir a Registro Profesional
            </button>
            <button
              onClick={() => window.location.href = '/test-credentials'}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              Credenciales de Prueba
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}