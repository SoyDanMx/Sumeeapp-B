import { NextResponse } from "next/server";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { leadId } = await request.json();

    console.log("🔍 [ACCEPT LEAD] Iniciando aceptación de lead:", leadId);

    if (!leadId || typeof leadId !== "string") {
      console.error("❌ [ACCEPT LEAD] leadId inválido:", leadId);
      return NextResponse.json(
        { error: "El ID del lead es obligatorio." },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    let currentUser = user;

    if ((!user || authError) && request.headers.has("Authorization")) {
      const token = request.headers
        .get("Authorization")
        ?.replace("Bearer ", "")
        .trim();

      if (token) {
        const {
          data: fallbackUser,
          error: fallbackError,
        } = await supabase.auth.getUser(token);

        if (!fallbackError && fallbackUser?.user) {
          currentUser = fallbackUser.user;
          console.log("✅ [ACCEPT LEAD] Usuario autenticado vía Bearer token:", currentUser.id);
        } else if (fallbackError) {
          console.warn(
            "⚠️ [ACCEPT LEAD] Error verificando token Bearer:",
            fallbackError.message || fallbackError
          );
        }
      }
    }

    if (authError && authError.message) {
      console.warn(
        "⚠️ [ACCEPT LEAD] Supabase no detectó al profesional autenticado (getUser cookie):",
        authError.message
      );
    }

    if (!currentUser) {
      console.error("❌ [ACCEPT LEAD] No hay usuario autenticado");
      return NextResponse.json(
        {
          error:
            "Debes iniciar sesión como profesional para aceptar leads. Refresca tu sesión e inténtalo nuevamente.",
        },
        { status: 401 }
      );
    }

    console.log("✅ [ACCEPT LEAD] Usuario autenticado:", currentUser.id, currentUser.email);

    // ✅ SOLUCIÓN DEFINITIVA: Usar admin client directamente para evitar problemas de RLS
    // Esto garantiza que el lead se pueda aceptar sin importar las políticas RLS
    const adminClient = createSupabaseAdminClient();
    
    if (!adminClient) {
      console.error("❌ [ACCEPT LEAD] No se pudo crear admin client. Verifica SUPABASE_SERVICE_ROLE_KEY.");
      return NextResponse.json(
        {
          error: "Error de configuración del servidor. Contacta al soporte técnico.",
        },
        { status: 500 }
      );
    }

    // Paso 1: Verificar que el lead existe
    console.log("🔍 [ACCEPT LEAD] Verificando existencia del lead:", leadId);
    const { data: existingLead, error: fetchError } = await adminClient
      .from("leads")
      .select("id, estado, profesional_asignado_id, cliente_id")
      .eq("id", leadId)
      .maybeSingle();

    if (fetchError) {
      console.error("❌ [ACCEPT LEAD] Error al buscar lead:", fetchError);
      return NextResponse.json(
        {
          error: "Error al buscar la solicitud. Intenta nuevamente.",
        },
        { status: 500 }
      );
    }

    if (!existingLead) {
      console.error("❌ [ACCEPT LEAD] Lead no encontrado con ID:", leadId);
      return NextResponse.json(
        {
          error: "No encontramos la solicitud indicada. Verifica el ID e inténtalo nuevamente.",
        },
        { status: 404 }
      );
    }

    console.log("✅ [ACCEPT LEAD] Lead encontrado:", {
      id: existingLead.id,
      estado: existingLead.estado,
      profesional_asignado_id: existingLead.profesional_asignado_id,
    });

    // Paso 2: Verificar que el lead está disponible para aceptar
    if (existingLead.profesional_asignado_id && existingLead.profesional_asignado_id !== currentUser.id) {
      console.warn("⚠️ [ACCEPT LEAD] Lead ya está asignado a otro profesional:", existingLead.profesional_asignado_id);
      return NextResponse.json(
        {
          error: "Esta solicitud ya fue aceptada por otro profesional.",
        },
        { status: 409 }
      );
    }

    // Paso 3: Actualizar el lead usando admin client (bypass RLS)
    const contactDeadline = new Date();
    contactDeadline.setMinutes(contactDeadline.getMinutes() + 30); // 30 minutos para contactar

    console.log("🔄 [ACCEPT LEAD] Actualizando lead con admin client...");
    const { data: updatedLead, error: updateError } = await adminClient
      .from("leads")
      .update({
        estado: "aceptado",
        profesional_asignado_id: currentUser.id,
        fecha_asignacion: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        contact_deadline_at: contactDeadline.toISOString(),
        appointment_status: "pendiente_contacto",
      })
      .eq("id", leadId)
      .select("*")
      .maybeSingle();

    if (updateError) {
      console.error("❌ [ACCEPT LEAD] Error al actualizar lead:", updateError);
      console.error("❌ [ACCEPT LEAD] Detalles del error:", {
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        code: updateError.code,
      });
      return NextResponse.json(
        {
          error: updateError.message || "No se pudo aceptar el lead. Intenta nuevamente.",
        },
        { status: 500 }
      );
    }

    if (!updatedLead) {
      console.error("❌ [ACCEPT LEAD] UPDATE no retornó lead (pero no hubo error). LeadId:", leadId);
      return NextResponse.json(
        {
          error: "No se pudo aceptar el lead. Intenta nuevamente.",
        },
        { status: 500 }
      );
    }

    console.log("✅ [ACCEPT LEAD] Lead aceptado exitosamente:", {
      id: updatedLead.id,
      estado: updatedLead.estado,
      profesional_asignado_id: updatedLead.profesional_asignado_id,
      contact_deadline_at: updatedLead.contact_deadline_at,
    });

    return NextResponse.json({ lead: updatedLead });
  } catch (error) {
    console.error("❌ [ACCEPT LEAD] Error inesperado:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Ocurrió un error inesperado al aceptar el lead.",
      },
      { status: 500 }
    );
  }
}

