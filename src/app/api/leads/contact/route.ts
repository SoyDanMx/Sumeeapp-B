import { NextResponse } from "next/server";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";

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
      return NextResponse.json(
        {
          error:
            "Debes iniciar sesión como profesional para reportar el contacto.",
        },
        { status: 401 }
      );
    }

    const adminClient = createSupabaseAdminClient();

    if (!adminClient) {
      return NextResponse.json(
        {
          error:
            "No se pudo registrar el contacto porque falta la configuración administrativa.",
        },
        { status: 500 }
      );
    }

    const { data: lead, error } = await adminClient
      .rpc("mark_lead_contacted", {
        lead_uuid: leadId,
        method: method ?? "whatsapp",
        notes: notes ?? null,
      })
      .maybeSingle();

    if (error || !lead) {
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
