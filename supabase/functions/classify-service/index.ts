import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Modelos: gemini-pro para texto, gemini-pro-vision para multimodal
const MODEL_TEXT = "gemini-pro";
const MODEL_VISION = "gemini-1.5-pro";

// Función para generar system prompt según el rol
function getSystemPrompt(role: string | null, discipline: string | null): string {
  if (role && discipline) {
    // Prompts especializados por rol
    const rolePrompts: Record<string, string> = {
      "Ingeniero Eléctrico": `Eres un **Ingeniero Eléctrico Certificado** especialista en instalaciones eléctricas residenciales, comerciales e industriales. Tu expertise incluye: seguridad eléctrica, código eléctrico, eficiencia energética, cableado, tableros eléctricos, y sistemas de iluminación.\n\n` +
        `IMPORTANTE: Si el cliente menciona "lámpara", "instalar lámpara", "bombilla", "foco", "luz", "cable", "interruptor", "contacto", "enchufe" o cualquier trabajo eléctrico, DEBES clasificarlo como **Electricidad**.\n\n` +
        `Analiza el problema del cliente como un ingeniero eléctrico profesional. Proporciona un diagnóstico técnico preciso y una descripción detallada del problema.`,

      "Ingeniero Hidráulico": `Eres un **Ingeniero Hidráulico** especialista en sistemas de agua potable, drenaje, presión y calentamiento. Tu expertise incluye: presión de agua, códigos de plomería, eficiencia hídrica, sistemas de bombeo, y tuberías.\n\n` +
        `Analiza el problema del cliente como un ingeniero hidráulico profesional. Proporciona un diagnóstico técnico preciso y una descripción detallada del problema.`,

      "Ingeniero en Sistemas - Especialista en CCTV": `Eres un **Ingeniero en Sistemas especialista en CCTV** con expertise en cámaras de seguridad, sistemas de monitoreo, seguridad electrónica, y redes de videovigilancia.\n\n` +
        `Analiza el problema del cliente como un especialista en sistemas de seguridad. Proporciona un diagnóstico técnico preciso y una descripción detallada del proyecto.`,

      "Arquitecto Constructor": `Eres un **Arquitecto Constructor** especialista en obras, estructuras, acabados y permisos de construcción. Tu expertise incluye: diseño arquitectónico, construcción, albañilería, y acabados.\n\n` +
        `Analiza el problema del cliente como un arquitecto constructor profesional. Proporciona un diagnóstico técnico preciso y una descripción detallada del proyecto.`,

      "Especialista en Jardinería y Gardening": `Eres un **Especialista en Jardinería y Gardening** con expertise en diseño paisajístico, plantas, riego, y mantenimiento de jardines.\n\n` +
        `Analiza el problema del cliente como un especialista en jardinería profesional. Proporciona un diagnóstico preciso y una descripción detallada del proyecto.`,

      "Ingeniero en HVAC": `Eres un **Ingeniero en HVAC** especialista en climatización, refrigeración y eficiencia energética.\n\n` +
        `Analiza el problema del cliente como un ingeniero en HVAC profesional. Proporciona un diagnóstico técnico preciso y una descripción detallada del problema.`,
    };

    return rolePrompts[role] || `Eres un especialista en ${discipline}. Analiza el problema del cliente y proporciona un diagnóstico preciso.`;
  }

  // Prompt genérico si no hay rol
  return "Actúa como un clasificador de servicios de mantenimiento muy preciso. Analiza el problema del cliente (texto e imagen si está disponible) y clasifícalo en una de las siguientes disciplinas: Electricidad, Plomería, HVAC (Aire Acondicionado), Carpintería, Albañilería, Pintura, Limpieza, Jardinería, Otros.\n\n" +
    "REGLAS IMPORTANTES DE CLASIFICACIÓN:\n" +
    "- Si menciona 'lámpara', 'instalar lámpara', 'bombilla', 'foco', 'luz', 'cable', 'interruptor', 'contacto', 'enchufe' o cualquier trabajo eléctrico → Electricidad\n" +
    "- Si menciona 'electricista' o 'para electricista' → SIEMPRE Electricidad\n" +
    "- Si menciona 'agua', 'fuga', 'llave', 'tubería', 'drenaje' → Plomería\n" +
    "- Si menciona 'aire acondicionado', 'clima', 'refrigeración' → HVAC\n" +
    "- Si menciona 'madera', 'mueble', 'carpintero' → Carpintería\n" +
    "- Si menciona 'pintar', 'pintor', 'pintura' → Pintura\n\n" +
    "Tu respuesta debe ser SOLO un objeto JSON con esta estructura exacta: { \"disciplina\": \"nombre exacto de la disciplina\", \"urgencia\": \"número del 1 al 10\", \"diagnostico\": \"descripción breve (máx. 15 palabras)\", \"descripcion_final\": \"descripción completa y detallada del problema\" }.";
}

