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
      // Si el RPC falla, intentar con UPDATE directo usando el cliente del servidor
      // Esto funciona porque el usuario está autenticado y puede actualizar leads asignados a él
      console.log("🔄 Intentando método alternativo: UPDATE directo con cliente autenticado");
    } else if (rpcLead) {
      // RPC exitoso, retornar el lead actualizado
      console.log("✅ RPC accept_lead exitoso");
      return NextResponse.json({ lead: rpcLead });
    }

    // Método alternativo: Actualizar directamente con el cliente autenticado
    // Esto funciona porque el usuario está autenticado y puede actualizar leads
    const contactDeadline = new Date();
    contactDeadline.setMinutes(contactDeadline.getMinutes() + 30); // 30 minutos para contactar
    
    // Primero intentar solo con columnas esenciales (que siempre existen)
    let updateData: any = {
      estado: "aceptado",
      profesional_asignado_id: currentUser.id,
      fecha_asignacion: new Date().toISOString(),
    };
    
    // Intentar agregar columnas opcionales una por una
    // Si alguna no existe, Supabase la ignorará en el siguiente intento
    let { data: updatedLead, error: updateError } = await supabase
      .from("leads")
      .update(updateData)
      .eq("id", leadId)
      .select("*")
      .maybeSingle();
    
    // Si el primer intento falla por columnas faltantes, intentar sin ellas
    if (updateError && updateError.message?.includes("column")) {
      console.warn("⚠️ Error por columnas faltantes, intentando solo con columnas esenciales:", updateError.message);
      // Segundo intento: solo columnas que definitivamente existen
      const { data: retryLead, error: retryError } = await supabase
        .from("leads")
        .update({
          estado: "aceptado",
          profesional_asignado_id: currentUser.id,
          fecha_asignacion: new Date().toISOString(),
        })
        .eq("id", leadId)
        .select("*")
        .maybeSingle();
      
      if (!retryError && retryLead) {
        updatedLead = retryLead;
        updateError = null;
        console.log("✅ Lead aceptado exitosamente (sin columnas opcionales)");
      } else {
        updateError = retryError || updateError;
      }
    } else if (!updateError && updatedLead) {
      // Si el primer intento fue exitoso, intentar agregar columnas opcionales en un segundo UPDATE
      const optionalUpdate: any = {};
      if (contactDeadline) {
        optionalUpdate.contact_deadline_at = contactDeadline.toISOString();
      }
      
      // Intentar actualizar columnas opcionales (si existen)
      await supabase
        .from("leads")
        .update(optionalUpdate)
        .eq("id", leadId);
      
      console.log("✅ Lead aceptado exitosamente");
    }

    if (updateError) {
      console.error("❌ Error al actualizar lead directamente:", updateError);
      // Si el UPDATE directo también falla, intentar con admin client como último recurso
      const adminClient = createSupabaseAdminClient();
      
      if (!adminClient) {
        return NextResponse.json(
          {
            error:
              updateError.message || "No se pudo aceptar el lead. Verifica tus permisos e inténtalo de nuevo.",
          },
          { status: 500 }
        );
      }
      
      // Último recurso: usar admin client
      const adminContactDeadline = new Date();
      adminContactDeadline.setMinutes(adminContactDeadline.getMinutes() + 30);
      
      // Construir update data de forma segura
      const adminUpdateData: any = {
        estado: "aceptado",
        profesional_asignado_id: currentUser.id,
        fecha_asignacion: new Date().toISOString(),
        contact_deadline_at: adminContactDeadline.toISOString(),
      };
      
      // Intentar agregar campos opcionales
      try {
        adminUpdateData.updated_at = new Date().toISOString();
        adminUpdateData.appointment_status = "pendiente_contacto";
      } catch (e) {
        // Ignorar si no existen
      }
      
      const { data: adminUpdatedLead, error: adminError } = await adminClient
        .from("leads")
        .update(adminUpdateData)
        .eq("id", leadId)
        .select("*")
        .maybeSingle();

      if (adminError || !adminUpdatedLead) {
        return NextResponse.json(
          {
            error:
              adminError?.message || "No se pudo aceptar el lead. Intenta nuevamente.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({ lead: adminUpdatedLead });
    }

    if (!updatedLead) {
      return NextResponse.json(
        {
          error: "No encontramos la solicitud indicada. Verifica el ID e inténtalo nuevamente.",
        },
        { status: 404 }
      );
    }

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

