import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { detectTechnicalCategory, generateTechnicalResponse, TECHNICAL_PROMPTS } from '@/lib/ai/technical-prompts';
import { generateAIConversation } from '@/lib/ai/gemini-agent';

// Crear cliente de Supabase para el API route
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface ProfessionalRecommendation {
  user_id: string;
  full_name: string | null;
  profession: string | null;
  calificacion_promedio: number | null;
  areas_servicio: string[] | null;
  whatsapp: string | null;
  numero_imss: string | null;
  experiencia_uber: boolean;
  años_experiencia_uber: number | null;
  work_zones: string[] | null;
  descripcion_perfil: string | null;
  avatar_url: string | null;
}

interface AIResponse {
  service_category: string;
  technical_info: {
    title: string;
    description: string;
    technologies: string[];
    considerations: string[];
    kit_options?: string[];
  };
  technical_diagnosis: {
    diagnosis: string;
    questions: string[];
    solutions: string[];
    warnings: string[];
    costEstimate: string;
    professionalType: string;
  };
  recommendations: ProfessionalRecommendation[];
  estimated_price_range: string;
  requires_membership?: boolean;
  ai_suggested_questions?: string[];
}

interface ServiceKnowledge {
  category: string;
  technologies: string[];
  considerations: string[];
  kit_options?: string[];
  price_range: string;
}

// Base de conocimientos para diferentes servicios
const serviceKnowledge: Record<string, ServiceKnowledge> = {
  'cámaras de seguridad': {
    category: 'Seguridad Electrónica',
    technologies: ['Cámaras IP', 'Cámaras Analógicas', 'Sistemas Híbridos', 'DVR/NVR'],
    considerations: [
      'Resolución de imagen (1080p, 4K, etc.)',
      'Visión nocturna con infrarrojos',
      'Ángulo de visión y cobertura',
      'Almacenamiento en la nube vs local',
      'Integración con aplicaciones móviles'
    ],
    kit_options: [
      'Kit básico: 4 cámaras + DVR + cables',
      'Kit premium: 8 cámaras IP + NVR + almacenamiento',
      'Kit inalámbrico: Cámaras WiFi + grabador'
    ],
    price_range: '$3,000 - $15,000 MXN'
  },
  'aire acondicionado': {
    category: 'HVAC',
    technologies: ['Minisplit', 'Aire Central', 'Ventiladores de Techo', 'Sistemas VRV'],
    considerations: [
      'Capacidad en BTU según el tamaño del espacio',
      'Eficiencia energética (SEER rating)',
      'Tipo de refrigerante (R-410A, R-32)',
      'Instalación de ductos y drenajes',
      'Mantenimiento preventivo'
    ],
    kit_options: [
      'Instalación básica de minisplit',
      'Kit completo con cableado y drenaje',
      'Mantenimiento anual incluido'
    ],
    price_range: '$2,500 - $8,000 MXN'
  },
  'plomería': {
    category: 'Plomería',
    technologies: ['Tubería PVC', 'Tubería de Cobre', 'Válvulas de Esfera', 'Filtros de Agua'],
    considerations: [
      'Presión del agua y flujo',
      'Material de tuberías según uso',
      'Accesibilidad para mantenimiento',
      'Códigos de construcción locales',
      'Sistemas de drenaje'
    ],
    price_range: '$800 - $5,000 MXN'
  },
  'electricidad': {
    category: 'Electricidad',
    technologies: ['Cableado', 'Interruptores', 'Enchufes GFCI', 'Iluminación LED'],
    considerations: [
      'Capacidad del panel eléctrico',
      'Códigos eléctricos (NOM-001-SEDE)',
      'Protección contra sobrecargas',
      'Cableado según uso y ubicación',
      'Certificación de instalaciones'
    ],
    price_range: '$1,200 - $8,000 MXN'
  }
};

function detectServiceCategory(query: string): string {
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes('cámara') || queryLower.includes('camara') || queryLower.includes('seguridad')) {
    return 'cámaras de seguridad';
  }
  if (queryLower.includes('aire') || queryLower.includes('acondicionado') || queryLower.includes('minisplit') || queryLower.includes('hvac')) {
    return 'aire acondicionado';
  }
  if (queryLower.includes('plomería') || queryLower.includes('plomeria') || queryLower.includes('tubería') || queryLower.includes('agua')) {
    return 'plomería';
  }
  if (queryLower.includes('electricidad') || queryLower.includes('electricista') || queryLower.includes('cableado') || queryLower.includes('luz')) {
    return 'electricidad';
  }
  
  return 'servicio general';
}

