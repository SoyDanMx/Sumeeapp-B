import { NextResponse } from "next/server";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { leadId, method, notes } = await request.json();

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
        }
      }
    }

    if (!currentUser) {
      console.error("❌ [CONTACT LEAD] No hay usuario autenticado");
      return NextResponse.json(
        {
          error:
            "Debes iniciar sesión como profesional para reportar el contacto.",
        },
        { status: 401 }
      );
    }

    console.log("✅ [CONTACT LEAD] Usuario autenticado:", currentUser.id, currentUser.email);

    // Intentar primero con el cliente autenticado (para que auth.uid() funcione en el RPC)
    let lead = null;
    let error = null;

    try {
      const rpcResult = await supabase.rpc("mark_lead_contacted", {
        lead_uuid: leadId,
        method: method ?? "whatsapp",
        notes: notes ?? null,
      });

      if (rpcResult.data) {
        lead = Array.isArray(rpcResult.data) ? rpcResult.data[0] : rpcResult.data;
        error = rpcResult.error;
      } else {
        error = rpcResult.error || new Error("RPC retornó sin datos");
      }
    } catch (rpcException: any) {
      console.warn("⚠️ [CONTACT LEAD] Excepción al llamar RPC mark_lead_contacted:", rpcException);
      error = rpcException;
    }

    // Si el RPC falla, intentar con admin client como fallback
    if (error || !lead) {
      console.warn("⚠️ [CONTACT LEAD] RPC falló, intentando con admin client. Error:", error?.message || error);
      
      const adminClient = createSupabaseAdminClient();

      if (!adminClient) {
        return NextResponse.json(
          {
            error: error?.message || "No se pudo registrar el contacto. Intenta nuevamente.",
          },
          { status: 500 }
        );
      }

      // Con admin client, necesitamos actualizar directamente ya que auth.uid() no funcionará
      const { data: existingLead } = await adminClient
        .from("leads")
        .select("*")
        .eq("id", leadId)
        .maybeSingle();

      if (!existingLead) {
        return NextResponse.json(
          {
            error: "Lead no encontrado.",
          },
          { status: 404 }
        );
      }

      if (existingLead.profesional_asignado_id !== currentUser.id) {
        return NextResponse.json(
          {
            error: "Este lead no está asignado a tu cuenta.",
          },
          { status: 403 }
        );
      }

      // Actualizar directamente con admin client
      const { data: updatedLead, error: updateError } = await adminClient
        .from("leads")
        .update({
          contacted_at: new Date().toISOString(),
          contact_method: method ?? "whatsapp",
          contact_notes: notes ?? null,
          appointment_status: "contactado",
          estado: "contactado",
          updated_at: new Date().toISOString(),
        })
        .eq("id", leadId)
        .select("*")
        .maybeSingle();

      if (updateError || !updatedLead) {
        return NextResponse.json(
          {
            error: updateError?.message || "No se pudo registrar el contacto.",
          },
          { status: 400 }
        );
      }

      // Registrar evento manualmente
      try {
        await adminClient.from("lead_events").insert({
          lead_id: leadId,
          actor_id: currentUser.id,
          actor_role: "profesional",
          event_type: "contacted",
          payload: {
            method: method ?? "whatsapp",
            notes: notes ?? null,
          },
        });
      } catch (eventError) {
        console.warn("⚠️ [CONTACT LEAD] No se pudo registrar evento (no crítico):", eventError);
      }

      lead = updatedLead;
      error = null; // Limpiar el error ya que el fallback funcionó
    }

    if (!lead) {
      return NextResponse.json(
        {
          error: error?.message || "No se pudo registrar el contacto.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ lead });
  } catch (error) {
    console.error("Error en /api/leads/contact:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Ocurrió un error inesperado al registrar el contacto.",
      },
      { status: 500 }
    );
  }
}
