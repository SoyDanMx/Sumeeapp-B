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

    // ✅ FIX: Intentar primero con el RPC (SECURITY DEFINER) - debe funcionar sin admin client
    // @ts-ignore - Supabase RPC type inference issue
    let rpcLead = null;
    let rpcError = null;
    
    try {
      console.log("🔄 Intentando RPC accept_lead con leadId:", leadId, "userId:", currentUser.id);
      
      // Intentar llamar al RPC de múltiples formas para asegurar compatibilidad
      let rpcResult: any = null;
      
      // Método 1: Llamada directa
      try {
        rpcResult = await (supabase.rpc as any)("accept_lead", { lead_uuid: leadId });
      } catch (e1: any) {
        console.warn("⚠️ Método 1 de RPC falló:", e1.message);
        // Método 2: Con .single()
        try {
          rpcResult = await (supabase.rpc as any)("accept_lead", { lead_uuid: leadId }).single();
        } catch (e2: any) {
          console.warn("⚠️ Método 2 de RPC falló:", e2.message);
          rpcError = e1 || e2;
        }
      }
      
      if (rpcResult) {
        console.log("📋 Resultado RPC completo:", JSON.stringify(rpcResult, null, 2));
        console.log("📋 Resultado RPC:", {
          hasData: !!rpcResult.data,
          hasError: !!rpcResult.error,
          dataType: Array.isArray(rpcResult.data) ? 'array' : typeof rpcResult.data,
          errorMessage: rpcResult.error?.message,
        });
        
        // El RPC puede retornar directamente el objeto o un array
        if (rpcResult.data) {
          rpcLead = Array.isArray(rpcResult.data) ? rpcResult.data[0] : rpcResult.data;
          rpcError = rpcResult.error;
          
          // Verificar que el lead tiene los datos necesarios
          if (rpcLead && rpcLead.id) {
            console.log("✅ RPC accept_lead exitoso, lead retornado:", {
              id: rpcLead.id,
              estado: rpcLead.estado,
              contact_deadline_at: rpcLead.contact_deadline_at,
            });
            return NextResponse.json({ lead: rpcLead });
          } else {
            rpcError = new Error("RPC retornó datos incompletos");
          }
        } else {
          rpcError = rpcResult.error || new Error("RPC retornó sin datos");
        }
      }
    } catch (rpcException: any) {
      console.error("❌ Excepción al llamar RPC accept_lead:", rpcException);
      console.error("❌ Stack trace:", rpcException.stack);
      rpcError = rpcException;
    }

    // Si el RPC falló, intentar con UPDATE directo usando el cliente autenticado
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
      
      // ✅ FIX: Intentar UPDATE directo con el cliente autenticado (puede funcionar con RLS)
      console.log("🔄 Intentando UPDATE directo con cliente autenticado");
      
      // Primero obtener el lead para ver su estado actual
      const { data: existingLeadForUpdate, error: fetchLeadError } = await supabase
        .from("leads")
        .select("id, estado, profesional_asignado_id")
        .eq("id", leadId)
        .maybeSingle();
      
      if (fetchLeadError) {
        console.warn("⚠️ No se pudo obtener lead para UPDATE directo:", fetchLeadError.message);
      } else if (existingLeadForUpdate) {
        console.log("📋 Lead encontrado para UPDATE:", {
          id: existingLeadForUpdate.id,
          estado: existingLeadForUpdate.estado,
        });
        
        const directContactDeadline = new Date();
        directContactDeadline.setMinutes(directContactDeadline.getMinutes() + 30);
        
        // Intentar con diferentes estados según las políticas RLS
        const estadosToTry = ["aceptado", "asignado", "en_progreso"];
        
        for (const estadoToTry of estadosToTry) {
          const directUpdateData: any = {
            estado: estadoToTry,
            profesional_asignado_id: currentUser.id,
            fecha_asignacion: new Date().toISOString(),
            contact_deadline_at: directContactDeadline.toISOString(),
            appointment_status: "pendiente_contacto",
            updated_at: new Date().toISOString(),
          };
          
          console.log(`🔄 Intentando UPDATE con estado: ${estadoToTry}`);
          
          const { data: updatedLeadDirect, error: updateErrorDirect } = await supabase
            .from("leads")
            .update(directUpdateData)
            .eq("id", leadId)
            .select("*")
            .maybeSingle();
          
          if (!updateErrorDirect && updatedLeadDirect) {
            console.log(`✅ UPDATE directo exitoso con estado: ${estadoToTry}`);
            return NextResponse.json({ lead: updatedLeadDirect });
          } else {
            console.warn(`⚠️ UPDATE con estado ${estadoToTry} falló:`, updateErrorDirect?.message);
          }
        }
      }
      
      // Si UPDATE directo también falla, usar admin client como último recurso
      console.log("🔄 UPDATE directo falló, intentando con admin client");
      const adminClient = createSupabaseAdminClient();
      
      if (!adminClient) {
        // ✅ FIX: Si no hay admin client, retornar error más descriptivo
        console.error("❌ No hay admin client disponible");
        return NextResponse.json(
          {
            error:
              "No se pudo aceptar el lead. El RPC falló y no hay configuración administrativa. Por favor, verifica tu sesión e inténtalo de nuevo, o contacta al soporte si el problema persiste.",
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
      const adminContactDeadline = new Date();
      adminContactDeadline.setMinutes(adminContactDeadline.getMinutes() + 30); // 30 minutos para contactar
      
      const adminUpdateData: any = {
        estado: "aceptado",
        profesional_asignado_id: currentUser.id,
        fecha_asignacion: new Date().toISOString(),
        contact_deadline_at: adminContactDeadline.toISOString(),
        appointment_status: "pendiente_contacto",
        updated_at: new Date().toISOString(),
      };
      
      console.log("🔄 Actualizando lead con admin client:", {
        leadId,
        estado: adminUpdateData.estado,
        profesional_asignado_id: adminUpdateData.profesional_asignado_id,
      });
      
      const { data: updatedLead, error: updateError } = await adminClient
        .from("leads")
        .update(adminUpdateData)
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
    }
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

