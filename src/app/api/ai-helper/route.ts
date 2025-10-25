import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Mensaje requerido' },
        { status: 400 }
      );
    }

    // Simular respuesta de IA (en producción usarías OpenAI, Claude, etc.)
    const aiResponse = await generateAIResponse(message);

    return NextResponse.json({
      response: aiResponse.response,
      serviceSuggestion: aiResponse.serviceSuggestion
    });

  } catch (error) {
    console.error('Error en AI Helper API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

async function generateAIResponse(message: string): Promise<{ response: string; serviceSuggestion?: any }> {
  const lowerMessage = message.toLowerCase();
  
  const serviceKeywords = {
    'plomeria': ['agua', 'fuga', 'baño', 'lavabo', 'tinaco', 'boiler', 'llave', 'tubería', 'desagüe'],
    'electricidad': ['luz', 'eléctric', 'corto', 'contacto', 'cable', 'tablero', 'luminaria', 'energía'],
    'aire-acondicionado': ['aire', 'clima', 'frío', 'calor', 'ventilador', 'refrigeración', 'acondicionado'],
    'cctv': ['cámara', 'seguridad', 'alarma', 'cctv', 'vigilancia', 'monitoreo'],
    'carpinteria': ['madera', 'mueble', 'carpintería', 'estante', 'puerta', 'ventana'],
    'limpieza': ['limpieza', 'limpio', 'sucio', 'lavado', 'limpiar'],
    'jardineria': ['jardín', 'planta', 'pasto', 'césped', 'verde', 'jardinería'],
    'fumigacion': ['plaga', 'insecto', 'fumigación', 'cucaracha', 'rata', 'mosquito']
  };

  const serviceSuggestions = {
    'plomeria': {
      name: 'Plomería',
      slug: 'plomeria',
      description: 'Reparaciones, instalaciones y mantenimiento de sistemas hidráulicos',
      icon: 'faWrench',
      color: 'text-blue-500'
    },
    'electricidad': {
      name: 'Electricidad',
      slug: 'electricidad',
      description: 'Instalaciones eléctricas, reparaciones y mantenimiento',
      icon: 'faLightbulb',
      color: 'text-yellow-500'
    },
    'aire-acondicionado': {
      name: 'Aire Acondicionado',
      slug: 'aire-acondicionado',
      description: 'Instalación, reparación y mantenimiento de sistemas de climatización',
      icon: 'faThermometerHalf',
      color: 'text-green-500'
    },
    'cctv': {
      name: 'CCTV y Seguridad',
      slug: 'cctv',
      description: 'Sistemas de seguridad, cámaras de vigilancia y alarmas',
      icon: 'faShieldAlt',
      color: 'text-purple-500'
    },
    'carpinteria': {
      name: 'Carpintería',
      slug: 'carpinteria',
      description: 'Trabajos en madera, muebles y estructuras',
      icon: 'faCog',
      color: 'text-orange-500'
    },
    'limpieza': {
      name: 'Limpieza',
      slug: 'limpieza',
      description: 'Servicios de limpieza residencial y comercial',
      icon: 'faBroom',
      color: 'text-pink-500'
    },
    'jardineria': {
      name: 'Jardinería',
      slug: 'jardineria',
      description: 'Mantenimiento de jardines y áreas verdes',
      icon: 'faBuilding',
      color: 'text-green-600'
    },
    'fumigacion': {
      name: 'Fumigación',
      slug: 'fumigacion',
      description: 'Control de plagas y fumigación profesional',
      icon: 'faBug',
      color: 'text-red-500'
    }
  };

  // Detectar servicio basado en palabras clave
  for (const [serviceKey, keywords] of Object.entries(serviceKeywords)) {
    const hasKeyword = keywords.some(keyword => lowerMessage.includes(keyword));
    if (hasKeyword) {
      const service = serviceSuggestions[serviceKey as keyof typeof serviceSuggestions];
      return {
        response: `Perfecto, entiendo tu problema. Basándome en tu descripción, parece que necesitas un servicio de **${service.name}**.\n\n${service.description}\n\n¿Es correcto? ¿Te gustaría que te conecte con nuestros profesionales especializados?`,
        serviceSuggestion: service
      };
    }
  }

  // Respuesta genérica si no se detecta un servicio específico
  return {
    response: 'Entiendo tu problema. Para darte la mejor recomendación, ¿podrías ser más específico sobre qué tipo de servicio necesitas? Por ejemplo: problemas de agua, electricidad, aire acondicionado, etc.'
  };
}
