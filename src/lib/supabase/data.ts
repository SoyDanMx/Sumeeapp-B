// src/lib/supabase/data.ts

import { supabase } from "@/lib/supabase/client";
import { geocodeAddress } from "@/lib/geocoding"; // Importamos la utilidad que acabamos de crear
import { Profesional, Lead } from "@/types/supabase"; // Importamos los tipos necesarios
import { PostgrestError } from "@supabase/supabase-js"; // Importamos PostgrestError para manejar errores de RPC

// =========================================================================
// 🚨 NUEVA ESTRUCTURA DE BASE DE DATOS 🚨
// =========================================================================
// La nueva estructura separa claramente:
// - profiles: Usuarios base (clientes y profesionales)
// - profesionales: Datos específicos de profesionales
// - leads: Solicitudes de servicios
// =========================================================================

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
    .from("profiles")
    .select("user_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error de diagnóstico RLS/Permisos:", error);
    throw new Error(
      `Error de permisos (Código: ${error.code}). Asegura la política SELECT/RLS.`
    );
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
      throw new Error(
        "No se pudo obtener las coordenadas de la dirección proporcionada. Intenta ser más específico."
      );
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
    .from("profiles")
    // El upsert intentará insertar; si user_id ya existe, lo actualizará
    .upsert([dataToUpdate], { onConflict: "user_id" });

  if (error) {
    console.error("Error de Supabase al actualizar/insertar perfil:", error);
    // Devuelve un error más claro al frontend
    if (error.code === "42501") {
      throw new Error(
        "Error de permisos (RLS). Asegura la Política de UPDATE en Supabase."
      );
    }
    throw new Error(`Falló la actualización del perfil: ${error.message}`);
  }
}

// =========================================================================
// LÓGICA DE GESTIÓN DE LEADS (Conexión Cliente-Profesional)
// =========================================================================

/**
 * Envía un nuevo lead desde el formulario del cliente.
 * Utiliza una función RPC con SECURITY DEFINER para resolver problemas de RLS.
 * Esta arquitectura resuelve el problema de permisos de FOREIGN KEY al ejecutar
 * la función con privilegios de superusuario.
 * Soporta tanto usuarios autenticados como anónimos.
 * @param leadData Datos del lead incluyendo servicio, ubicación y WhatsApp
 */
