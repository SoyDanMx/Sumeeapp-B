// src/lib/ai/gemini-agent.ts
// Agente de IA Real usando Google Gemini 2.5 Flash

import { GoogleGenerativeAI } from "@google/generative-ai";

// Inicializar cliente de Gemini
const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
if (!apiKey) {
  console.warn(
    "⚠️ GOOGLE_GENERATIVE_AI_API_KEY no configurada. Usando modo fallback."
  );
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Modelo a usar: gemini-2.0-flash-exp (gratis) o gemini-1.5-flash (más rápido)
const MODEL_NAME = "gemini-2.0-flash-exp";

/**
 * Genera una respuesta conversacional usando Gemini
 * @param userQuery Consulta del usuario
 * @param context Contexto adicional (profesionales, precios, etc.)
 * @param imageBase64 Imagen en base64 (opcional) para análisis visual
 */
export async function generateAIConversation(
  userQuery: string,
  context: {
    serviceCategory?: string;
    professionals?: Array<{
      name: string;
      profession: string;
      rating: number;
      specialties: string[];
    }>;
    priceRange?: string;
    technicalInfo?: {
      diagnosis: string;
      solutions: string[];
      warnings: string[];
    };
  } = {},
  imageBase64?: string
): Promise<{
  response: string;
  suggestedQuestions: string[];
  confidence: number;
}> {
  // Si no hay API key, usar fallback
  if (!genAI) {
    return {
      response: generateFallbackResponse(userQuery, context),
      suggestedQuestions: [],
      confidence: 0.5,
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    // Construir prompt del sistema
    const systemPrompt = buildSystemPrompt(context);

    // Construir mensaje del usuario con contexto
    const userMessage = buildUserMessage(
      userQuery,
      context,
      imageBase64 ? true : false
    );

    // Preparar partes del mensaje (texto + imagen si existe)
    const parts: any[] = [{ text: `${systemPrompt}\n\n${userMessage}` }];

    // Si hay imagen, agregarla a las partes
    if (imageBase64) {
      parts.push({
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg", // Asumimos JPEG por defecto, se puede mejorar detectando el tipo
        },
      });
      console.log("🖼️ Imagen enviada a Gemini para análisis visual");
    }

    // Generar respuesta
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: parts,
        },
      ],
      generationConfig: {
        temperature: 0.7, // Balance entre creatividad y precisión
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048, // Aumentado para respuestas más detalladas con imágenes
      },
    });

    const response = result.response;
    const text = response.text();

    // Extraer preguntas sugeridas si están en el formato
    const suggestedQuestions = extractSuggestedQuestions(text);

    return {
      response: text,
      suggestedQuestions,
      confidence: 0.9, // Alta confianza con Gemini
    };
  } catch (error) {
    console.error("Error en Gemini API:", error);
    // Fallback en caso de error
    return {
      response: generateFallbackResponse(userQuery, context),
      suggestedQuestions: [],
      confidence: 0.5,
    };
  }
}

/**
 * Construye el prompt del sistema con el contexto de Sumee
 */
function buildSystemPrompt(context: any): string {
  return `Eres "SumeeBot", el asistente de IA experto de Sumee App, una plataforma mexicana que conecta clientes con técnicos verificados y certificados.

TU ROL:
- Eres un experto técnico mexicano que ayuda a diagnosticar problemas del hogar
- Eres conversacional, amigable y profesional
- SIEMPRE mencionas los beneficios de trabajar con técnicos verificados
- Guías al usuario hacia la contratación de servicios, pero sin ser agresivo

CONTEXTO ACTUAL:
${
  context.serviceCategory
    ? `- Categoría de servicio: ${context.serviceCategory}`
    : ""
}
${
  context.professionals?.length
    ? `- Profesionales disponibles: ${context.professionals.length}`
    : ""
}
${context.priceRange ? `- Rango de precios: ${context.priceRange}` : ""}

INSTRUCCIONES:
1. Responde en español mexicano, de forma natural y conversacional
2. Demuestra conocimiento técnico pero explica de forma sencilla
3. Haz preguntas aclaratorias si es necesario
4. Menciona los beneficios de Sumee: técnicos verificados, garantía, respuesta rápida
5. Incluye un llamado a la acción sutil pero claro
6. Sé específico y evita respuestas genéricas
7. Usa emojis estratégicamente para hacer la conversación más amigable

FORMATO:
- Responde directamente la pregunta del usuario
- Si hay diagnóstico técnico disponible, inclúyelo
- Menciona los profesionales disponibles si los hay
- Termina con una pregunta o sugerencia de acción`;
}

/**
 * Construye el mensaje del usuario con contexto
 */
