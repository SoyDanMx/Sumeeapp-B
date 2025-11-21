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
    const { data: rpcLead, error: rpcError } = await (supabase.rpc as any)(
      "accept_lead",
      { lead_uuid: leadId }
    ).single();

    if (rpcError) {
      console.warn("⚠️ RPC accept_lead falló:", rpcError.message || rpcError);
      if (rpcError.message?.includes("JWT") || rpcError.message?.includes("auth")) {
        return NextResponse.json(
          {
            error:
              "Tu sesión expiró. Vuelve a iniciar sesión como profesional e inténtalo de nuevo.",
          },
          { status: 401 }
        );
      }
      // Si el RPC falla, continuar con el método alternativo (admin client)
    } else if (rpcLead) {
      // RPC exitoso, retornar el lead actualizado
      return NextResponse.json({ lead: rpcLead });
    }

    // Si el RPC falla (por ejemplo, función no creada aún), intentar con el cliente admin
    const adminClient = createSupabaseAdminClient();

    if (!adminClient) {
      console.error(
        "❌ accept_lead RPC falló y no hay SUPABASE_SERVICE_ROLE_KEY configurado:",
        rpcError
      );
      return NextResponse.json(
        {
          error:
            "No se pudo aceptar el lead porque falta la configuración administrativa. Contacta al administrador de la plataforma.",
        },
        { status: 500 }
      );
    }

    // Obtener el lead antes de actualizar para validar su existencia
    const { data: existingLead, error: fetchError } = await adminClient
      .from("leads")
      .select(
        "id, cliente_id, profesional_asignado_id, estado, whatsapp, ubicacion_lat, ubicacion_lng, ubicacion_direccion, descripcion_proyecto, servicio_solicitado, fecha_creacion, photos_urls"
      )
      .eq("id", leadId)
      .maybeSingle();

    if (fetchError || !existingLead) {
      return NextResponse.json(
        {
          error:
            fetchError?.message ||
            "No encontramos la solicitud indicada. Verifica el ID e inténtalo nuevamente.",
        },
        { status: 404 }
      );
    }

    // Actualizar el lead con privilegios administrativos
    const contactDeadline = new Date();
    contactDeadline.setMinutes(contactDeadline.getMinutes() + 30); // 30 minutos para contactar
    
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

    if (updateError || !updatedLead) {
      return NextResponse.json(
        {
          error:
            updateError?.message ||
            "No pudimos marcar el lead como aceptado. Intenta nuevamente.",
        },
        { status: 500 }
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

