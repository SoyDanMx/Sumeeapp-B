// src/lib/supabase/data.ts

import { supabase } from '@/lib/supabase/client';
import { geocodeAddress } from '@/lib/geocoding'; // Importamos la utilidad que acabamos de crear
import { Profesional, Lead } from '@/types/supabase'; // Importamos los tipos necesarios

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
    
    // Primero, obtener el perfil actual para asegurar que full_name no sea null
    const { data: currentProfile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', userId)
        .single();

    // Si hay un perfil existente y updates.full_name es null/undefined, usar el valor existente
    const fullName = updates.full_name || currentProfile?.full_name;
    
    if (!fullName) {
        throw new Error('El campo full_name es requerido y no puede estar vacío.');
    }

    const dataToUpdate = {
        user_id: userId, // ⬅️ Necesario para el upsert
        full_name: fullName, // Asegurar que full_name siempre esté presente
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

/**
 * Envía un nuevo lead desde el formulario del cliente.
 * @param leadData Datos del lead incluyendo servicio, ubicación y WhatsApp
 */
export async function submitLead(leadData: {
    servicio: string;
    ubicacion: string;
    whatsapp: string;
    nombre_cliente?: string;
}) {
    try {
        // Geocodificar la dirección proporcionada
        let lat: number | null = null;
        let lng: number | null = null;
        
        if (leadData.ubicacion) {
            const coords = await geocodeAddress(leadData.ubicacion);
            if (coords) {
                lat = coords.lat;
                lng = coords.lng;
            }
        }

        // Preparar los datos del lead para insertar
        const leadToInsert = {
            nombre_cliente: leadData.nombre_cliente || null,
            whatsapp: leadData.whatsapp,
            descripcion_proyecto: `Servicio de ${leadData.servicio} solicitado. Ubicación: ${leadData.ubicacion}`,
            ubicacion_lat: lat,
            ubicacion_lng: lng,
            fecha_creacion: new Date().toISOString(),
            estado: 'Nuevo' as const,
            profesional_asignado_id: null
        };

        // Insertar el lead en la base de datos
        const { data, error } = await supabase
            .from('leads')
            .insert([leadToInsert])
            .select()
            .single();

        if (error) {
            throw new Error(`Error al crear el lead: ${error.message}`);
        }

        return {
            success: true,
            leadId: data.id,
            lead: data
        };
    } catch (error) {
        console.error('Error en submitLead:', error);
        throw error;
    }
}

/**
 * Permite a un profesional aceptar un lead específico.
 * @param leadId ID del lead a aceptar
 * @param profesionalId ID del profesional que acepta el lead
 */
export async function acceptLead(leadId: string, profesionalId: string) {
    try {
        // Actualizar el lead con el profesional asignado y cambiar estado
        const { data, error } = await supabase
            .from('leads')
            .update({
                estado: 'Contactado',
                profesional_asignado_id: profesionalId
            })
            .eq('id', leadId)
            .select()
            .single();

        if (error) {
            throw new Error(`Error al aceptar el lead: ${error.message}`);
        }

        return {
            success: true,
            lead: data
        };
    } catch (error) {
        console.error('Error en acceptLead:', error);
        throw error;
    }
}

/**
 * Obtiene un lead específico por su ID
 * @param leadId ID del lead a obtener
 */
export async function getLeadById(leadId: string) {
    try {
        const { data, error } = await supabase
            .from('leads')
            .select(`
                *,
                profesional_asignado:profesional_asignado_id(
                    full_name,
                    profession,
                    calificacion_promedio,
                    whatsapp,
                    avatar_url
                )
            `)
            .eq('id', leadId)
            .single();

        if (error) {
            throw new Error(`Error al obtener el lead: ${error.message}`);
        }

        return data;
    } catch (error) {
        console.error('Error en getLeadById:', error);
        throw error;
    }
}