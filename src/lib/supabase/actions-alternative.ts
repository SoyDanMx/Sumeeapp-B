// src/lib/supabase/actions-alternative.ts
// Versión alternativa que usa UPSERT para evitar problemas de esquema

import { supabase } from '@/lib/supabase/client';
import { geocodeAddress } from '@/lib/geocoding';
import { Profesional } from '@/types/supabase';

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
 * Actualiza el perfil usando UPSERT para evitar problemas de esquema
 * Esta versión es más robusta y evita errores de columnas faltantes
 */
export async function updateUserProfileSafe(
  userId: string, 
  updates: Partial<Profesional>, 
  locationAddress?: string
): Promise<Profesional> {
  try {
    console.log('🔄 Iniciando actualización SEGURA de perfil:', { userId, updates });

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

    // 2. Preparar datos para UPSERT (más seguro)
    const dataToUpsert = {
      user_id: userId, // CRÍTICO: Necesario para UPSERT
      ...updates,
      ...(lat !== undefined && { ubicacion_lat: lat }),
      ...(lng !== undefined && { ubicacion_lng: lng })
    };

    // 3. Filtrar solo campos que sabemos que existen
    const safeFields = [
      'user_id', 'full_name', 'email', 'avatar_url', 'role',
      'profession', 'whatsapp', 'descripcion_perfil', 'specialties',
      'experience_years', 'ubicacion_lat', 'ubicacion_lng', 'ubicacion_direccion',
      'disponibilidad', 'calificacion_promedio'
    ];

    const filteredData = Object.fromEntries(
      Object.entries(dataToUpsert).filter(([key, value]) => 
        safeFields.includes(key) && value !== undefined && value !== null
      )
    );

    console.log('📝 Datos seguros para UPSERT:', filteredData);

    // 4. UPSERT usando onConflict
    const { data, error } = await supabase
      .from('profiles')
      .upsert([filteredData], { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('❌ Error de Supabase UPSERT:', error);
      
      // Manejo específico de errores
      if (error.code === '42501') {
        throw new Error("Error de permisos (RLS). Verifica que la política de UPSERT esté configurada correctamente.");
      }
      
      if (error.message.includes('updated_at')) {
        throw new Error("Error de esquema: La columna 'updated_at' no existe. Ejecuta el script SQL de corrección en Supabase.");
      }
      
      throw new Error(`Error al actualizar el perfil: ${error.message}`);
    }

    console.log('✅ Perfil actualizado con UPSERT:', data);
    return data as Profesional;

  } catch (error) {
    console.error('❌ Error en updateUserProfileSafe:', error);
    throw error;
  }
}

/**
 * Función de respaldo que intenta UPDATE primero, luego UPSERT
 */
export async function updateUserProfileFallback(
  userId: string, 
  updates: Partial<Profesional>, 
  locationAddress?: string
): Promise<Profesional> {
  try {
    console.log('🔄 Intentando actualización con fallback...');
    
    // Intentar UPSERT primero (más seguro)
    return await updateUserProfileSafe(userId, updates, locationAddress);
    
  } catch (error) {
    console.error('❌ Error en updateUserProfileFallback:', error);
    
    // Si falla, intentar con datos mínimos
    try {
      console.log('🔄 Intentando con datos mínimos...');
      
      const minimalData = {
        user_id: userId,
        full_name: updates.full_name || '',
        email: updates.email || ''
      };

      const { data, error: minimalError } = await supabase
        .from('profiles')
        .upsert([minimalData], { onConflict: 'user_id' })
        .select()
        .single();

      if (minimalError) {
        throw new Error(`Error crítico: ${minimalError.message}`);
      }

      console.log('✅ Perfil actualizado con datos mínimos:', data);
      return data as Profesional;
      
    } catch (fallbackError) {
      console.error('❌ Error en fallback:', fallbackError);
      const errorMessage = fallbackError instanceof Error ? fallbackError.message : 'Error desconocido';
      throw new Error(`No se pudo actualizar el perfil. Error: ${errorMessage}`);
    }
  }
}
