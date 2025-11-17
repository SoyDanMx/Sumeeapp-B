// supabase/functions/notify-pros/index.ts
// Edge Function para notificar a profesionales por email cuando hay un nuevo lead

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Configuración de Resend
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";

interface Lead {
  id: string;
  disciplina_ia?: string;
  servicio?: string;
  servicio_solicitado?: string;
  ubicacion_lat?: number;
  ubicacion_lng?: number;
  ubicacion_direccion?: string;
  nombre_cliente?: string;
  descripcion_proyecto?: string;
  priority_boost?: boolean;
}

interface Professional {
  email: string;
  full_name?: string;
  profession?: string;
  areas_servicio?: string[];
  ubicacion_lat?: number;
  ubicacion_lng?: number;
}

serve(async (req) => {
  // Manejar CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Obtener el lead del body
    const lead: Lead = await req.json();
    console.log("📧 notify-pros: Lead recibido:", lead);

    if (!lead.id) {
      throw new Error("Lead ID es requerido");
    }

    // Inicializar cliente de Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Configuración de Supabase faltante");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Determinar la disciplina del lead
    const disciplina =
      lead.disciplina_ia ||
      lead.servicio_solicitado ||
      lead.servicio ||
      "General";

    console.log("🔍 notify-pros: Buscando profesionales para disciplina:", disciplina);

    // Query para obtener profesionales que coincidan
    let query = supabase
      .from("profiles")
      .select("email, full_name, profession, areas_servicio, ubicacion_lat, ubicacion_lng")
      .eq("role", "profesional")
      .not("email", "is", null);

    // Filtrar por disciplina/profesión
    const disciplinaLower = disciplina.toLowerCase();
    
    // Si hay ubicación del lead, usar PostGIS para filtrar por distancia
    if (lead.ubicacion_lat && lead.ubicacion_lng) {
      query = query.or(
        `profession.ilike.%${disciplina}%,areas_servicio.cs.{${disciplina}}`
      );
    } else {
      // Sin ubicación, solo filtrar por disciplina
      query = query.or(
        `profession.ilike.%${disciplina}%,areas_servicio.cs.{${disciplina}}`
      );
    }

    const { data: professionals, error: queryError } = await query;

    if (queryError) {
      console.error("❌ Error consultando profesionales:", queryError);
      // Continuar sin filtrar por ubicación si falla
      const { data: allPros } = await supabase
        .from("profiles")
        .select("email, full_name, profession, areas_servicio")
        .eq("role", "profesional")
        .not("email", "is", null)
        .limit(100);

      if (!allPros || allPros.length === 0) {
        return new Response(
          JSON.stringify({ success: false, error: "No se encontraron profesionales" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Filtrar manualmente por disciplina
      const filtered = allPros.filter((p: any) => {
        const profession = (p.profession || "").toLowerCase();
        const areas = (p.areas_servicio || []).map((a: string) => a.toLowerCase());
        return (
          profession.includes(disciplinaLower) ||
          areas.some((a: string) => a.includes(disciplinaLower))
        );
      });

      if (filtered.length === 0) {
        return new Response(
          JSON.stringify({ success: true, notified: 0, message: "No hay profesionales que coincidan" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await sendEmailsToProfessionals(filtered, lead, disciplina);
      return new Response(
        JSON.stringify({ success: true, notified: filtered.length }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!professionals || professionals.length === 0) {
      console.log("⚠️ No se encontraron profesionales para esta disciplina");
      return new Response(
        JSON.stringify({ success: true, notified: 0, message: "No hay profesionales que coincidan" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Filtrar por distancia si tenemos ubicación del lead
    let finalProfessionals = professionals;
    if (lead.ubicacion_lat && lead.ubicacion_lng) {
      finalProfessionals = professionals.filter((p: any) => {
        if (!p.ubicacion_lat || !p.ubicacion_lng) return false;
        const distance = calculateDistance(
          lead.ubicacion_lat!,
          lead.ubicacion_lng!,
          p.ubicacion_lat,
          p.ubicacion_lng
        );
        return distance <= 50; // 50km
      });
    }

    if (finalProfessionals.length === 0) {
      return new Response(
        JSON.stringify({ success: true, notified: 0, message: "No hay profesionales dentro del radio" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`📧 notify-pros: Enviando emails a ${finalProfessionals.length} profesionales`);

    // Enviar emails
    await sendEmailsToProfessionals(finalProfessionals, lead, disciplina);

    return new Response(
      JSON.stringify({
        success: true,
        notified: finalProfessionals.length,
        lead_id: lead.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("❌ Error en notify-pros:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Calcula la distancia entre dos puntos en km usando la fórmula de Haversine
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Envía emails a los profesionales usando Resend
 */
async function sendEmailsToProfessionals(
  professionals: Professional[],
  lead: Lead,
  disciplina: string
) {
  if (!RESEND_API_KEY) {
    console.warn("⚠️ RESEND_API_KEY no configurada. Emails no se enviarán.");
    return;
  }

  const emailPromises = professionals.map(async (pro) => {
    try {
      const emailBody = generateEmailBody(lead, disciplina, pro);
      
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Sumee <notificaciones@sumeeapp.com>",
          to: pro.email,
          subject: `¡NUEVO LEAD DE ${disciplina.toUpperCase()} Cerca de ti!`,
          html: emailBody,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`❌ Error enviando email a ${pro.email}:`, error);
        return false;
      }

      console.log(`✅ Email enviado a ${pro.email}`);
      return true;
    } catch (error) {
      console.error(`❌ Error enviando email a ${pro.email}:`, error);
      return false;
    }
  });

  await Promise.all(emailPromises);
}

/**
 * Genera el HTML del email
 */
function generateEmailBody(lead: Lead, disciplina: string, pro: Professional): string {
  const nombreCliente = lead.nombre_cliente || "Cliente";
  const ubicacion = lead.ubicacion_direccion || "Ubicación no especificada";
  const descripcion = lead.descripcion_proyecto || "Sin descripción adicional";
  const priorityBadge = lead.priority_boost
    ? '<span style="background: #f59e0b; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">PRIORITARIO</span>'
    : "";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .lead-card { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 ¡Nuevo Lead Disponible!</h1>
          <p>${disciplina}</p>
          ${priorityBadge}
        </div>
        <div class="content">
          <div class="lead-card">
            <h2 style="margin-top: 0; color: #667eea;">Detalles del Lead</h2>
            <p><strong>Cliente:</strong> ${nombreCliente}</p>
            <p><strong>Ubicación:</strong> ${ubicacion}</p>
            <p><strong>Descripción:</strong> ${descripcion}</p>
          </div>
          <p>Este lead coincide con tu perfil profesional. ¡Responde rápido para asegurar el trabajo!</p>
          <a href="https://sumeeapp.com/professional-dashboard" class="button">Ver Lead en Dashboard</a>
        </div>
        <div class="footer">
          <p>Sumee App - Conectando profesionales con clientes</p>
          <p>Este es un email automático. Por favor, no respondas a este mensaje.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