function buildUserMessage(
  userQuery: string,
  context: any,
  hasImage: boolean = false
): string {
  let message = `Consulta del usuario: "${userQuery}"\n\n`;

  // Si hay imagen, agregar instrucciones específicas para análisis visual
  if (hasImage) {
    message += `IMPORTANTE: El usuario ha subido una imagen. Analiza la imagen visualmente y proporciona:`;
    message += `\n1. Diagnóstico visual detallado de lo que ves en la imagen`;
    message += `\n2. Identificación del problema o componente mostrado`;
    message += `\n3. Recomendaciones específicas basadas en lo que observas`;
    message += `\n4. Si es necesario, solicita información adicional que no se pueda ver en la imagen`;
    message += `\n\n`;
  }

  if (context.technicalInfo) {
    message += `INFORMACIÓN TÉCNICA DISPONIBLE:\n`;
    message += `- Diagnóstico: ${context.technicalInfo.diagnosis}\n`;
    if (context.technicalInfo.solutions?.length) {
      message += `- Soluciones: ${context.technicalInfo.solutions.join(
        ", "
      )}\n`;
    }
    if (context.technicalInfo.warnings?.length) {
      message += `- Advertencias: ${context.technicalInfo.warnings.join(
        ", "
      )}\n`;
    }
    message += "\n";
  }

  if (context.professionals?.length) {
    message += `PROFESIONALES DISPONIBLES:\n`;
    context.professionals.forEach(
      (
        prof: {
          name: string;
          profession: string;
          rating: number;
          specialties: string[];
        },
        idx: number
      ) => {
        message += `${idx + 1}. ${prof.name} - ${prof.profession} (⭐ ${
          prof.rating
        }/5)\n`;
        if (prof.specialties?.length) {
          message += `   Especialidades: ${prof.specialties
            .slice(0, 3)
            .join(", ")}\n`;
        }
      }
    );
    message += "\n";
  }

  if (context.priceRange) {
    message += `RANGO DE PRECIOS ESTIMADO: ${context.priceRange}\n\n`;
  }

  message += `Genera una respuesta conversacional, útil y orientada a la acción que:`;
  message += `\n1. Responda la consulta del usuario`;
  message += `\n2. Incluya el diagnóstico técnico si está disponible`;
  message += `\n3. Mencione a los profesionales disponibles de forma natural`;
  message += `\n4. Termine con un llamado a la acción claro pero no agresivo`;

  return message;
}

/**
 * Extrae preguntas sugeridas del texto de respuesta
 */
function extractSuggestedQuestions(text: string): string[] {
  // Buscar preguntas en el texto (líneas que terminan en ?)
  const questionRegex = /^[^.!?]*\?/gm;
  const matches = text.match(questionRegex);
  return matches?.slice(0, 3) || []; // Máximo 3 preguntas
}

/**
 * Genera respuesta de fallback si Gemini no está disponible
 */
function generateFallbackResponse(userQuery: string, context: any): string {
  return `Entiendo tu consulta sobre "${userQuery}". 

Para darte la mejor solución y conectarte con nuestros técnicos verificados, te recomiendo que uses nuestro sistema de diagnóstico completo donde podrás:
- Recibir un diagnóstico técnico detallado
- Ver profesionales especializados disponibles
- Conocer precios y tiempos estimados
- Contactar directamente con los técnicos

¿Te gustaría que te ayude a encontrar el profesional perfecto para tu necesidad?`;
}

/**
 * Genera preguntas de seguimiento inteligentes
 */
export async function generateFollowUpQuestions(
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>,
  context: any
): Promise<string[]> {
  if (!genAI) {
    return [
      "¿Es algo urgente?",
      "¿En qué zona estás ubicado?",
      "¿Prefieres que te contactemos?",
    ];
  }

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const historyText = conversationHistory
      .map(
        (msg) =>
          `${msg.role === "user" ? "Usuario" : "Asistente"}: ${msg.content}`
      )
      .join("\n");

    const prompt = `Basándote en esta conversación:

${historyText}

Genera 3 preguntas de seguimiento específicas y útiles para entender mejor el problema del usuario. Las preguntas deben:
- Ser concretas y relevantes al problema
- Ayudar a diagnosticar mejor
- Guiar hacia la solución

Responde solo con las 3 preguntas, una por línea, sin numeración.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return text
      .split("\n")
      .filter((q) => q.trim() && q.includes("?"))
      .slice(0, 3)
      .map((q) => q.trim());
  } catch (error) {
    console.error("Error generando preguntas de seguimiento:", error);
    return [
      "¿Cuándo empezó el problema?",
      "¿Es algo urgente?",
      "¿Tienes alguna preferencia de horario?",
    ];
  }
}

/**
 * Analiza el sentimiento y urgencia de la consulta
 */
export async function analyzeQueryUrgency(query: string): Promise<{
  urgency: "baja" | "media" | "alta" | "crítica";
  sentiment: "neutro" | "preocupado" | "urgente" | "frustrado";
  keywords: string[];
}> {
  // Análisis básico sin API (puede mejorarse con Gemini)
  const queryLower = query.toLowerCase();

  const urgencyKeywords = {
    crítica: [
      "emergencia",
      "urgente",
      "inmediato",
      "ahora",
      "ya",
      "roto",
      "no funciona",
      "fuego",
      "agua",
    ],
    alta: [
      "rápido",
      "pronto",
      "hoy",
      "problema",
      "daño",
      "fuga",
      "cortocircuito",
    ],
    media: ["cuando", "disponible", "puede", "sería"],
    baja: ["información", "consulta", "presupuesto", "precio"],
  };

  let urgency: "baja" | "media" | "alta" | "crítica" = "media";
  for (const [level, keywords] of Object.entries(urgencyKeywords)) {
    if (keywords.some((kw) => queryLower.includes(kw))) {
      urgency = level as any;
      break;
    }
  }

  return {
    urgency,
    sentiment: urgency === "crítica" ? "urgente" : "neutro",
    keywords: queryLower.split(" ").slice(0, 5),
  };
}
