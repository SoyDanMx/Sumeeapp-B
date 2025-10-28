import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import StatusTracker from "@/components/client/StatusTracker";
import ChatBox from "@/components/client/ChatBox";
import LeadStatusPageClient from "./LeadStatusPageClient";

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

  // Obtener datos iniciales del lead con información del profesional asignado
  const { data: lead, error } = await supabase
    .from("leads")
    .select(
      `
      *,
      profesional_asignado:profiles!leads_profesional_asignado_id_fkey(
        user_id,
        full_name,
        profession,
        calificacion_promedio,
        whatsapp,
        avatar_url
      )
    `
    )
    .eq("id", leadId)
    .single();

  if (error || !lead) {
    console.error("Error fetching lead:", error);
    notFound();
  }

  // Obtener el usuario actual para verificar permisos
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  // Verificar que el usuario es el cliente o el profesional asignado
  const isAuthorized =
    lead.cliente_id === user.id || lead.profesional_asignado_id === user.id;

  if (!isAuthorized) {
    notFound();
  }

  return (
    <LeadStatusPageClient initialLead={lead as any} currentUserId={user.id} />
  );
}
