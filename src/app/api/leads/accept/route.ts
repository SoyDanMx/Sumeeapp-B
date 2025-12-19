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

    // ✅ SOLUCIÓN CON FALLBACK: Intentar con admin client primero, luego con cliente autenticado
    const adminClient = createSupabaseAdminClient();
    const useAdminClient = !!adminClient;

    if (!useAdminClient) {
      console.warn("⚠️ [ACCEPT LEAD] Admin client no disponible. Usando cliente autenticado con RPC/UPDATE.");
    }

    // Paso 1: Verificar que el lead existe
    console.log("🔍 [ACCEPT LEAD] Verificando existencia del lead:", leadId);
    
    let existingLead: any = null;
    let fetchError: any = null;

    if (useAdminClient) {
      // Usar admin client si está disponible
      const result = await adminClient!
        .from("leads")
        .select("id, estado, profesional_asignado_id, cliente_id")
        .eq("id", leadId)
        .maybeSingle();
      existingLead = result.data;
      fetchError = result.error;
    } else {
      // Usar cliente autenticado como fallback
      const result = await supabase
        .from("leads")
        .select("id, estado, profesional_asignado_id, cliente_id")
        .eq("id", leadId)
        .maybeSingle();
      existingLead = result.data;
      fetchError = result.error;
    }

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

    // Paso 3: Intentar aceptar el lead usando RPC primero (funciona con cliente autenticado)
    console.log("🔄 [ACCEPT LEAD] Intentando aceptar lead con RPC...");
    let rpcLead = null;
    let rpcError = null;

    try {
      const rpcResult = await (supabase.rpc as any)(
        "accept_lead",
        { lead_uuid: leadId }
      );
      
      if (rpcResult.data) {
        rpcLead = Array.isArray(rpcResult.data) ? rpcResult.data[0] : rpcResult.data;
        rpcError = rpcResult.error;
      } else {
        rpcError = rpcResult.error || new Error("RPC retornó sin datos");
      }
    } catch (rpcException: any) {
      console.warn("⚠️ [ACCEPT LEAD] Excepción al llamar RPC accept_lead:", rpcException);
      rpcError = rpcException;
    }

    if (!rpcError && rpcLead) {
      console.log("✅ [ACCEPT LEAD] Lead aceptado exitosamente con RPC");
      return NextResponse.json({ lead: rpcLead });
    }

    // Paso 4: Si RPC falla, intentar con UPDATE directo
    console.warn("⚠️ [ACCEPT LEAD] RPC falló, intentando UPDATE directo. Error:", rpcError?.message || rpcError);
    
    const contactDeadline = new Date();
    contactDeadline.setMinutes(contactDeadline.getMinutes() + 30); // 30 minutos para contactar

    // Determinar qué estado usar según el estado actual del lead
    // ✅ Usar 'Asignado' que es válido en el constraint y indica que el lead fue aceptado
    const currentEstado = existingLead.estado?.toLowerCase();
    const newEstado = 'Asignado'; // Usar 'Asignado' que es válido en el constraint

    console.log(`🔄 [ACCEPT LEAD] Actualizando lead con ${useAdminClient ? 'admin client' : 'cliente autenticado'}...`);
    console.log(`🔄 [ACCEPT LEAD] Estado actual: ${currentEstado}, Nuevo estado: ${newEstado}`);

    const clientToUse = useAdminClient ? adminClient! : supabase;
    const { data: updatedLead, error: updateError } = await clientToUse
      .from("leads")
      .update({
        estado: newEstado,
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

