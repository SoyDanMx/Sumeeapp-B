import { NextResponse } from "next/server";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";

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
    const adminClient = createSupabaseAdminClient();

    if (!adminClient) {
      return NextResponse.json(
        {
          error:
            "SUPABASE_SERVICE_ROLE_KEY no está configurado. Contacta al administrador de la plataforma.",
        },
        { status: 500 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Debes iniciar sesión como profesional para aceptar leads." },
        { status: 401 }
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
    const { data: updatedLead, error: updateError } = await adminClient
      .from("leads")
      .update({
        estado: "aceptado",
        profesional_asignado_id: user.id,
        fecha_asignacion: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", leadId)
      .select(
        "id, cliente_id, profesional_asignado_id, estado, whatsapp, ubicacion_lat, ubicacion_lng, ubicacion_direccion, descripcion_proyecto, servicio_solicitado, fecha_creacion, photos_urls"
      )
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

