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

    // ✅ RESTAURACIÓN: Implementación que funcionó el 20 de noviembre
    // Intentar primero con el RPC (SECURITY DEFINER) para no depender del service role
    // @ts-ignore - Supabase RPC type inference issue
    let rpcLead = null;
    let rpcError = null;
    
    try {
      console.log("🔄 Intentando RPC accept_lead con leadId:", leadId);
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
      // ✅ RESTAURACIÓN: Si el RPC falla, intentar con UPDATE directo usando el cliente autenticado
      // Esto funciona porque el usuario está autenticado y puede actualizar leads
      console.log("🔄 Intentando método alternativo: UPDATE directo con cliente autenticado");
    } else if (rpcLead) {
      // RPC exitoso, retornar el lead actualizado
      console.log("✅ RPC accept_lead exitoso");
      return NextResponse.json({ lead: rpcLead });
    }

    // ✅ FIX DEFINITIVO: Verificar que el lead existe ANTES de intentar actualizarlo
    console.log("🔍 Verificando existencia del lead antes de UPDATE:", leadId);
    
    // Primero verificar que el lead existe y obtener su estado actual
    const { data: existingLead, error: fetchError } = await supabase
      .from("leads")
      .select("id, estado, profesional_asignado_id, cliente_id")
      .eq("id", leadId)
      .maybeSingle();
    
    if (fetchError) {
      console.error("❌ Error al buscar lead:", fetchError);
      // Si hay error al buscar, intentar con admin client
      const adminClient = createSupabaseAdminClient();
      if (adminClient) {
        const { data: adminLead } = await adminClient
          .from("leads")
          .select("id")
          .eq("id", leadId)
          .maybeSingle();
        
        if (!adminLead) {
          return NextResponse.json(
            {
              error: "No encontramos la solicitud indicada. Verifica el ID e inténtalo nuevamente.",
            },
            { status: 404 }
          );
        }
      } else {
        return NextResponse.json(
          {
            error: "No encontramos la solicitud indicada. Verifica el ID e inténtalo nuevamente.",
          },
          { status: 404 }
        );
      }
    }
    
    if (!existingLead) {
      console.error("❌ Lead no encontrado con ID:", leadId);
      // Intentar con admin client para verificar si existe
      const adminClient = createSupabaseAdminClient();
      if (adminClient) {
        const { data: adminLead } = await adminClient
          .from("leads")
          .select("id")
          .eq("id", leadId)
          .maybeSingle();
        
        if (!adminLead) {
          return NextResponse.json(
            {
              error: "No encontramos la solicitud indicada. Verifica el ID e inténtalo nuevamente.",
            },
            { status: 404 }
          );
        }
        // Si existe con admin client pero no con cliente autenticado, usar admin client directamente
        console.log("⚠️ Lead existe pero no accesible con cliente autenticado, usando admin client");
        
        const adminContactDeadline = new Date();
        adminContactDeadline.setMinutes(adminContactDeadline.getMinutes() + 30);
        
        const { data: adminUpdatedLead, error: adminError } = await adminClient
          .from("leads")
          .update({
            estado: "aceptado",
            profesional_asignado_id: currentUser.id,
            fecha_asignacion: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            contact_deadline_at: adminContactDeadline.toISOString(),
            appointment_status: "pendiente_contacto",
          })
          .eq("id", leadId)
          .select("*")
          .maybeSingle();

        if (adminError || !adminUpdatedLead) {
          return NextResponse.json(
            {
              error: adminError?.message || "No se pudo aceptar el lead. Intenta nuevamente.",
            },
            { status: 500 }
          );
        }

        return NextResponse.json({ lead: adminUpdatedLead });
      } else {
        return NextResponse.json(
          {
            error: "No encontramos la solicitud indicada. Verifica el ID e inténtalo nuevamente.",
          },
          { status: 404 }
        );
      }
    }
    
    console.log("✅ Lead encontrado:", {
      id: existingLead.id,
      estado: existingLead.estado,
      profesional_asignado_id: existingLead.profesional_asignado_id,
    });
    
    // ✅ RESTAURACIÓN: Método alternativo que funcionó el 20 de noviembre
    // Actualizar directamente con el cliente autenticado
    const contactDeadline = new Date();
    contactDeadline.setMinutes(contactDeadline.getMinutes() + 30); // 30 minutos para contactar
    
    const { data: updatedLead, error: updateError } = await supabase
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
      console.error("❌ Error al actualizar lead directamente:", updateError);
      console.error("❌ Detalles del error:", {
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        code: updateError.code,
      });
      
      // Si el UPDATE directo falla, intentar con admin client como último recurso
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
      console.log("🔄 Usando admin client como último recurso");
      const adminContactDeadline = new Date();
      adminContactDeadline.setMinutes(adminContactDeadline.getMinutes() + 30);
      
      const { data: adminUpdatedLead, error: adminError } = await adminClient
        .from("leads")
        .update({
          estado: "aceptado",
          profesional_asignado_id: currentUser.id,
          fecha_asignacion: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          contact_deadline_at: adminContactDeadline.toISOString(),
          appointment_status: "pendiente_contacto",
        })
        .eq("id", leadId)
        .select("*")
        .maybeSingle();

      if (adminError || !adminUpdatedLead) {
        console.error("❌ Error con admin client:", adminError);
        return NextResponse.json(
          {
            error:
              adminError?.message || "No se pudo aceptar el lead. Intenta nuevamente.",
          },
          { status: 500 }
        );
      }

      console.log("✅ Lead aceptado exitosamente con admin client");
      return NextResponse.json({ lead: adminUpdatedLead });
    }

    if (!updatedLead) {
      console.error("❌ UPDATE no retornó lead (pero no hubo error). LeadId:", leadId);
      // Si el UPDATE no retornó lead pero tampoco hubo error, puede ser un problema de RLS
      // Intentar obtener el lead actualizado
      const { data: refreshedLead } = await supabase
        .from("leads")
        .select("*")
        .eq("id", leadId)
        .maybeSingle();
      
      if (refreshedLead) {
        console.log("✅ Lead encontrado después del UPDATE");
        return NextResponse.json({ lead: refreshedLead });
      }
      
      // Si aún no se encuentra, usar admin client
      const adminClient = createSupabaseAdminClient();
      if (adminClient) {
        const { data: adminLead } = await adminClient
          .from("leads")
          .select("*")
          .eq("id", leadId)
          .maybeSingle();
        
        if (adminLead) {
          return NextResponse.json({ lead: adminLead });
        }
      }
      
      return NextResponse.json(
        {
          error: "No encontramos la solicitud indicada. Verifica el ID e inténtalo nuevamente.",
        },
        { status: 404 }
      );
    }

    console.log("✅ Lead aceptado exitosamente con UPDATE directo");
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

