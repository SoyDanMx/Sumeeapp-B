import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  createSupabaseServerClient,
  createSupabaseAdminClient,
} from "@/lib/supabase/server";
import LeadStatusPageClient from "./LeadStatusPageClient";
import { Lead } from "@/types/supabase";

interface LeadStatusPageProps {
  params: Promise<{ leadId: string }>;
}

export async function generateMetadata({
  params,
}: LeadStatusPageProps): Promise<Metadata> {
  const { leadId } = await params;

  return {
    title: `Estado de Solicitud #${leadId.substring(0, 8)} | Sumee App`,
    description: "Sigue el estado de tu solicitud de servicio en tiempo real.",
  };
}

export default async function LeadStatusPage({ params }: LeadStatusPageProps) {
  const { leadId } = await params;
  const supabase = await createSupabaseServerClient();
  const adminSupabase = createSupabaseAdminClient();

  let lead: Lead | null = null;

  if (adminSupabase) {
    const { data, error } = await adminSupabase
      .from("leads")
      .select("*, lead_reviews(*)")
      .eq("id", leadId)
      .maybeSingle();

    if (data) {
      const { lead_reviews, ...rest } = data as any;
      lead = {
        ...(rest as Lead),
        lead_review: Array.isArray(lead_reviews) ? lead_reviews[0] ?? null : null,
      };
    } else if (error) {
      console.error("Error fetching lead with admin client:", error);
    }
  }

  if (!lead) {
    const { data, error } = await supabase
      .from("leads")
      .select("*, lead_reviews(*)")
      .eq("id", leadId)
      .maybeSingle();

    if (data) {
      const { lead_reviews, ...rest } = data as any;
      lead = {
        ...(rest as Lead),
        lead_review: Array.isArray(lead_reviews) ? lead_reviews[0] ?? null : null,
      };
    } else {
      if (error) {
        console.error("Error fetching lead with server client:", error);
      }
      notFound();
    }
  }

  // Obtener el usuario actual para verificar permisos
  // Para usuarios anónimos que acaban de crear un lead, esto puede ser null
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Para leads recién creados por usuarios anónimos, no requerimos autenticación
  // El usuario anónimo debe poder ver el lead que acaba de crear
  // Verificamos permisos solo si hay un usuario autenticado
  if (user) {
    // Verificar que el usuario es el cliente o el profesional asignado
    const isAuthorized =
      lead.cliente_id === user.id || lead.profesional_asignado_id === user.id;

    if (!isAuthorized) {
      // Usuario autenticado pero no autorizado
      notFound();
    }
  } else {
    // Usuario anónimo: solo puede ver leads sin cliente_id asignado (leads anónimos)
    // Esto permite que usuarios anónimos vean sus propios leads recién creados
    if (lead.cliente_id !== null) {
      // Lead pertenece a un cliente autenticado, usuario anónimo no puede verlo
      notFound();
    }
  }

  // Obtener información del profesional asignado si existe
  let profesionalAsignado = null;
  if (lead.profesional_asignado_id) {
    const profileClient = adminSupabase ?? supabase;
    const { data: profile, error: profileError } = await profileClient
      .from("profiles")
      .select(
        "full_name, email, avatar_url, profession, whatsapp, calificacion_promedio"
      )
      .eq("user_id", lead.profesional_asignado_id)
      .maybeSingle();

    if (profile) {
      profesionalAsignado = profile;
    } else if (profileError) {
      console.warn("No se pudo obtener el perfil del profesional:", profileError);
    }
  }

  // Construir el lead completo con información del profesional
  const leadComplete = {
    ...lead,
    profesional_asignado: profesionalAsignado,
  };

  return (
    <LeadStatusPageClient
      initialLead={leadComplete as any}
      currentUserId={user?.id || null}
    />
  );
}
