// src/lib/supabase/actions.ts
// Funciones centralizadas para operaciones de perfil con RLS

import { supabase } from '@/lib/supabase/client';
import { geocodeAddress } from '@/lib/geocoding';
import { Profesional } from '@/types/supabase';

/**
 * Actualiza el perfil de un usuario de forma segura y compatible con RLS
 * @param userId ID del usuario autenticado
 * @param updates Campos a actualizar
 * @param locationAddress Dirección opcional para geocodificar
 * @returns Datos actualizados del perfil
 * @throws Error si falla la actualización o geocodificación
 */
export async function updateUserProfile(
  userId: string, 
  updates: Partial<Profesional>, 
  locationAddress?: string
): Promise<Profesional> {
  try {
    console.log('🔄 Iniciando actualización de perfil:', { userId, updates });

    // 1. Geocodificación opcional
    let lat: number | undefined;
    let lng: number | undefined;
    
    if (locationAddress) {
      console.log('📍 Geocodificando dirección:', locationAddress);
      const coords = await geocodeAddress(locationAddress);
      if (coords) {
        lat = coords.lat;
        lng = coords.lng;
        console.log('✅ Coordenadas obtenidas:', { lat, lng });
      } else {
        throw new Error("No se pudo obtener las coordenadas de la dirección proporcionada. Intenta ser más específico.");
      }
    }

    // 2. Preparar datos para actualización
    const dataToUpdate = {
      ...updates,
      ...(lat !== undefined && { ubicacion_lat: lat }),
      ...(lng !== undefined && { ubicacion_lng: lng }),
      updated_at: new Date().toISOString()
    };

    console.log('📝 Datos a actualizar:', dataToUpdate);

    // 3. Actualización usando UPDATE con .eq() para RLS
    const { data, error } = await supabase
      .from('profiles')
      .update(dataToUpdate)
      .eq('user_id', userId) // CRÍTICO: Filtro para RLS
      .select()
      .single();

    if (error) {
      console.error('❌ Error de Supabase:', error);
      
      // Manejo específico de errores RLS
      if (error.code === '42501') {
        throw new Error("Error de permisos (RLS). Verifica que la política de UPDATE esté configurada correctamente.");
      }
      
      if (error.code === 'PGRST116') {
        throw new Error("No se encontró el perfil del usuario. Verifica que el usuario esté registrado correctamente.");
      }
      
      throw new Error(`Error al actualizar el perfil: ${error.message}`);
    }

    console.log('✅ Perfil actualizado exitosamente:', data);
    return data as Profesional;

  } catch (error) {
    console.error('❌ Error en updateUserProfile:', error);
    throw error;
  }
}

/**
 * Verifica los permisos del usuario para operaciones RLS
 * @param userId ID del usuario
 * @returns true si tiene permisos
 * @throws Error si no tiene permisos
 */
export async function verifyUserPermissions(userId: string): Promise<boolean> {
  try {
    console.log('🔍 Verificando permisos para usuario:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, full_name')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('❌ Error de permisos:', error);
      throw new Error(`Error de permisos (Código: ${error.code}). Verifica la política RLS.`);
    }

    if (!data) {
      throw new Error("No se encontró el perfil del usuario.");
    }

    console.log('✅ Permisos verificados correctamente');
    return true;

  } catch (error) {
    console.error('❌ Error en verifyUserPermissions:', error);
    throw error;
  }
}

/**
 * Obtiene el perfil completo de un usuario
 * @param userId ID del usuario
 * @returns Perfil completo del usuario
 */
export async function getUserProfile(userId: string): Promise<Profesional | null> {
  try {
    console.log('👤 Obteniendo perfil de usuario:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('❌ Error obteniendo perfil:', error);
      throw new Error(`Error al obtener el perfil: ${error.message}`);
    }

    console.log('✅ Perfil obtenido:', data);
    return data as Profesional;

  } catch (error) {
    console.error('❌ Error en getUserProfile:', error);
    throw error;
  }
}
