// src/app/api/ai-search/route.ts
// API Route para análisis de búsqueda con Gemini (Cliente Móvil)

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// Inicializar cliente de Gemini
const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const MODEL_NAME = 'gemini-2.0-flash-exp';

interface AISearchRequest {
    problemDescription: string;
}

interface AISearchResponse {
    detected_service: {
        id: string;
        service_name: string;
        discipline: string;
        min_price: number;
        max_price: number | null;
    } | null;
    alternatives: Array<{
        id: string;
        service_name: string;
        discipline: string;
        min_price: number;
    }>;
    confidence: number;
    reasoning: string;
    pre_filled_data: {
        servicio?: string;
        disciplina?: string;
        descripcion?: string;
        urgencia?: 'baja' | 'media' | 'alta';
        precio_estimado?: { min: number; max: number };
    };
}

/**
 * Analiza el problema del cliente usando Gemini y encuentra el servicio más adecuado
 */
export async function POST(request: NextRequest) {
    try {
        const { problemDescription }: AISearchRequest = await request.json();

        if (!problemDescription || problemDescription.trim().length < 5) {
            return NextResponse.json(
                {
                    detected_service: null,
                    alternatives: [],
                    confidence: 0,
                    reasoning: 'La descripción es muy corta. Por favor, describe tu problema con más detalle.',
                    pre_filled_data: {},
                },
                { status: 400 }
            );
        }

        // Si no hay Gemini, usar fallback básico
        if (!genAI) {
            return NextResponse.json(await fallbackAnalysis(problemDescription));
        }

        // 1. Obtener todos los servicios activos de la BD
        const supabase = await createSupabaseServerClient();
        const { data: services, error: servicesError } = await supabase
            .from('service_catalog')
            .select('id, service_name, discipline, min_price, max_price, description')
            .eq('is_active', true)
            .order('completed_count', { ascending: false })
            .limit(50);

        if (servicesError || !services || services.length === 0) {
            return NextResponse.json(await fallbackAnalysis(problemDescription));
        }

        // 2. Construir prompt para Gemini
        const servicesList = services
            .map(
                (s, idx) =>
                    `${idx + 1}. ${s.service_name} (${s.discipline}) - Desde $${s.min_price}`
            )
            .join('\n');

        const prompt = `Eres un asistente experto de Sumee App, una plataforma mexicana que conecta clientes con técnicos verificados.

CONTEXTO:
El cliente describe: "${problemDescription}"

SERVICIOS DISPONIBLES (ORDENADOS POR RELEVANCIA):
${servicesList}

INSTRUCCIONES CRÍTICAS:
1. **PRECISIÓN MÁXIMA**: Debes seleccionar el servicio MÁS ESPECÍFICO que coincida exactamente con la necesidad del cliente.
2. **NO GENERALIZAR**: Si el cliente dice "lámpara", NO selecciones "tablero eléctrico" solo porque ambos son de electricidad.
3. **MATCHING EXACTO**: Busca palabras clave específicas en el nombre del servicio:
   - "lámpara" o "lampara" → Busca "Instalación de Lámpara" (NO "Actualización de tablero eléctrico")
   - "fuga" → Busca "Reparación de Fuga" (NO "Instalación de tubería")
   - "aire no enfría" → Busca "Reparación de Aire Acondicionado" (NO "Instalación de Aire Acondicionado")

EJEMPLOS DE MATCHING CORRECTO:
- "necesito instalar una lámpara" → "Instalación de Lámpara" ✅ (NO "Actualización de tablero eléctrico" ❌)
- "tengo una fuga de agua" → "Reparación de Fuga" ✅ (NO "Instalación de tubería" ❌)
- "mi aire no enfría" → "Reparación de Aire Acondicionado" ✅ (NO "Instalación de Aire Acondicionado" ❌)

ANÁLISIS REQUERIDO:
1. Extrae palabras clave del problema: [objeto, acción, urgencia]
2. Busca el servicio que contenga estas palabras clave en su nombre EXACTO
3. Si no hay match exacto, busca el más similar semánticamente dentro de la misma disciplina
4. Determina urgencia: "alta" (urgente, no funciona, roto), "media" (pronto, esta semana), "baja" (sin prisa, planificar)
5. Estima precio basado en el servicio específico seleccionado

RESPONDE EN FORMATO JSON ESTRICTO (sin markdown, sin código, solo JSON):
{
  "service_name": "Nombre EXACTO del servicio de la lista (debe coincidir palabra por palabra)",
  "discipline": "disciplina del servicio",
  "confidence": 0.95,
  "reasoning": "Explicación detallada de por qué este servicio específico es el adecuado",
  "matched_keywords": ["palabra1", "palabra2"],
  "urgency": "alta|media|baja",
  "price_estimate": {
    "min": 500,
    "max": 800
  },
  "alternatives": ["Nombre servicio alternativo 1", "Nombre servicio alternativo 2"]
}`;

        // 3. Llamar a Gemini
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.3, // Bajo para más precisión
                topK: 20,
                topP: 0.8,
                maxOutputTokens: 1024,
            },
        });

        const responseText = result.response.text();
        console.log('[AI Search] Gemini response:', responseText);

        // 4. Parsear respuesta de Gemini
        let geminiResult: any;
        try {
            // Limpiar respuesta (remover markdown si existe)
            const cleanedText = responseText
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();
            geminiResult = JSON.parse(cleanedText);
        } catch (parseError) {
            console.error('[AI Search] Error parsing Gemini response:', parseError);
            return NextResponse.json(await fallbackAnalysis(problemDescription));
        }

        // 5. Buscar el servicio detectado en la BD
        const detectedService = services.find(
            (s) =>
                s.service_name.toLowerCase() === geminiResult.service_name?.toLowerCase() ||
                s.discipline === geminiResult.discipline
        );

        if (!detectedService) {
            // Si no se encuentra exacto, buscar por disciplina
            const disciplineServices = services.filter(
                (s) => s.discipline === geminiResult.discipline
            );
            if (disciplineServices.length > 0) {
                return NextResponse.json({
                    detected_service: {
                        id: disciplineServices[0].id,
                        service_name: disciplineServices[0].service_name,
                        discipline: disciplineServices[0].discipline,
                        min_price: disciplineServices[0].min_price,
                        max_price: disciplineServices[0].max_price,
                    },
                    alternatives: disciplineServices.slice(1, 4).map((s) => ({
                        id: s.id,
                        service_name: s.service_name,
                        discipline: s.discipline,
                        min_price: s.min_price,
                    })),
                    confidence: geminiResult.confidence || 0.7,
                    reasoning: geminiResult.reasoning || 'Servicio detectado por disciplina',
                    pre_filled_data: {
                        servicio: disciplineServices[0].service_name,
                        disciplina: disciplineServices[0].discipline,
                        descripcion: problemDescription,
                        urgencia: geminiResult.urgency || 'media',
                        precio_estimado: geminiResult.price_estimate || {
                            min: disciplineServices[0].min_price,
                            max: disciplineServices[0].max_price || disciplineServices[0].min_price * 1.5,
                        },
                    },
                });
            }
            return NextResponse.json(await fallbackAnalysis(problemDescription));
        }

        // 6. Buscar alternativas
        const alternatives = services
            .filter(
                (s) =>
                    s.discipline === detectedService.discipline &&
                    s.id !== detectedService.id
            )
            .slice(0, 3)
            .map((s) => ({
                id: s.id,
                service_name: s.service_name,
                discipline: s.discipline,
                min_price: s.min_price,
            }));

        // 7. Construir respuesta
        const response: AISearchResponse = {
            detected_service: {
                id: detectedService.id,
                service_name: detectedService.service_name,
                discipline: detectedService.discipline,
                min_price: detectedService.min_price,
                max_price: detectedService.max_price,
            },
            alternatives,
            confidence: geminiResult.confidence || 0.8,
            reasoning: geminiResult.reasoning || `Detecté que necesitas un servicio de ${detectedService.discipline}. "${detectedService.service_name}" es el más adecuado para tu problema.`,
            pre_filled_data: {
                servicio: detectedService.service_name,
                disciplina: detectedService.discipline,
                descripcion: problemDescription,
                urgencia: geminiResult.urgency || 'media',
                precio_estimado: geminiResult.price_estimate || {
                    min: detectedService.min_price,
                    max: detectedService.max_price || detectedService.min_price * 1.5,
                },
            },
        };

        console.log('[AI Search] ✅ Análisis completado:', response.detected_service?.service_name);
        return NextResponse.json(response);
    } catch (error: any) {
        console.error('[AI Search] Error:', error);
        return NextResponse.json(
            {
                detected_service: null,
                alternatives: [],
                confidence: 0,
                reasoning: 'Error al analizar el problema. Por favor, intenta de nuevo.',
                pre_filled_data: {},
            },
            { status: 500 }
        );
    }
}