export async function submitLead(leadData: {
  servicio: string;
  ubicacion: string;
  whatsapp: string;
  nombre_cliente?: string;
  descripcion_proyecto?: string; // Nueva opción para proyectos grandes con descripción detallada
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

    // 🆕 FASE 1: FALLBACK - Actualizar perfil del cliente si no tiene ubicación
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Verificar si el perfil del cliente tiene ubicación
        const { data: profile } = await supabase
          .from('profiles')
          .select('ubicacion_lat, ubicacion_lng, whatsapp')
          .eq('user_id', session.user.id)
          .single();
        
        if (profile && !profile.ubicacion_lat && lat && lng) {
          console.log('🆕 Primer lead del cliente, actualizando perfil con ubicación');
          
          // Extraer ciudad de la dirección (aproximado)
          const cityGuess = leadData.ubicacion.toLowerCase().includes('cdmx') ||
                           leadData.ubicacion.toLowerCase().includes('ciudad de méxico') ||
                           leadData.ubicacion.toLowerCase().includes('mexico city')
                           ? 'Ciudad de México'
                           : 'Ciudad de México'; // Default
          
          // Actualizar perfil con ubicación del lead
          // Nota: 'city' podría no existir en schema antiguo, pero no es crítico
          await supabase
            .from('profiles')
            .update({
              ubicacion_lat: lat,
              ubicacion_lng: lng,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', session.user.id);
          
          console.log('✅ Perfil del cliente actualizado con ubicación:', { lat, lng, city: cityGuess });
        }
        
        // También actualizar WhatsApp si no lo tiene
        if (profile && !profile.whatsapp && leadData.whatsapp) {
          console.log('🆕 Guardando WhatsApp en perfil del cliente');
          await supabase
            .from('profiles')
            .update({
              whatsapp: leadData.whatsapp,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', session.user.id);
          
          // También actualizar en metadata de auth
          await supabase.auth.updateUser({
            data: { whatsapp: leadData.whatsapp }
          });
          
          console.log('✅ WhatsApp guardado en perfil');
        }
      }
    } catch (profileError) {
      // No fallar el lead si hay error actualizando el perfil
      console.warn('⚠️ Error actualizando perfil del cliente (no crítico):', profileError);
    }

    // Preparar la descripción del proyecto
    // Si se proporciona descripcion_proyecto, usarla; si no, construir una genérica
    const descripcion_proyecto =
      leadData.descripcion_proyecto ||
      `Servicio de ${leadData.servicio} solicitado. Ubicación: ${leadData.ubicacion}`;
    const nombre_cliente = leadData.nombre_cliente || "Cliente"; // Valor por defecto si no se proporciona

    // Debug: Mostrar los datos que se van a enviar a la función RPC
    console.log("🔍 submitLead - Llamando a función RPC create_lead con:", {
      nombre_cliente,
      whatsapp: leadData.whatsapp,
      servicio: leadData.servicio,
      ubicacion: leadData.ubicacion,
      lat: lat || 19.4326,
      lng: lng || -99.1332,
    });

    // Llamar a la función RPC create_lead
    // Esta función tiene SECURITY DEFINER, por lo que resuelve automáticamente
    // los problemas de permisos de FOREIGN KEY
    const { data: leadId, error } = await supabase.rpc("create_lead", {
      nombre_cliente_in: nombre_cliente,
      whatsapp_in: leadData.whatsapp,
      descripcion_proyecto_in: descripcion_proyecto,
      servicio_in: leadData.servicio,
      ubicacion_lat_in: lat || 19.4326, // CDMX por defecto si no se puede geocodificar
      ubicacion_lng_in: lng || -99.1332, // CDMX por defecto si no se puede geocodificar
      ubicacion_direccion_in: leadData.ubicacion || null,
    });

    if (error) {
      console.error("❌ Error al crear lead via RPC:", error);
      console.error("❌ Detalles del error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      throw new Error(`Error al crear el lead: ${error.message}`);
    }

    if (!leadId) {
      throw new Error("No se recibió el ID del lead creado");
    }

    // Retornar el ID del lead creado
    // El lead completo se obtendrá después con getLeadById() cuando sea necesario
    // Esto evita problemas de permisos de SELECT inmediatamente después de la creación
    return {
      success: true,
      leadId: leadId,
      lead: { id: leadId }, // Estructura mínima, el lead completo se obtendrá después
    };
  } catch (error: any) {
    console.error("Error en submitLead:", error);
    throw error;
  }
}

/**
 * Función para que el Profesional acepte un lead y lo asigne a sí mismo.
 * @param leadId ID del lead a aceptar.
 * @param profesionalId ID del profesional que acepta el lead (auth.uid()).
 */
export async function acceptLead(leadId: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const response = await fetch("/api/leads/accept", {
    method: "POST",
    headers,
    body: JSON.stringify({ leadId }),
    credentials: "include",
  });

  if (!response.ok) {
    let message = "No se pudo aceptar el lead. Intenta nuevamente.";
    try {
      const errorPayload = await response.json();
      if (errorPayload?.error) {
        message = errorPayload.error;
      }
    } catch {
      // ignore json parsing errors
    }
    throw new Error(message);
  }

  const payload = (await response.json()) as { lead: Lead };

  return {
    success: true,
    lead: payload.lead,
  };
}

export async function markLeadContacted(
  leadId: string,
  method: string,
  notes?: string
) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const response = await fetch("/api/leads/contact", {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify({ leadId, method, notes }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(
      payload?.error ??
        "No se pudo registrar el contacto. Intenta nuevamente."
    );
  }

  const payload = (await response.json()) as { lead: Lead };
  return payload.lead;
}

export async function scheduleLeadAppointment(
  leadId: string,
  appointmentAt: string,
  notes?: string
) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const response = await fetch("/api/leads/appointment", {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify({
      leadId,
      appointmentAt,
      notes,
      action: "schedule",
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(
      payload?.error ??
        "No se pudo agendar la cita. Verifica la información e inténtalo nuevamente."
    );
  }

  const payload = (await response.json()) as { lead: Lead };
  return payload.lead;
}

export async function confirmLeadAppointment(leadId: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const response = await fetch("/api/leads/appointment", {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify({
      leadId,
      action: "confirm",
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(
      payload?.error ??
        "No se pudo confirmar la cita. Intenta nuevamente más tarde."
    );
  }

  const payload = (await response.json()) as { lead: Lead };
  return payload.lead;
}

export async function completeLeadWork(leadId: string, notes?: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const response = await fetch("/api/leads/complete", {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify({
      leadId,
      notes,
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(
      payload?.error ??
        "No se pudo marcar el trabajo como completado. Intenta nuevamente."
    );
  }

  const payload = (await response.json()) as { lead: Lead };
  return payload.lead;
}

export async function submitLeadReview(
  leadId: string,
  rating: number,
  comment?: string
) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const response = await fetch("/api/leads/review", {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify({ leadId, rating, comment }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(
      payload?.error ??
        "No se pudo registrar la reseña. Inténtalo nuevamente más tarde."
    );
  }

  const payload = await response.json();
  return payload.review;
}

/**
 * Obtiene un lead específico por su ID
 * PATRÓN DEFENSIVO: No usar .single() para evitar race conditions
 * después de crear un lead. En su lugar, manejamos manualmente el caso
 * donde no se encuentra el lead o el array está vacío.
 * @param leadId ID del lead a obtener
 */
export async function getLeadById(leadId: string) {
  try {
    // Primero obtener el lead básico (sin .single() para evitar race conditions)
    const { data: leads, error: leadError } = await supabase
      .from("leads")
      .select("*")
      .eq("id", leadId);

    if (leadError) {
      throw new Error(`Error al obtener el lead: ${leadError.message}`);
    }

    // Verificar que se encontró exactamente un lead
    // Esto maneja el caso de "race condition" donde el lead no es visible aún
    if (!leads || leads.length === 0) {
      throw new Error("Lead no encontrado");
    }

    // Extraer el lead del array (sabemos que existe porque verificamos arriba)
    const lead = leads[0];

    // Si hay un profesional asignado, obtener su perfil
    if (lead.profesional_asignado_id) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select(
          "full_name, email, avatar_url, profession, whatsapp, calificacion_promedio"
        )
        .eq("user_id", lead.profesional_asignado_id)
        .maybeSingle();

      if (!profileError && profile) {
        return {
          ...lead,
          profesional_asignado: profile,
        };
      }
    }

    // Retornar el lead sin profesional asignado si no hay uno o no se pudo obtener
    return {
      ...lead,
      profesional_asignado: null,
    };
  } catch (error) {
    console.error("Error en getLeadById:", error);
    throw error;
  }
}

/**
 * Obtiene todos los leads de un cliente específico
 * @param clientId ID del cliente (user_id)
 */
export async function getClientLeads(clientId: string) {
  try {
    console.log("🔍 getClientLeads - Buscando leads para cliente:", clientId);

    // Primero intentar con cliente_id si existe
    let { data, error } = await supabase
      .from("leads")
      .select(
        `
          *,
          lead_reviews (
            id,
            rating,
            comment,
            created_at,
            created_by
          ),
          profesional_asignado:profiles!leads_profesional_asignado_id_fkey (
            user_id,
            full_name,
            avatar_url,
            profession,
            whatsapp,
            calificacion_promedio,
            areas_servicio
          )
        `
      )
      .eq("cliente_id", clientId)
      .order("fecha_creacion", { ascending: false });

    // Si no hay datos y hay error, intentar con nombre_cliente como fallback
    if ((!data || data.length === 0) && error) {
      console.log(
        "🔍 getClientLeads - Intentando con nombre_cliente como fallback"
      );
      const fallbackQuery = await supabase
        .from("leads")
        .select("*")
        .not("nombre_cliente", "is", null)
        .order("fecha_creacion", { ascending: false });

      data = fallbackQuery.data;
      error = fallbackQuery.error;
    }

    if (error) {
      console.error("❌ Error getting client leads:", error);
      return [];
    }

    console.log("✅ getClientLeads - Leads encontrados:", data?.length || 0);
    const normalized =
      data?.map((lead) => {
        const { lead_reviews, ...rest } = lead as any;
        return {
          ...(rest as any),
          lead_review: Array.isArray(lead_reviews)
            ? lead_reviews[0] ?? null
            : null,
        };
      }) ?? [];

    return normalized;
  } catch (error) {
    console.error("❌ Error en getClientLeads:", error);
    return [];
  }
}

export async function getClientLeadDetails(leadId: string) {
  try {
    let accessToken: string | undefined;
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      accessToken = session?.access_token;
    } catch (sessionError) {
      console.warn("⚠️ No se pudo obtener la sesión del cliente:", sessionError);
    }

    const response = await fetch(`/api/leads/details?leadId=${leadId}`, {
      method: "GET",
      credentials: "include",
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : undefined,
    });

    const rawBody = await response.text();
    let details: any = null;
    if (rawBody) {
      try {
        details = JSON.parse(rawBody);
      } catch (parseError) {
        console.error("❌ No se pudo parsear la respuesta de lead details:", {
          rawBody,
          parseError,
        });
      }
    }

    if (!response.ok) {
      console.error("❌ API lead details error:", {
        status: response.status,
        statusText: response.statusText,
        body: rawBody,
        details,
      });
      throw new Error(
        details?.message ||
          (response.status === 401
            ? "Debes iniciar sesión para ver los detalles del servicio."
            : response.status === 403
            ? "No tienes permisos para ver esta solicitud."
            : response.status === 404
            ? "No encontramos la solicitud solicitada."
            : response.status === 500
            ? "El servidor tuvo un problema al obtener los detalles del servicio."
            : null) ||
          "No pudimos obtener la información detallada de la solicitud."
      );
    }

    return details?.lead ?? null;
  } catch (error) {
    console.error("❌ Error en getClientLeadDetails:", error);
    throw error;
  }
}

// =========================================================================
// NUEVAS FUNCIONES PARA LA ESTRUCTURA REDISEÑADA
// =========================================================================

/**
 * Obtiene todos los profesionales con sus datos completos
 * Usa la vista profesionales_completos que combina profiles + profesionales
 */
export async function getProfesionalesCompletos() {
  try {
    const { data, error } = await supabase
      .from("profesionales_completos")
      .select("*")
      .order("profile_created_at", { ascending: false });

    if (error) {
      console.error("Error getting complete professionals:", error);
      throw new Error(`Error al obtener profesionales: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error("Error en getProfesionalesCompletos:", error);
    throw error;
  }
}

/**
 * Obtiene un profesional específico con datos completos
 * @param userId ID del usuario profesional
 */
export async function getProfesionalCompleto(userId: string) {
  try {
    const { data, error } = await supabase
      .from("profesionales_completos")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error getting complete professional:", error);
      throw new Error(`Error al obtener profesional: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error en getProfesionalCompleto:", error);
    throw error;
  }
}

/**
 * Actualiza los datos específicos de un profesional
 * @param userId ID del usuario profesional
 * @param updates Datos a actualizar
 */
export async function updateProfesionalData(userId: string, updates: any) {
  try {
    const { error } = await supabase
      .from("profesionales")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating professional data:", error);
      throw new Error(
        `Error al actualizar datos del profesional: ${error.message}`
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Error en updateProfesionalData:", error);
    throw error;
  }
}

/**
 * Obtiene leads con información completa de cliente y profesional
 * Usa la vista leads_completos
 */
export async function getLeadsCompletos() {
  try {
    const { data, error } = await supabase
      .from("leads_completos")
      .select("*")
      .order("fecha_creacion", { ascending: false });

    if (error) {
      console.error("Error getting complete leads:", error);
      throw new Error(`Error al obtener leads: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error("Error en getLeadsCompletos:", error);
    throw error;
  }
}
