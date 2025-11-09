import { NextResponse } from "next/server";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { leadId, appointmentAt, notes, action } = await request.json();

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
      return NextResponse.json(
        {
          error:
            "Debes iniciar sesión para actualizar la cita de este trabajo.",
        },
        { status: 401 }
      );
    }

    const adminClient = createSupabaseAdminClient();

    if (!adminClient) {
      return NextResponse.json(
        {
          error:
            "No se pudo actualizar la cita porque falta la configuración administrativa.",
        },
        { status: 500 }
      );
    }

    let lead;
    let error;

    if (action === "confirm") {
      const result = await adminClient
        .rpc("confirm_lead_appointment", { lead_uuid: leadId })
        .maybeSingle();
      lead = result.data;
      error = result.error;
    } else {
      if (!appointmentAt) {
        return NextResponse.json(
          { error: "Debes proporcionar la fecha y hora de la cita." },
          { status: 400 }
        );
      }

      const result = await adminClient
        .rpc("schedule_lead_appointment", {
          lead_uuid: leadId,
          appointment_ts: appointmentAt,
          notes: notes ?? null,
        })
        .maybeSingle();
      lead = result.data;
      error = result.error;
    }

    if (error || !lead) {
      return NextResponse.json(
        {
          error:
            error?.message ||
            "No se pudo actualizar la cita. Verifica la información e inténtalo nuevamente.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ lead });
  } catch (error) {
    console.error("Error en /api/leads/appointment:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Ocurrió un error inesperado al actualizar la cita.",
      },
      { status: 500 }
    );
  }
}