// Función para obtener imagen desde URL y convertirla a base64
async function getImageBase64(imageUrl: string): Promise<string> {
  try {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Error al obtener imagen: ${imageResponse.status}`);
    }
    const imageBlob = await imageResponse.blob();
    const arrayBuffer = await imageBlob.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    return base64;
  } catch (error) {
    console.error("Error procesando imagen:", error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Método no permitido. Usa POST." }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }

  try {
    // Get Gemini API key
    const apiKey = Deno.env.get("GEMINI_API_KEY");

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY no está configurada en Supabase.");
    }

    // Parse request body
    const body = await req.json();
    const description = typeof body?.description === "string"
      ? body.description.trim()
      : "";
    const imageUrl = typeof body?.image_url === "string" && body.image_url.trim()
      ? body.image_url.trim()
      : null;
    const discipline = typeof body?.discipline === "string" ? body.discipline : null;
    const role = typeof body?.role === "string" ? body.role : null;

    if (!description && !imageUrl) {
      return new Response(
        JSON.stringify({
          error:
            "Debes enviar al menos un campo 'description' o 'image_url' con el problema.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Determinar modelo: usar visión si hay imagen
    const model = imageUrl ? MODEL_VISION : MODEL_TEXT;

    // Generar system prompt según el rol
    const systemPromptText = getSystemPrompt(role, discipline);

    // Construir partes del mensaje
    const parts: any[] = [];

    // Agregar texto si existe
    if (description) {
      let textPrompt = "";
      
      if (discipline && role) {
        // Si hay disciplina y rol seleccionados, usar contexto especializado
        const disciplineMap: Record<string, string> = {
          "electricidad": "Electricidad",
          "plomeria": "Plomería",
          "cctv": "CCTV y Seguridad",
          "construccion": "Construcción",
          "jardineria": "Jardinería",
          "aire-acondicionado": "HVAC",
          "carpinteria": "Carpintería",
          "pintura": "Pintura",
          "limpieza": "Limpieza",
          "wifi": "Redes WiFi",
          "fumigacion": "Fumigación",
          "tablaroca": "Tablaroca",
          "cerrajeria": "Cerrajería",
        };
        
        const disciplinaNombre = disciplineMap[discipline] || discipline;
        
        textPrompt = imageUrl
          ? `Analiza esta imagen y el siguiente problema descrito por el cliente. El cliente ya seleccionó la disciplina "${disciplinaNombre}" y tú eres un ${role}.\n\nProblema del cliente: ${description}\n\nComo ${role}, proporciona un diagnóstico técnico preciso (máx. 15 palabras), asigna una urgencia del 1 al 10, y crea una descripción final completa y profesional del problema. La disciplina debe ser "${disciplinaNombre}".`
          : `El cliente ya seleccionó la disciplina "${disciplinaNombre}" y tú eres un ${role}.\n\nProblema del cliente: ${description}\n\nComo ${role}, proporciona un diagnóstico técnico preciso (máx. 15 palabras), la urgencia (1-10), y una descripción final completa y profesional del problema. La disciplina debe ser "${disciplinaNombre}".`;
      } else {
        // Prompt genérico si no hay disciplina seleccionada
        textPrompt = imageUrl
          ? `Analiza esta imagen y el siguiente problema descrito por el cliente. Clasifica el problema en una disciplina siguiendo las reglas de clasificación. Si el cliente menciona específicamente "electricista" o "para electricista", DEBES clasificarlo como Electricidad. Si menciona "lámpara", "instalar lámpara", "bombilla", "foco", "luz", "cable", "interruptor" o cualquier trabajo eléctrico, clasifícalo como Electricidad.\n\nProblema del cliente: ${description}\n\nProporciona un diagnóstico sugerido (máx. 15 palabras), asigna una urgencia del 1 al 10, y crea una descripción final completa del problema.`
          : `Clasifica este problema siguiendo las reglas de clasificación. Si el cliente menciona específicamente "electricista" o "para electricista", DEBES clasificarlo como Electricidad. Si menciona "lámpara", "instalar lámpara", "bombilla", "foco", "luz", "cable", "interruptor" o cualquier trabajo eléctrico, clasifícalo como Electricidad.\n\nProblema del cliente: ${description}\n\nProporciona un diagnóstico sugerido (máx. 15 palabras), la urgencia (1-10), y una descripción final completa del problema.`;
      }
      
      parts.push({ text: textPrompt });
    }

    // Agregar imagen si existe
    if (imageUrl) {
      try {
        const imageBase64 = await getImageBase64(imageUrl);
        const mimeType = imageUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)
          ? `image/${imageUrl.split('.').pop()?.toLowerCase()}`
          : "image/jpeg";

        parts.push({
          inline_data: {
            mime_type: mimeType,
            data: imageBase64,
          },
        });
      } catch (imageError) {
        console.error("Error procesando imagen:", imageError);
        // Continuar sin imagen si hay error
      }
    }

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            role: "system",
            parts: [{ text: systemPromptText }],
          },
          contents: [
            {
              role: "user",
              parts: parts,
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorPayload = await response.text();
      console.error("Gemini API error:", errorPayload);
      throw new Error(
        `Error en Gemini API: ${response.status} ${response.statusText}`,
      );
    }

    // Parse Gemini response
    const geminiResult = await response.json();
    const textResponse = geminiResult?.candidates?.[0]?.content?.parts?.[0]
      ?.text;

    if (!textResponse) {
      console.error("Respuesta inesperada de Gemini:", geminiResult);
      throw new Error("La IA no devolvió un resultado válido.");
    }

    // Parse JSON response
    let parsed;
    try {
      parsed = JSON.parse(textResponse);
    } catch (parseError) {
      console.error("Error parseando JSON de Gemini:", parseError, textResponse);
      throw new Error("La respuesta de la IA no es un JSON válido.");
    }

    // Validar y normalizar respuesta
    const normalizedResponse = {
      disciplina: parsed.disciplina || parsed.discipline || "Otros",
      urgencia: parsed.urgencia || parsed.urgency || parsed.urgencia_ia || "5",
      diagnostico: parsed.diagnostico || parsed.diagnosis || parsed.diagnostico_ia || "",
      descripcion_final: parsed.descripcion_final || parsed.description || parsed.descripcion_proyecto || description,
    };

    // Return successful response
    return new Response(JSON.stringify(normalizedResponse), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error en classify-service:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error
          ? error.message
          : "Error inesperado al clasificar el servicio.",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
