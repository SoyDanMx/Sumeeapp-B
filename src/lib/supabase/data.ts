// src/lib/supabase/data.ts

import { supabase } from '@/lib/supabase/client';
import { geocodeAddress } from '@/lib/geocoding'; // Importamos la utilidad que acabamos de crear
import { Profesional, Lead } from '@/types/supabase'; // Importamos los tipos necesarios

// =========================================================================
// 🚨 INSTRUCCIÓN CRÍTICA DE BACKEND (RLS) 🚨
// Si la actualización falla con un error 42501 (Permiso denegado), debes ejecutar
// la siguiente política en el SQL Editor de Supabase (si no existe ya):
//
// CREATE POLICY "Los usuarios pueden actualizar su propio perfil."
// ON public.profiles
// FOR UPDATE
// TO authenticated
// USING (auth.uid() = user_id);
//
// NOTA: Si recibes el error 'policy already exists', ignora el comando.
// =========================================================================

/**
 * Verifica si el usuario tiene permisos básicos de lectura en su propia fila de perfil.
 * Esto ayuda a diagnosticar problemas de Row Level Security (RLS).
 * @param userId El UUID del usuario actual.
 * @returns true si la lectura es exitosa, lanza un error si hay fallo de RLS.
 */
export async function checkUserPermissions(userId: string): Promise<boolean> {
    const { error } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error("Error de diagnóstico RLS/Permisos:", error);
        throw new Error(`Error de permisos (Código: ${error.code}). Asegura la política SELECT/RLS.`);
    }

    // Si no hay error, asumimos que el usuario puede leer su perfil.
    return true;
}

/**
 * Actualiza o inserta el perfil completo del profesional, incluyendo la geocodificación
 * de la dirección base. Utiliza el método upsert para ser más robusto.
 * @param userId El UUID del usuario actual (obtenido de la sesión).
 * @param updates Los campos del formulario a actualizar.
 * @param locationAddress La dirección de texto opcional para geocodificar.
 * @throws Lanza un error si la geocodificación o la actualización fallan.
 */
export async function updateProfesionalProfile(
    userId: string, 
    updates: Partial<Profesional>, 
    address?: string
) {
    let lat: number | undefined;
    let lng: number | undefined;
    
    // 1. Geocodificación (solo si se proporciona una dirección)
    if (address) {
        const coords = await geocodeAddress(address);
        if (coords) {
            lat = coords.lat;
            lng = coords.lng;
        } else {
            throw new Error("No se pudo obtener las coordenadas de la dirección proporcionada. Intenta ser más específico.");
        }
    }

    // 2. Preparar los datos para el upsert (Actualizar/Insertar)
    const dataToUpdate = {
        ...updates,
        user_id: userId, // CRÍTICO: El user_id es necesario para el upsert
        ...(lat !== undefined && { ubicacion_lat: lat }),
        ...(lng !== undefined && { ubicacion_lng: lng }),
    };

    // 3. Llamada a Supabase usando UPSERT
    const { error } = await supabase
        .from('profiles')
        // El upsert intentará insertar; si user_id ya existe, lo actualizará
        .upsert([dataToUpdate], { onConflict: 'user_id' });

    if (error) {
        console.error('Error de Supabase al actualizar/insertar perfil:', error);
        // Devuelve un error más claro al frontend
        if (error.code === '42501') {
            throw new Error("Error de permisos (RLS). Asegura la Política de UPDATE en Supabase.");
        }
        throw new Error(`Falló la actualización del perfil: ${error.message}`);
    }
}

// =========================================================================
// LÓGICA DE GESTIÓN DE LEADS (Conexión Cliente-Profesional)
// =========================================================================

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
 * Función para que el Profesional acepte un lead y lo asigne a sí mismo.
 * @param leadId ID del lead a aceptar.
 * @param profesionalId ID del profesional que acepta el lead (auth.uid()).
 */
export async function acceptLead(leadId: string, profesionalId: string) {
    // 💡 IMPORTANTE: Debes tener una política de RLS que permita hacer UPDATE
    // a los leads donde el estado sea 'Nuevo' para que esta función funcione.
    
    const { error } = await supabase
        .from('leads')
        .update({
            estado: 'Contactado', // Cambia el estado
            profesional_asignado_id: profesionalId // Asigna al profesional
        })
        .eq('id', leadId)
        .select();

    if (error) {
        console.error('Error al aceptar el lead:', error);
        throw new Error(`No se pudo aceptar el lead: ${error.message}`);
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