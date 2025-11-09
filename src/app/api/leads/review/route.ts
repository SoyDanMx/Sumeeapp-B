import { NextResponse } from "next/server";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { leadId, rating, comment } = await request.json();

    if (!leadId || typeof leadId !== "string") {
      return NextResponse.json(
        { error: "El ID del lead es obligatorio." },
        { status: 400 }
      );
    }

    if (!rating || typeof rating !== "number") {
      return NextResponse.json(
        { error: "La calificación es obligatoria." },
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
        { error: "Debes iniciar sesión para dejar una reseña." },
        { status: 401 }
      );
    }

    const adminClient = createSupabaseAdminClient();

    if (!adminClient) {
      return NextResponse.json(
        {
          error:
            "No se pudo registrar la reseña porque falta la configuración administrativa.",
        },
        { status: 500 }
      );
    }

    const { data: review, error } = await adminClient
      .rpc("create_lead_review", {
        lead_uuid: leadId,
        rating,
        comment: comment ?? null,
      })
      .maybeSingle();

    if (error || !review) {
      return NextResponse.json(
        {
          error:
            error?.message ||
            "No se pudo registrar la reseña. Verifica la información e inténtalo nuevamente.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ review });
  } catch (error) {
    console.error("Error en /api/leads/review:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Ocurrió un error inesperado al registrar la reseña.",
      },
      { status: 500 }
    );
  }
}
