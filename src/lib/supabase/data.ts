// src/lib/supabase/data.ts

import { supabase } from '@/lib/supabase/client';
import { geocodeAddress } from '@/lib/geocoding'; // Importamos la utilidad que acabamos de crear
import { Profesional } from '@/types/supabase'; // Importamos el tipo Profesional

/**
 * Actualiza (o inserta si no existe, usando el user_id) la información del perfil del profesional.
 * @param userId El ID del usuario a actualizar.
 * @param updates Los datos del formulario (WhatsApp, IMSS, Biografía, Experiencia).
 * @param address La dirección de texto opcional para geocodificar.
 */
export async function updateProfesionalProfile(userId: string, updates: Partial<Profesional>, address?: string) {
    let lat: number | undefined;
    let lng: number | undefined;
    
    // 1. Si el usuario proporcionó una dirección, la convertimos a coordenadas (lat/lng)
    if (address) {
        const coords = await geocodeAddress(address);
        if (coords) {
            lat = coords.lat;
            lng = coords.lng;
        } else {
            // Si Nominatim no encuentra la dirección
            throw new Error("No se pudo obtener las coordenadas de la dirección proporcionada. Intenta ser más específico.");
        }
    }

    // 2. Preparamos el objeto de actualización: combinamos los datos del formulario con las coordenadas (si se encontraron)
    // También incluimos el user_id para que upsert sepa a quién insertar/actualizar.
    const dataToUpdate = {
        user_id: userId, // ⬅️ Necesario para el upsert
        ...updates,
        ...(lat !== undefined && { ubicacion_lat: lat }), 
        ...(lng !== undefined && { ubicacion_lng: lng }), 
    };

    // 3. Llamada final a Supabase. Usamos .upsert() para evitar el error de clave duplicada
    // si esta función se llama al inicio de la sesión.
    const { error } = await supabase
        .from('profiles')
        // 🚨 CAMBIO CLAVE: De .update() a .upsert() 
        // Indica a Supabase que use 'user_id' como la columna de conflicto (la clave única)
        .upsert(dataToUpdate, { onConflict: 'user_id' }); 

    if (error) {
        throw new Error(error.message);
    }
}