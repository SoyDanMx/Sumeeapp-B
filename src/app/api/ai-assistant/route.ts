import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Crear cliente de Supabase para el API route
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface AIResponse {
  service_category: string;
  technical_info: {
    title: string;
    description: string;
    technologies: string[];
    considerations: string[];
    kit_options?: string[];
  };
  recommendations: Array<{
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
  }>;
  estimated_price_range: string;
}

// Base de conocimientos para diferentes servicios
const serviceKnowledge = {
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

async function getTopProfessionals(serviceArea: string, limit: number = 5) {
  try {
    // Primero intentamos obtener desde la tabla 'profesionales'
    let { data: professionals, error } = await supabase
      .from('profesionales')
      .select(`
        user_id,
        full_name,
        profession,
        calificacion_promedio,
        areas_servicio,
        whatsapp,
        numero_imss,
        experiencia_uber,
        años_experiencia_uber,
        work_zones,
        descripcion_perfil,
        avatar_url
      `)
      .eq('activo', true)
      .not('calificacion_promedio', 'is', null)
      .order('calificacion_promedio', { ascending: false })
      .limit(limit);

    // Si no hay resultados, intentamos desde 'profiles'
    if (!professionals || professionals.length === 0 || error) {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          user_id,
          full_name,
          profession,
          areas_servicio,
          whatsapp
        `)
        .eq('role', 'profesional')
        .limit(limit);

      if (!profilesError && profilesData) {
        // Mapear datos de profiles a formato esperado
        professionals = profilesData.map(profile => ({
          ...profile,
          calificacion_promedio: 4.5, // Valor por defecto si no hay rating
          numero_imss: null,
          experiencia_uber: false,
          años_experiencia_uber: null,
          work_zones: null,
          descripcion_perfil: null,
          avatar_url: null
        }));
      }
    }

    // Filtrar por área de servicio si es específica
    if (serviceArea !== 'servicio general' && professionals) {
      professionals = professionals.filter(prof => 
        prof.areas_servicio && 
        prof.areas_servicio.some((area: string) => 
          area.toLowerCase().includes(serviceArea.split(' ')[0]) ||
          serviceArea.includes(area.toLowerCase())
        )
      );
    }

    return professionals || [];
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

    // Detectar el tipo de servicio
    const detectedService = detectServiceCategory(query);
    const knowledge = serviceKnowledge[detectedService as keyof typeof serviceKnowledge];
    
    // Obtener profesionales recomendados
    const professionals = await getTopProfessionals(detectedService, 5);

    // Construir respuesta
    const response: AIResponse = {
      service_category: knowledge?.category || 'Servicio General',
      technical_info: {
        title: `Información sobre ${knowledge?.category || 'el servicio solicitado'}`,
        description: `Para ${detectedService}, es importante considerar varios aspectos técnicos y tecnológicos que te ayudarán a tomar la mejor decisión.`,
        technologies: knowledge?.technologies || ['Consulte con nuestro especialista'],
        considerations: knowledge?.considerations || ['Análisis personalizado requerido'],
        kit_options: knowledge?.kit_options || []
      },
      recommendations: professionals,
      estimated_price_range: knowledge?.price_range || 'Consulte precio con el técnico'
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in AI Assistant API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
