import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MODEL = Deno.env.get("GEMINI_MODEL")?.trim() || "gemini-1.5-flash-latest";

const systemPrompt =
  "Actúa como un clasificador de servicios de mantenimiento muy preciso. Analiza el problema del cliente y clasifícalo en una de las siguientes disciplinas: Electricidad, Plomería, HVAC, Carpintería, Albañilería, Otros. Tu respuesta debe ser solo un objeto JSON.";

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

    if (!description) {
      return new Response(
        JSON.stringify({
          error:
            "Debes enviar un campo description con el problema descrito por el cliente.",
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

    // Build Gemini prompt
    const userPrompt =
      `Clasifica este problema. Dame la disciplina, un diagnóstico sugerido (máx. 10 palabras) y la urgencia (1-10): ${description}`;

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            role: "system",
            parts: [{ text: systemPrompt }],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: userPrompt }],
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

    // Return successful response
    return new Response(JSON.stringify(parsed), {
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
