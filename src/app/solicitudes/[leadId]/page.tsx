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

  // Obtener datos iniciales del lead
  // PATRÓN DEFENSIVO: No usar .single() para evitar race conditions
  // después de crear un lead. En su lugar, manejamos manualmente el caso
  // donde no se encuentra el lead o el array está vacío.
  const { data: leads, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId);

  // Verificar errores de consulta
  if (error) {
    console.error("Error fetching lead:", error);
    notFound();
  }

  // Verificar que se encontró exactamente un lead
  // Esto maneja el caso de "race condition" donde el lead no es visible aún
  if (!leads || leads.length === 0) {
    console.warn(`Lead ${leadId} no encontrado. Puede ser una race condition.`);
    notFound();
  }

  // Extraer el lead del array (sabemos que existe porque verificamos arriba)
  const lead = leads[0];

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
    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "full_name, email, avatar_url, profession, whatsapp, calificacion_promedio"
      )
      .eq("user_id", lead.profesional_asignado_id)
      .maybeSingle();

    if (profile) {
      profesionalAsignado = profile;
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
