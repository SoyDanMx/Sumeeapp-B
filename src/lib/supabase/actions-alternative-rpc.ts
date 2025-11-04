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
    console.log(
      "📝 Número de campos a actualizar:",
      Object.keys(filteredUpdates).length
    );

    // Validar que hay campos para actualizar
    if (Object.keys(filteredUpdates).length === 0) {
      throw new Error("No hay campos válidos para actualizar en el perfil.");
    }

    // 5. Llamar a la función RPC update_profile
    // Nota: Supabase convertirá automáticamente el objeto JavaScript a JSONB
    console.log("🔄 Llamando a RPC update_profile con:", {
      user_id_in: userId,
      updates: filteredUpdates,
    });

    const { data: updatedUserId, error: rpcError } = await supabase.rpc(
      "update_profile",
      {
        user_id_in: userId,
        updates: filteredUpdates as any, // Supabase convertirá esto a JSONB automáticamente
      }
    );

    if (rpcError) {
      // Verificar si el error es un objeto vacío o tiene propiedades primero
      const errorKeys = Object.keys(rpcError);
      
      // Determinar si este error puede ser manejado por el fallback
      const isFallbackError = errorKeys.length === 0;

      // Solo usar console.error para errores críticos que NO deben usar fallback
      // Para errores manejables, usar console.warn
      if (isFallbackError) {
        console.warn("⚠️ Error de RPC (objeto vacío), se intentará fallback:", rpcError);
        console.warn("⚠️ Tipo de error:", typeof rpcError);
        console.warn("📝 Parámetros enviados a RPC:", {
          user_id_in: userId,
          updates: filteredUpdates,
        });
      } else {
        console.error("❌ Error de RPC update_profile:", rpcError);
        console.error("❌ Tipo de error:", typeof rpcError);
        console.error(
          "❌ Error completo (stringified):",
          JSON.stringify(rpcError, null, 2)
        );
        console.error("❌ Detalles del error:", {
          message: rpcError.message,
          details: rpcError.details,
          hint: rpcError.hint,
          code: rpcError.code,
          toString: rpcError.toString?.(),
        });
        console.error("❌ Claves del objeto error:", errorKeys);
      }

      if (errorKeys.length === 0) {
        // Este es un error manejable por fallback, lanzar un error simple
        // El catch en updateUserProfileWithFallback lo manejará
        throw new Error("RPC_FALLBACK_NEEDED");
      }

      // Si el error no tiene mensaje, intentar obtener más información
      const errorMessage =
        rpcError.message ||
        rpcError.details ||
        rpcError.hint ||
        rpcError.code ||
        (typeof rpcError === "string" ? rpcError : "") ||
        (errorKeys.length > 0
          ? `Error con código: ${JSON.stringify(rpcError)}`
          : "Error desconocido");

      // Verificar si este error puede usar fallback
      const canUseFallback = 
        errorMessage.includes("function") ||
        errorMessage.includes("does not exist") ||
        errorMessage.includes("no existe") ||
        errorMessage.includes("42883") ||
        errorMessage.includes("42804");

      if (canUseFallback) {
        console.warn("⚠️ Error de RPC (función no existe), se intentará fallback:", errorMessage);
        throw new Error("RPC_FALLBACK_NEEDED");
      }

      // Errores que NO deben usar fallback (errores de validación)
      if (
        errorMessage.includes("No hay campos válidos") ||
        errorMessage.includes("no valid fields") ||
        errorMessage.includes("No se proporcionaron campos válidos")
      ) {
        console.error("❌ Error de validación, no se usará fallback:", errorMessage);
        throw new Error(
          "Error: No se proporcionaron campos válidos para actualizar."
        );
      }

      // Otros errores críticos
      console.error("❌ Mensaje de error extraído:", errorMessage);

      if (
        errorMessage.includes("No tienes permisos") ||
        errorMessage.includes("permission denied") ||
        errorMessage.includes("42501")
      ) {
        throw new Error(
          "Error de permisos: No puedes actualizar este perfil. Verifica tus permisos en Supabase."
        );
      }

      if (
        errorMessage.includes("Usuario no encontrado") ||
        errorMessage.includes("not found") ||
        errorMessage.includes("PGRST116")
      ) {
        throw new Error("Error: El usuario no existe en la base de datos.");
      }

      // Si llegamos aquí, es un error desconocido pero manejable por fallback
      console.warn("⚠️ Error desconocido de RPC, se intentará fallback:", errorMessage);
      throw new Error("RPC_FALLBACK_NEEDED");
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
    const errorMessage = rpcError?.message || String(rpcError) || "";

    // Si el error es "RPC_FALLBACK_NEEDED", usar fallback automáticamente sin logs de error
    if (errorMessage === "RPC_FALLBACK_NEEDED") {
      console.log("🔄 RPC no disponible, usando UPDATE tradicional como fallback...");
      try {
        const { updateUserProfileSafe } = await import("./actions-alternative");
        const result = await updateUserProfileSafe(
          userId,
          updates,
          locationAddress
        );
        console.log(
          "✅ Fallback exitoso, perfil actualizado vía UPDATE tradicional"
        );
        return result;
      } catch (fallbackError: any) {
        console.error("❌ Fallback también falló:", fallbackError);
        throw new Error(
          `No se pudo actualizar el perfil. RPC no disponible y fallback falló: ${
            fallbackError?.message || "Error desconocido"
          }`
        );
      }
    }

    // Errores de validación de datos (NO usar fallback)
    const isValidationError =
      errorMessage.includes("No hay campos válidos") ||
      errorMessage.includes("no valid fields") ||
      errorMessage.includes("No se proporcionaron campos válidos");

    if (isValidationError) {
      // Estos errores son del usuario, no del sistema, así que no usar fallback
      throw rpcError;
    }

    // Para cualquier otro error, intentar fallback
    console.warn("⚠️ RPC falló con error desconocido, intentando fallback...", rpcError);
    try {
      const { updateUserProfileSafe } = await import("./actions-alternative");
      const result = await updateUserProfileSafe(
        userId,
        updates,
        locationAddress
      );
      console.log(
        "✅ Fallback exitoso, perfil actualizado vía UPDATE tradicional"
      );
      return result;
    } catch (fallbackError: any) {
      console.error("❌ Fallback también falló:", fallbackError);
      throw new Error(
        `No se pudo actualizar el perfil. RPC falló: ${errorMessage}. ` +
          `Fallback también falló: ${
            fallbackError?.message || "Error desconocido"
          }`
      );
    }
  }
}
