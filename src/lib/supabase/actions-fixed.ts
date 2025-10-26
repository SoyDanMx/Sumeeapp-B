// src/lib/supabase/actions-fixed.ts
// Versión corregida de las funciones de actualización de perfil

import { supabase } from '@/lib/supabase/client';
import { geocodeAddress } from '@/lib/geocoding';
import { Profesional } from '@/types/supabase';

/**
 * Actualiza el perfil de un usuario de forma segura y compatible con RLS
 * VERSIÓN CORREGIDA: Sin columna updated_at para evitar errores de esquema
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

    // 2. Preparar datos para actualización (SIN updated_at)
    const dataToUpdate = {
      ...updates,
      ...(lat !== undefined && { ubicacion_lat: lat }),
      ...(lng !== undefined && { ubicacion_lng: lng })
      // REMOVIDO: updated_at: new Date().toISOString() - Causa error de esquema
    };

    // Filtrar campos que podrían no existir en la tabla
    const filteredUpdates = Object.fromEntries(
      Object.entries(dataToUpdate).filter(([key, value]) => {
        // Excluir campos que podrían causar errores de esquema
        const problematicFields = ['updated_at', 'created_at'];
        return !problematicFields.includes(key) && value !== undefined;
      })
    );

    console.log('📝 Datos a actualizar:', filteredUpdates);

    // 3. Actualización usando UPDATE con .eq() para RLS
    const { data, error } = await supabase
      .from('profiles')
      .update(filteredUpdates)
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
      
      if (error.message.includes('updated_at')) {
        throw new Error("Error de esquema: La columna 'updated_at' no existe en la tabla 'profiles'. Ejecuta el script de corrección en Supabase.");
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
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('❌ Error de permisos:', error);
      throw new Error(`Error de permisos: ${error.message}`);
    }

    console.log('✅ Permisos verificados para usuario:', userId);
    return true;
  } catch (error) {
    console.error('❌ Error en verifyUserPermissions:', error);
    throw error;
  }
}

/**
 * Función alternativa que usa UPSERT en lugar de UPDATE
 * Útil si hay problemas con RLS
 */
export async function updateUserProfileUpsert(
  userId: string, 
  updates: Partial<Profesional>, 
  locationAddress?: string
): Promise<Profesional> {
  try {
    console.log('🔄 Iniciando actualización con UPSERT:', { userId, updates });

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

    // 2. Preparar datos para UPSERT
    const dataToUpsert = {
      user_id: userId, // CRÍTICO: Necesario para UPSERT
      ...updates,
      ...(lat !== undefined && { ubicacion_lat: lat }),
      ...(lng !== undefined && { ubicacion_lng: lng })
    };

    console.log('📝 Datos para UPSERT:', dataToUpsert);

    // 3. UPSERT usando onConflict
    const { data, error } = await supabase
      .from('profiles')
      .upsert([dataToUpsert], { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('❌ Error de Supabase UPSERT:', error);
      throw new Error(`Error al actualizar el perfil: ${error.message}`);
    }

    console.log('✅ Perfil actualizado con UPSERT:', data);
    return data as Profesional;

  } catch (error) {
    console.error('❌ Error en updateUserProfileUpsert:', error);
    throw error;
  }
}