async function getTopProfessionals(serviceArea: string, limit: number = 5): Promise<ProfessionalRecommendation[]> {
  try {
    let professionals: ProfessionalRecommendation[] = [];

    // Primero intentamos obtener desde la tabla 'profiles' (más confiable)
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'profesional')
      .limit(limit);

    if (!profilesError && profilesData) {
      // Mapear datos de profiles a formato esperado
      professionals = profilesData.map(profile => ({
        user_id: profile.user_id || '',
        full_name: profile.full_name || null,
        profession: profile.profession || null,
        areas_servicio: profile.areas_servicio || null,
        whatsapp: profile.whatsapp || null,
        calificacion_promedio: typeof profile.calificacion_promedio === 'number' ? profile.calificacion_promedio : 4.5,
        numero_imss: profile.numero_imss || null,
        experiencia_uber: profile.experiencia_uber || false,
        años_experiencia_uber: profile.años_experiencia_uber || null,
        work_zones: profile.work_zones || null,
        descripcion_perfil: profile.descripcion_perfil || null,
        avatar_url: profile.avatar_url || null
      }));
    }

    // Filtrar por área de servicio si es específica
    if (serviceArea !== 'servicio general') {
      professionals = professionals.filter(prof => 
        prof.areas_servicio && 
        prof.areas_servicio.some((area: string) => 
          area.toLowerCase().includes(serviceArea.split(' ')[0]) ||
          serviceArea.includes(area.toLowerCase())
        )
      );
    }

    // Ordenar por calificación y limitar resultados
    professionals = professionals
      .sort((a, b) => (b.calificacion_promedio || 0) - (a.calificacion_promedio || 0))
      .slice(0, limit);

    return professionals;
  } catch (error) {
    console.error('Error fetching professionals:', error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    console.log('🔍 Procesando consulta técnica:', query);

    // Verificar membresía del usuario
    let hasPremiumMembership = false;
    try {
      const authHeader = request.headers.get('authorization');
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('membership_status')
            .eq('user_id', user.id)
            .single();
          
          hasPremiumMembership = profile?.membership_status === 'premium' || profile?.membership_status === 'basic';
        }
      } else {
        // Intentar obtener usuario desde cookie/session
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('membership_status')
            .eq('user_id', user.id)
            .single();
          
          hasPremiumMembership = profile?.membership_status === 'premium' || profile?.membership_status === 'basic';
        }
      }
    } catch (membershipError) {
      console.warn('⚠️ Error al verificar membresía:', membershipError);
      // Si hay error, asumir que no tiene membresía
      hasPremiumMembership = false;
    }

    console.log('👤 Usuario tiene membresía premium:', hasPremiumMembership);

    // Detectar categoría técnica avanzada
    const technicalCategory = detectTechnicalCategory(query);
    console.log('📋 Categoría técnica detectada:', technicalCategory);

    // Generar diagnóstico técnico
    const technicalDiagnosis = generateTechnicalResponse(technicalCategory, query);
    console.log('🔧 Diagnóstico técnico generado:', technicalDiagnosis);

    // Detectar servicio tradicional (para compatibilidad)
    const detectedService = detectServiceCategory(query);
    const knowledge = serviceKnowledge[detectedService as keyof typeof serviceKnowledge];
    
    // Obtener profesionales recomendados
    let professionals = await getTopProfessionals(detectedService, 5);
    console.log('👥 Profesionales encontrados:', professionals.length);

    // Filtrar datos de contacto si el usuario no tiene membresía premium
    if (!hasPremiumMembership) {
      professionals = professionals.map(prof => ({
        ...prof,
        whatsapp: null, // Ocultar WhatsApp
        numero_imss: null, // Ocultar IMSS
        // Mantener otros datos públicos como nombre, calificación, etc.
      }));
      console.log('🔒 Datos de contacto ocultos para usuario sin membresía');
    }

    // Generar respuesta conversacional con Gemini (si está disponible)
    let aiConversation = null;
    try {
      aiConversation = await generateAIConversation(query, {
        serviceCategory: technicalDiagnosis.professionalType || knowledge?.category,
        professionals: professionals.slice(0, 3).map(p => ({
          name: p.full_name || 'Profesional',
          profession: p.profession || 'Técnico',
          rating: p.calificacion_promedio || 5,
          specialties: p.areas_servicio || [],
        })),
        priceRange: technicalDiagnosis.costEstimate || knowledge?.price_range,
        technicalInfo: {
          diagnosis: technicalDiagnosis.diagnosis,
          solutions: technicalDiagnosis.solutions,
          warnings: technicalDiagnosis.warnings,
        },
      });
      console.log('🤖 Respuesta de Gemini generada exitosamente');
    } catch (geminiError) {
      console.warn('⚠️ Error en Gemini, usando respuesta estándar:', geminiError);
    }

    // Usar respuesta de Gemini si está disponible, sino usar diagnóstico técnico
    const description = aiConversation?.response || technicalDiagnosis.diagnosis;

    // Construir respuesta mejorada
    const response: AIResponse = {
      service_category: technicalDiagnosis.professionalType || knowledge?.category || 'Servicio General',
      technical_info: {
        title: `Diagnóstico Técnico: ${technicalDiagnosis.professionalType}`,
        description: description, // Respuesta conversacional de Gemini o fallback
        technologies: knowledge?.technologies || ['Análisis técnico especializado'],
        considerations: technicalDiagnosis.questions,
        kit_options: knowledge?.kit_options || []
      },
      technical_diagnosis: {
        ...technicalDiagnosis,
        diagnosis: description, // Sobrescribir con respuesta de Gemini si está disponible
      },
      recommendations: professionals,
      estimated_price_range: technicalDiagnosis.costEstimate || knowledge?.price_range || 'Consulte precio con el técnico',
      requires_membership: !hasPremiumMembership, // Agregar flag para indicar que requiere membresía
      ai_suggested_questions: aiConversation?.suggestedQuestions || [], // Preguntas sugeridas por IA
    };

    console.log('✅ Respuesta técnica generada exitosamente');
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error in AI Assistant API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
