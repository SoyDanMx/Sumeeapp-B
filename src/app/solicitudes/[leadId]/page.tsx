import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server-new';
import LeadStatusClient from './LeadStatusClient';

interface LeadStatusPageProps {
  params: Promise<{ leadId: string }>;
}

export async function generateMetadata({ params }: LeadStatusPageProps): Promise<Metadata> {
  const { leadId } = await params;
  
  return {
    title: `Estado de Solicitud #${leadId} | Sumee App`,
    description: 'Sigue el estado de tu solicitud de servicio en tiempo real.',
  };
}

export default async function LeadStatusPage({ params }: LeadStatusPageProps) {
  const { leadId } = await params;
  const supabase = await createSupabaseServerClient();

  // Obtener datos iniciales del lead
  const { data: lead, error } = await supabase
    .from('leads')
    .select(`
      *,
      profesional_asignado:profesional_asignado_id(
        full_name,
        profession,
        calificacion_promedio,
        whatsapp,
        avatar_url
      )
    `)
    .eq('id', leadId)
    .single();

  if (error || !lead) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LeadStatusClient initialLead={lead} />
    </div>
  );
}
