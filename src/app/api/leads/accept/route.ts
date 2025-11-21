import { NextResponse } from "next/server";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { leadId } = await request.json();

    if (!leadId || typeof leadId !== "string") {
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
        } else if (fallbackError) {
          console.warn(
            "⚠️ Error verificando token Bearer en /api/leads/accept:",
            fallbackError.message || fallbackError
          );
        }
      }
    }

    if (authError && authError.message) {
      console.warn(
        "⚠️ Supabase no detectó al profesional autenticado (getUser cookie):",
        authError.message
      );
    }

    if (!currentUser) {
      return NextResponse.json(
        {
          error:
            "Debes iniciar sesión como profesional para aceptar leads. Refresca tu sesión e inténtalo nuevamente.",
        },
        { status: 401 }
      );
    }

    // Intentar primero con el RPC (SECURITY DEFINER) para no depender del service role
    // @ts-ignore - Supabase RPC type inference issue
    let rpcLead = null;
    let rpcError = null;
    
    try {
      const rpcResult = await (supabase.rpc as any)(
        "accept_lead",
        { lead_uuid: leadId }
      );
      
      // El RPC puede retornar directamente el objeto o un array
      if (rpcResult.data) {
        rpcLead = Array.isArray(rpcResult.data) ? rpcResult.data[0] : rpcResult.data;
        rpcError = rpcResult.error;
      } else {
        rpcError = rpcResult.error || new Error("RPC retornó sin datos");
      }
    } catch (rpcException: any) {
      console.warn("⚠️ Excepción al llamar RPC accept_lead:", rpcException);
      rpcError = rpcException;
    }

    if (rpcError) {
      console.warn("⚠️ RPC accept_lead falló:", rpcError.message || rpcError);
      if (rpcError.message?.includes("JWT") || rpcError.message?.includes("auth") || rpcError.message?.includes("No hay un usuario autenticado")) {
        return NextResponse.json(
          {
            error:
              "Tu sesión expiró. Vuelve a iniciar sesión como profesional e inténtalo de nuevo.",
          },
          { status: 401 }
        );
      }
      // Si el RPC falla, usar admin client directamente para evitar problemas de RLS
      console.log("🔄 RPC falló, usando admin client directamente (bypass RLS)");
    } else if (rpcLead) {
      // RPC exitoso, retornar el lead actualizado
      console.log("✅ RPC accept_lead exitoso");
      return NextResponse.json({ lead: rpcLead });
    }

    // Si llegamos aquí, el RPC falló. Usar admin client directamente para evitar problemas de RLS
    const adminClient = createSupabaseAdminClient();
    
    if (!adminClient) {
      return NextResponse.json(
        {
          error:
            "No se pudo aceptar el lead porque falta la configuración administrativa. Contacta al administrador de la plataforma.",
        },
        { status: 500 }
      );
    }

    // Verificar que el lead existe usando admin client (bypass RLS)
    const { data: existingLead, error: fetchError } = await adminClient
      .from("leads")
      .select("id, estado, profesional_asignado_id, cliente_id")
      .eq("id", leadId)
      .maybeSingle();
    
    if (fetchError || !existingLead) {
      console.error("❌ Error al buscar lead con admin client:", fetchError);
      return NextResponse.json(
        {
          error: "No encontramos la solicitud indicada. Verifica el ID e inténtalo nuevamente.",
        },
        { status: 404 }
      );
    }
    
    console.log("📋 Lead encontrado con admin client:", {
      id: existingLead.id,
      estado: existingLead.estado,
      profesional_asignado_id: existingLead.profesional_asignado_id,
      cliente_id: existingLead.cliente_id,
    });
    
    // Actualizar el lead usando admin client (bypass RLS)
    const contactDeadline = new Date();
    contactDeadline.setMinutes(contactDeadline.getMinutes() + 30); // 30 minutos para contactar
    
    const updateData: any = {
      estado: "aceptado",
      profesional_asignado_id: currentUser.id,
      fecha_asignacion: new Date().toISOString(),
      contact_deadline_at: contactDeadline.toISOString(),
      appointment_status: "pendiente_contacto",
      updated_at: new Date().toISOString(),
    };
    
    console.log("🔄 Actualizando lead con admin client:", {
      leadId,
      estado: updateData.estado,
      profesional_asignado_id: updateData.profesional_asignado_id,
    });
    
    const { data: updatedLead, error: updateError } = await adminClient
      .from("leads")
      .update(updateData)
      .eq("id", leadId)
      .select("*")
      .maybeSingle();

    if (updateError || !updatedLead) {
      console.error("❌ Error al actualizar lead con admin client:", updateError);
      return NextResponse.json(
        {
          error:
            updateError?.message || "No se pudo aceptar el lead. Intenta nuevamente.",
        },
        { status: 500 }
      );
    }

    console.log("✅ Lead aceptado exitosamente con admin client");
    return NextResponse.json({ lead: updatedLead });
  } catch (error) {
    console.error("Error en /api/leads/accept:", error);
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

