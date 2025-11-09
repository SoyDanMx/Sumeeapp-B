import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Endpoint para Vercel Cron / programador externo.
 * Revisa leads cuyo tiempo de contacto expiró y aplica penalizaciones leves.
 */
export async function GET() {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return NextResponse.json(
      {
        error:
          "SUPABASE_SERVICE_ROLE_KEY no está configurado. Configúralo antes de programar este cron.",
      },
      { status: 500 }
    );
  }

  const nowIso = new Date().toISOString();

  const { data: overdueLeads, error } = await adminClient
    .from("leads")
    .select("id, profesional_asignado_id, engagement_points")
    .lte("contact_deadline_at", nowIso)
    .is("contacted_at", null)
    .in("appointment_status", ["pendiente_contacto", "contactado"]);

  if (error) {
    console.error("Cron lead-deadlines error:", error);
    return NextResponse.json(
      { error: "No se pudo revisar los deadlines." },
      { status: 500 }
    );
  }

  if (!overdueLeads || overdueLeads.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  for (const lead of overdueLeads) {
    try {
      await adminClient
        .from("leads")
        .update({ engagement_points: (lead.engagement_points ?? 0) - 5 })
        .eq("id", lead.id);

      await adminClient.from("lead_events").insert({
        lead_id: lead.id,
        actor_id: lead.profesional_asignado_id,
        actor_role: "sistema",
        event_type: "contact_deadline_missed",
        payload: { penalty: -5 },
      });
    } catch (updateError) {
      console.error("Error penalizando lead", lead.id, updateError);
    }
  }

  return NextResponse.json({ processed: overdueLeads.length });
}
