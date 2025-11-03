// src/lib/supabase/actions-alternative-rpc.ts
// Versión alternativa que usa RPC para actualizar perfiles (más robusta)

import { supabase } from "@/lib/supabase/client";
import { geocodeAddress } from "@/lib/geocoding";
import { Profesional } from "@/types/supabase";

/**
 * Actualiza el perfil usando función RPC (más robusta que UPDATE directo)
 * Esta función usa update_profile RPC con SECURITY DEFINER para bypass RLS
 * @param userId ID del usuario
 * @param updates Objeto con los campos a actualizar
 * @param locationAddress Dirección opcional para geocodificar
 * @returns Perfil actualizado
 */
export async function updateUserProfileRPC(
  userId: string,
  updates: Partial<Profesional>,
  locationAddress?: string
): Promise<Profesional> {
  try {
    console.log("🔄 Iniciando actualización de perfil vía RPC:", {
      userId,
      updates,
    });

    // 1. Geocodificación opcional
    let lat: number | undefined;
    let lng: number | undefined;

    if (locationAddress) {
      console.log("📍 Geocodificando dirección:", locationAddress);
      const coords = await geocodeAddress(locationAddress);
      if (coords) {
        lat = coords.lat;
        lng = coords.lng;
        console.log("✅ Coordenadas obtenidas:", { lat, lng });
      } else {
        throw new Error(
          "No se pudo obtener las coordenadas de la dirección proporcionada. Intenta ser más específico."
        );
      }
    }

    // 2. Preparar datos para enviar a RPC
    const updatesForRPC: Record<string, any> = {
      ...updates,
      ...(lat !== undefined && { ubicacion_lat: lat }),
      ...(lng !== undefined && { ubicacion_lng: lng }),
      ...(locationAddress && { ubicacion_direccion: locationAddress }),
    };

    // 3. Filtrar solo campos válidos (evitar errores de columnas inexistentes)
    const safeFields = [
      "full_name",
      "email",
      "avatar_url",
      "role",
      "profession",
      "whatsapp",
      "descripcion_perfil",
      "specialties",
      "experience_years",
      "ubicacion_lat",
      "ubicacion_lng",
      "ubicacion_direccion",
      "disponibilidad",
      "calificacion_promedio",
      "areas_servicio",
      "numero_imss",
      "work_zones",
      "city",
      "onboarding_status",
      "bio",
      "phone",
      "work_photos_urls",
      "experiencia_uber",
      "años_experiencia_uber",
      "portfolio",
      "certificaciones_urls",
      "antecedentes_no_penales_url",
    ];

    const filteredUpdates = Object.fromEntries(
      Object.entries(updatesForRPC).filter(
        ([key, value]) =>
          safeFields.includes(key) && value !== undefined && value !== null
      )
    );

    // 4. Preparar datos para RPC como objeto JSONB
    // Supabase convierte automáticamente objetos JavaScript a JSONB en PostgreSQL
    console.log("📝 Datos para RPC:", filteredUpdates);

    // 5. Llamar a la función RPC update_profile
    // Nota: Supabase convertirá automáticamente el objeto JavaScript a JSONB
    const { data: updatedUserId, error: rpcError } = await supabase.rpc(
      "update_profile",
      {
        user_id_in: userId,
        updates: filteredUpdates as any, // Supabase convertirá esto a JSONB automáticamente
      }
    );

    if (rpcError) {
      console.error("❌ Error de RPC update_profile:", rpcError);

      // Manejo específico de errores
      if (rpcError.message.includes("No tienes permisos")) {
        throw new Error("Error de permisos: No puedes actualizar este perfil.");
      }

      if (rpcError.message.includes("Usuario no encontrado")) {
        throw new Error("Error: El usuario no existe en la base de datos.");
      }

      if (rpcError.message.includes("No hay campos válidos")) {
        throw new Error(
          "Error: No se proporcionaron campos válidos para actualizar."
        );
      }

      throw new Error(
        `Error al actualizar perfil vía RPC: ${rpcError.message}`
      );
    }

    if (!updatedUserId) {
      throw new Error(
        "No se recibió confirmación de la actualización del perfil."
      );
    }

    console.log("✅ Perfil actualizado vía RPC, obteniendo perfil completo...");

    // 6. Obtener el perfil completo actualizado
    const { data: updatedProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (fetchError) {
      console.error("❌ Error obteniendo perfil actualizado:", fetchError);
      throw new Error(
        `Perfil actualizado pero no se pudo obtener: ${fetchError.message}`
      );
    }

    if (!updatedProfile) {
      throw new Error(
        "Perfil actualizado pero no se encontró en la base de datos."
      );
    }

    console.log(
      "✅ Perfil actualizado y obtenido exitosamente:",
      updatedProfile
    );
    return updatedProfile as Profesional;
  } catch (error) {
    console.error("❌ Error en updateUserProfileRPC:", error);
    throw error;
  }
}

/**
 * Función principal que intenta RPC primero, luego fallback a UPDATE tradicional
 */
export async function updateUserProfileWithFallback(
  userId: string,
  updates: Partial<Profesional>,
  locationAddress?: string
): Promise<Profesional> {
  try {
    // Intentar RPC primero (más robusto)
    console.log("🔄 Intentando actualización vía RPC...");
    return await updateUserProfileRPC(userId, updates, locationAddress);
  } catch (rpcError: any) {
    console.warn("⚠️ RPC falló, intentando UPDATE tradicional...", rpcError);

    // Si RPC falla porque la función no existe, usar UPDATE tradicional
    if (
      rpcError.message.includes("function") ||
      rpcError.message.includes("does not exist")
    ) {
      console.log("🔄 RPC no disponible, usando UPDATE tradicional...");
      const { updateUserProfileSafe } = await import("./actions-alternative");
      return await updateUserProfileSafe(userId, updates, locationAddress);
    }

    // Si es otro error, re-lanzarlo
    throw rpcError;
  }
}
