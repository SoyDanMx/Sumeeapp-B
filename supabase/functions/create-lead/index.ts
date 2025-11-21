import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-pkce-flow, x-requested-with",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method Not Allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase URL or Service Key not set.");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
      },
    });

    const body = await req.json();
    console.log("📝 create-lead Edge Function - Recibido:", {
      nombre_cliente: body.nombre_cliente,
      servicio: body.servicio,
      cliente_id: body.cliente_id,
      has_whatsapp: !!body.whatsapp,
      has_descripcion: !!body.descripcion_proyecto,
    });

    const {
      nombre_cliente,
      whatsapp,
      descripcion_proyecto,
      servicio,
      ubicacion_lat,
      ubicacion_lng,
      ubicacion_direccion,
      cliente_id,
      disciplina_ia,
      urgencia_ia,
      diagnostico_ia,
      imagen_url,
      photos_urls,
      priority_boost,
      ai_suggested_price_min,
      ai_suggested_price_max,
    } = body;

    // Validaciones básicas
    if (!nombre_cliente || !whatsapp || !descripcion_proyecto || !servicio || !cliente_id) {
      return new Response(
        JSON.stringify({ 
          error: "Campos requeridos faltantes",
          required: ["nombre_cliente", "whatsapp", "descripcion_proyecto", "servicio", "cliente_id"]
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insertar el lead usando service role (bypass RLS)
    const { data: insertedLead, error } = await supabase
      .from("leads")
      .insert({
        nombre_cliente,
        whatsapp,
        descripcion_proyecto,
        servicio,
        ubicacion_lat: ubicacion_lat || 19.4326, // Default CDMX
        ubicacion_lng: ubicacion_lng || -99.1332, // Default CDMX
        ubicacion_direccion: ubicacion_direccion || null,
        cliente_id,
        disciplina_ia: disciplina_ia || null,
        urgencia_ia: urgencia_ia ? Number(urgencia_ia) : null,
        diagnostico_ia: diagnostico_ia || null,
        imagen_url: imagen_url || null,
        photos_urls: photos_urls || null,
        priority_boost: priority_boost || false,
        ai_suggested_price_min: ai_suggested_price_min || null,
        ai_suggested_price_max: ai_suggested_price_max || null,
        estado: 'Nuevo',
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Error insertando lead:", error);
      return new Response(
        JSON.stringify({ 
          error: error.message, 
          details: error.details,
          code: error.code,
          hint: error.hint,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("✅ Lead creado exitosamente:", insertedLead.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        lead_id: insertedLead.id, 
        lead: insertedLead 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("❌ Error no manejado en create-lead Edge Function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Internal Server Error",
        stack: error.stack,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});



