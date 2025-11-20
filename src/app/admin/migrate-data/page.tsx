'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheckCircle, faExclamationTriangle, faDatabase, faUsers, faWrench } from '@fortawesome/free-solid-svg-icons';

interface ResultItem {
  type: 'success' | 'error' | 'info';
  message: string;
  timestamp: string;
}

export default function MigrateDataPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addResult = (type: 'success' | 'error' | 'info', message: string) => {
    setResults(prev => [...prev, { type, message, timestamp: new Date().toLocaleTimeString() }]);
  };

  const migrateProfessionals = async () => {
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      addResult('info', 'Iniciando migración de datos...');

      // 1. Obtener todos los usuarios que deberían ser profesionales
      const { data: allUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        throw new Error(`Error obteniendo usuarios: ${usersError.message}`);
      }

      addResult('info', `Encontrados ${allUsers?.length || 0} usuarios en la base de datos`);

      if (!allUsers || allUsers.length === 0) {
        addResult('info', 'No se encontraron usuarios para migrar');
        setLoading(false);
        return;
      }

      // 2. Identificar usuarios que deberían ser profesionales
      // @ts-ignore - Supabase type inference issue
      const professionalUsers: any[] = (allUsers as any[]).filter((user: any) => {
        // Criterios para identificar profesionales
        const emailIndicators = user.email?.includes('profesional') || 
                               user.email?.includes('pro') ||
                               user.full_name?.toLowerCase().includes('profesional');
        
        const nameIndicators = user.full_name?.toLowerCase().includes('profesional') ||
                              user.full_name?.toLowerCase().includes('técnico') ||
                              user.full_name?.toLowerCase().includes('electricista') ||
                              user.full_name?.toLowerCase().includes('plomero');

        return emailIndicators || nameIndicators || user.role === 'profesional';
      });

      addResult('info', `Identificados ${professionalUsers.length} usuarios como profesionales`);

      // 3. Actualizar roles y crear datos de profesionales
      for (const user of professionalUsers) {
        try {
          // Actualizar rol a profesional
          const updatePayload: any = { 
            role: 'profesional',
            updated_at: new Date().toISOString()
          };
          const { error: updateError } = await (supabase
            .from('profiles') as any)
            .update(updatePayload)
            .eq('user_id', user.user_id);

          if (updateError) {
            addResult('error', `Error actualizando ${user.full_name}: ${updateError.message}`);
            continue;
          }

          // Verificar si ya tiene datos en la tabla profesionales
          const { data: existingProfessional, error: checkError } = await supabase
            .from('profesionales')
            .select('id')
            .eq('user_id', user.user_id)
            .single();

          if (checkError && checkError.code !== 'PGRST116') {
            addResult('error', `Error verificando datos profesionales de ${user.full_name}: ${checkError.message}`);
            continue;
          }

          // Si no existe, crear datos de profesional
          if (!existingProfessional) {
            const professionalData = {
              user_id: user.user_id,
              profession: 'General',
              specialties: ['General'],
              experience_years: 2,
              calificacion_promedio: 4.5,
              whatsapp: '',
              descripcion_perfil: `Profesional verificado - ${user.full_name}`,
              disponibilidad: 'disponible',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };

            const { error: insertError } = await (supabase
              .from('profesionales') as any)
              .insert([professionalData]);

            if (insertError) {
              addResult('error', `Error creando datos profesionales de ${user.full_name}: ${insertError.message}`);
            } else {
              addResult('success', `✅ Migrado ${user.full_name} como profesional`);
            }
          } else {
            addResult('info', `ℹ️ ${user.full_name} ya tiene datos profesionales`);
          }

        } catch (userError) {
          const errorMessage = userError instanceof Error 
            ? userError.message 
            : 'Error desconocido';
          addResult('error', `Error procesando ${user.full_name}: ${errorMessage}`);
        }
      }

      addResult('success', '🎉 Migración completada');

    } catch (err) {
      console.error('Migration error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      addResult('error', `Error general: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const resetAllRoles = async () => {
    if (!confirm('⚠️ ¿Estás seguro? Esto cambiará TODOS los usuarios a rol "client".')) {
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      addResult('info', 'Reseteando todos los roles a "client"...');

      const updatePayload: any = { 
        role: 'client',
        updated_at: new Date().toISOString()
      };
      const { error } = await (supabase
        .from('profiles') as any)
        .update(updatePayload)
        .neq('user_id', '00000000-0000-0000-0000-000000000000'); // Update all except dummy

      if (error) {
        throw new Error(`Error reseteando roles: ${error.message}`);
      }

      addResult('success', '✅ Todos los roles reseteados a "client"');

    } catch (err) {
      console.error('Reset error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      addResult('error', `Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <FontAwesomeIcon icon={faDatabase} className="text-4xl text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Migración de Datos
          </h1>
          <p className="text-lg text-gray-600">
            Herramientas para corregir la estructura de base de datos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Migrar Profesionales */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <FontAwesomeIcon icon={faUsers} className="text-2xl text-green-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                Migrar Profesionales
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              Identifica y migra usuarios que deberían ser profesionales basándose en sus datos.
            </p>
            <button
              onClick={migrateProfessionals}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <FontAwesomeIcon icon={faWrench} />
              )}
              <span>{loading ? 'Migrando...' : 'Migrar Profesionales'}</span>
            </button>
          </div>

          {/* Reset Roles */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-2xl text-red-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                Reset Roles
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              ⚠️ Cambia TODOS los usuarios a rol &quot;client&quot;. Usar con precaución.
            </p>
            <button
              onClick={resetAllRoles}
              disabled={loading}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <FontAwesomeIcon icon={faExclamationTriangle} />
              )}
              <span>{loading ? 'Reseteando...' : 'Reset Todos los Roles'}</span>
            </button>
          </div>
        </div>

        {/* Resultados */}
        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Resultados</h3>
              <button
                onClick={clearResults}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Limpiar
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg text-sm ${
                    result.type === 'success' ? 'bg-green-50 text-green-800' :
                    result.type === 'error' ? 'bg-red-50 text-red-800' :
                    'bg-blue-50 text-blue-800'
                  }`}
                >
                  <div className="flex items-center">
                    {result.type === 'success' && <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />}
                    {result.type === 'error' && <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />}
                    {result.type === 'info' && <FontAwesomeIcon icon={faSpinner} className="mr-2" />}
                    <span className="font-mono text-xs text-gray-500 mr-2">{result.timestamp}</span>
                    <span>{result.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 mr-2" />
              <h3 className="text-lg font-semibold text-red-800">Error</h3>
            </div>
            <p className="text-red-700 mt-2">{error}</p>
          </div>
        )}

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">
            ⚠️ Instrucciones Importantes
          </h3>
          <div className="text-yellow-700 space-y-2">
            <p>1. <strong>Ejecuta primero el SQL de rediseño</strong> en el SQL Editor de Supabase</p>
            <p>2. <strong>Migra los profesionales</strong> para corregir roles existentes</p>
            <p>3. <strong>Prueba el registro</strong> de nuevos profesionales</p>
            <p>4. <strong>Verifica</strong> que los callbacks funcionen correctamente</p>
          </div>
        </div>
      </div>
    </div>
  );
}