/**
 * Análisis de fallback usando keywords básicas
 */
async function fallbackAnalysis(problemDescription: string): Promise<AISearchResponse> {
    const description = problemDescription.toLowerCase();

    // Keywords básicas por disciplina
    const disciplineKeywords: Record<string, string[]> = {
        plomeria: ['fuga', 'agua', 'plomero', 'tubería', 'baño', 'cocina', 'gotera'],
        electricidad: ['luz', 'lámpara', 'electricista', 'cable', 'cortocircuito'],
        'aire-acondicionado': ['aire', 'clima', 'no enfría', 'refrigeración'],
    };

    // Detectar disciplina
    let detectedDiscipline = 'plomeria'; // Default
    for (const [discipline, keywords] of Object.entries(disciplineKeywords)) {
        if (keywords.some((kw) => description.includes(kw))) {
            detectedDiscipline = discipline;
            break;
        }
    }

    // Buscar servicios en la disciplina detectada
    const supabase = await createSupabaseServerClient();
    const { data: services } = await supabase
        .from('service_catalog')
        .select('id, service_name, discipline, min_price, max_price')
        .eq('discipline', detectedDiscipline)
        .eq('is_active', true)
        .limit(5);

    if (!services || services.length === 0) {
        return {
            detected_service: null,
            alternatives: [],
            confidence: 0,
            reasoning: 'No pude identificar el servicio que necesitas. Por favor, intenta ser más específico.',
            pre_filled_data: {
                descripcion: problemDescription,
                urgencia: 'media',
            },
        };
    }

    return {
        detected_service: {
            id: services[0].id,
            service_name: services[0].service_name,
            discipline: services[0].discipline,
            min_price: services[0].min_price,
            max_price: services[0].max_price,
        },
        alternatives: services.slice(1, 4).map((s) => ({
            id: s.id,
            service_name: s.service_name,
            discipline: s.discipline,
            min_price: s.min_price,
        })),
        confidence: 0.6,
        reasoning: `Basado en tu descripción, te sugiero un servicio de ${detectedDiscipline}.`,
        pre_filled_data: {
            servicio: services[0].service_name,
            disciplina: services[0].discipline,
            descripcion: problemDescription,
            urgencia: 'media',
            precio_estimado: {
                min: services[0].min_price,
                max: services[0].max_price || services[0].min_price * 1.5,
            },
        },
    };
}

