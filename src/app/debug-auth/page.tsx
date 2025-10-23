'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { useUserRole } from '@/hooks/useUserRole';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheckCircle, faExclamationTriangle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

export default function DebugAuthPage() {
  const [sessionData, setSessionData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user: authUser, loading: authLoading } = useAuth();
  const { role, loading: roleLoading, error: roleError } = useUserRole();

  useEffect(() => {
    const fetchAuthData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Verificar sesión
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        setSessionData({ session, sessionError });

        // 2. Verificar usuario
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        setUserData({ user, userError });

        // 3. Verificar perfil si hay usuario
        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
          setProfileData({ profile, profileError });
        }

      } catch (err: any) {
        console.error('Error fetching auth data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthData();
  }, []);

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
    ) : (
      <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500" />
    );
  };

  const getStatusColor = (condition: boolean) => {
    return condition ? 'text-green-700' : 'text-red-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-blue-600 mb-4" />
          <p className="text-gray-600">Cargando datos de autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <FontAwesomeIcon icon={faInfoCircle} className="text-4xl text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Debug de Autenticación
          </h1>
          <p className="text-lg text-gray-600">
            Estado completo del sistema de autenticación
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sesión */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              {getStatusIcon(!!sessionData?.session)}
              <span className="ml-2">Sesión</span>
            </h2>
            <div className="space-y-2">
              <p className={getStatusColor(!!sessionData?.session)}>
                <strong>Estado:</strong> {sessionData?.session ? 'Activa' : 'Inactiva'}
              </p>
              {sessionData?.session && (
                <>
                  <p><strong>User ID:</strong> {sessionData.session.user?.id}</p>
                  <p><strong>Email:</strong> {sessionData.session.user?.email}</p>
                  <p><strong>Expires:</strong> {new Date(sessionData.session.expires_at * 1000).toLocaleString()}</p>
                </>
              )}
              {sessionData?.sessionError && (
                <p className="text-red-600">
                  <strong>Error:</strong> {sessionData.sessionError.message}
                </p>
              )}
            </div>
          </div>

          {/* Usuario */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              {getStatusIcon(!!userData?.user)}
              <span className="ml-2">Usuario</span>
            </h2>
            <div className="space-y-2">
              <p className={getStatusColor(!!userData?.user)}>
                <strong>Estado:</strong> {userData?.user ? 'Autenticado' : 'No autenticado'}
              </p>
              {userData?.user && (
                <>
                  <p><strong>ID:</strong> {userData.user.id}</p>
                  <p><strong>Email:</strong> {userData.user.email}</p>
                  <p><strong>Email Confirmado:</strong> {userData.user.email_confirmed_at ? 'Sí' : 'No'}</p>
                  <p><strong>Metadata:</strong> {JSON.stringify(userData.user.user_metadata, null, 2)}</p>
                </>
              )}
              {userData?.userError && (
                <p className="text-red-600">
                  <strong>Error:</strong> {userData.userError.message}
                </p>
              )}
            </div>
          </div>

          {/* Perfil */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              {getStatusIcon(!!profileData?.profile)}
              <span className="ml-2">Perfil</span>
            </h2>
            <div className="space-y-2">
              <p className={getStatusColor(!!profileData?.profile)}>
                <strong>Estado:</strong> {profileData?.profile ? 'Encontrado' : 'No encontrado'}
              </p>
              {profileData?.profile && (
                <>
                  <p><strong>Rol:</strong> {profileData.profile.role}</p>
                  <p><strong>Nombre:</strong> {profileData.profile.full_name}</p>
                  <p><strong>Email:</strong> {profileData.profile.email}</p>
                  <p><strong>Creado:</strong> {new Date(profileData.profile.created_at).toLocaleString()}</p>
                </>
              )}
              {profileData?.profileError && (
                <p className="text-red-600">
                  <strong>Error:</strong> {profileData.profileError.message}
                </p>
              )}
            </div>
          </div>

          {/* AuthProvider */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              {getStatusIcon(!!authUser)}
              <span className="ml-2">AuthProvider</span>
            </h2>
            <div className="space-y-2">
              <p className={getStatusColor(!!authUser)}>
                <strong>Estado:</strong> {authUser ? 'Usuario cargado' : 'Sin usuario'}
              </p>
              <p><strong>Loading:</strong> {authLoading ? 'Sí' : 'No'}</p>
              {authUser && (
                <>
                  <p><strong>ID:</strong> {authUser.id}</p>
                  <p><strong>Email:</strong> {authUser.email}</p>
                  <p><strong>Rol:</strong> {authUser.role}</p>
                </>
              )}
            </div>
          </div>

          {/* useUserRole Hook */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              {getStatusIcon(!!role && !roleError)}
              <span className="ml-2">useUserRole</span>
            </h2>
            <div className="space-y-2">
              <p className={getStatusColor(!!role && !roleError)}>
                <strong>Rol:</strong> {role}
              </p>
              <p><strong>Loading:</strong> {roleLoading ? 'Sí' : 'No'}</p>
              {roleError && (
                <p className="text-red-600">
                  <strong>Error:</strong> {roleError}
                </p>
              )}
            </div>
          </div>

          {/* Resumen */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Resumen del Estado
            </h2>
            <div className="space-y-2">
              <p className={getStatusColor(!!sessionData?.session)}>
                <strong>Sesión:</strong> {sessionData?.session ? '✅ Activa' : '❌ Inactiva'}
              </p>
              <p className={getStatusColor(!!userData?.user)}>
                <strong>Usuario:</strong> {userData?.user ? '✅ Autenticado' : '❌ No autenticado'}
              </p>
              <p className={getStatusColor(!!profileData?.profile)}>
                <strong>Perfil:</strong> {profileData?.profile ? '✅ Encontrado' : '❌ No encontrado'}
              </p>
              <p className={getStatusColor(!!authUser)}>
                <strong>AuthProvider:</strong> {authUser ? '✅ Cargado' : '❌ No cargado'}
              </p>
              <p className={getStatusColor(!!role && !roleError)}>
                <strong>Rol:</strong> {role ? `✅ ${role}` : '❌ No determinado'}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error General</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Actualizar Datos
          </button>
        </div>
      </div>
    </div>
  );
}
