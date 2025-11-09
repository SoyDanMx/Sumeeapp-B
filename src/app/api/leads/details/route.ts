import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import {
  createServerClient,
  type CookieOptions,
} from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { Lead } from "@/types/supabase";

export const runtime = "nodejs";

const LEAD_SELECT = `
  *,
  lead_reviews (
    id,
    rating,
    comment,
    created_at,
    created_by
  ),
  profesional_asignado:profiles!leads_profesional_asignado_id_fkey (
    user_id,
    full_name,
    avatar_url,
    profession,
    whatsapp,
    calificacion_promedio,
    areas_servicio
  )
`;

type LeadReviewPayload = {
  id: string;
  rating: number;
  comment?: string | null;
  created_at: string;
  created_by: string;
};

type LeadWithReview = Lead & { lead_review: LeadReviewPayload | null };

function normalizeLead(data: any): LeadWithReview {
  const { lead_reviews, ...rest } = data ?? {};
  return {
    ...(rest as Lead),
    lead_review: Array.isArray(lead_reviews) ? lead_reviews[0] ?? null : null,
  } as LeadWithReview;
}

export async function GET(request: NextRequest) {
  const leadId = request.nextUrl.searchParams.get("leadId");

  if (!leadId) {
    return NextResponse.json(
      { message: "Falta el parámetro leadId." },
      { status: 400 }
    );
  }

  try {
    const adminClient = createSupabaseAdminClient();

    if (adminClient) {
      const { data, error } = await adminClient
        .from("leads")
        .select(LEAD_SELECT)
        .eq("id", leadId)
        .maybeSingle();

      if (error) {
        console.warn(
          "⚠️ Admin client falló al obtener lead detallado:",
          error
        );
      } else if (data) {
        return NextResponse.json({ lead: normalizeLead(data) });
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        {
          message:
            "La aplicación no está configurada correctamente. Falta la URL o clave ANON de Supabase.",
        },
        { status: 500 }
      );
    }

    const supabaseFromCookies = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(_name: string, _value: string, _options: CookieOptions) {
            // noop en rutas; en lecturas no necesitamos actualizar cookies
          },
          remove(_name: string, _options: CookieOptions) {
            // noop en rutas; en lecturas no necesitamos actualizar cookies
          },
        },
      }
    );
    const {
      data: { user: cookieUser },
    } = await supabaseFromCookies.auth.getUser();

    let authUser = cookieUser ?? null;
    let supabaseClient = supabaseFromCookies;

    if (!authUser) {
      const authHeader = request.headers.get("authorization");
      const bearerToken =
        authHeader && authHeader.toLowerCase().startsWith("bearer ")
          ? authHeader.slice(7)
          : null;

      if (bearerToken) {
        const supabaseWithToken = createClient(supabaseUrl, supabaseAnonKey, {
          global: {
            headers: {
              Authorization: `Bearer ${bearerToken}`,
            },
          },
        });

        const { data: tokenUser, error: tokenError } =
          await supabaseWithToken.auth.getUser(bearerToken);

        if (tokenError) {
          console.warn("⚠️ No se pudo validar el token proporcionado:", {
            message: tokenError.message,
            name: tokenError.name,
          });
        } else if (tokenUser?.user) {
          authUser = tokenUser.user;
          supabaseClient = supabaseWithToken;
        }
      }
    }

    if (!authUser) {
      return NextResponse.json(
        {
          message:
            "Debes iniciar sesión para consultar los detalles de esta solicitud.",
        },
        { status: 401 }
      );
    }

    const { data, error } = await supabaseClient
      .from("leads")
      .select(LEAD_SELECT)
      .eq("id", leadId)
      .maybeSingle();

    if (error) {
      console.error("❌ Error con client supabase al obtener lead detallado:", {
        ...error,
        hint: error.hint,
        details: error.details,
        code: error.code,
      });
      return NextResponse.json(
        {
          message:
            error.message ||
            "No pudimos obtener la información detallada de la solicitud. Verifica tus permisos.",
        },
        { status: 403 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { message: "No encontramos la solicitud solicitada." },
        { status: 404 }
      );
    }

    const isAuthorized =
      data.cliente_id === authUser.id ||
      data.profesional_asignado_id === authUser.id ||
      data.cliente_id === null;

    if (!isAuthorized) {
      return NextResponse.json(
        {
          message:
            "No tienes permisos para ver esta solicitud. Si crees que es un error, contacta a soporte.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({ lead: normalizeLead(data) });
  } catch (error) {
    console.error("❌ Error inesperado en /api/leads/details:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Ocurrió un error inesperado obteniendo los detalles de la solicitud.",
      },
      { status: 500 }
    );
  }
}

