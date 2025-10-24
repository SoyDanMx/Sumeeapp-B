// src/lib/ai/technical-prompts.ts
// Sistema de prompts técnicos avanzados para SumeeBot

export interface TechnicalPrompt {
  category: string;
  keywords: string[];
  technicalContext: string;
  diagnosticQuestions: string[];
  commonSolutions: string[];
  safetyWarnings: string[];
  costFactors: string[];
  professionalRequirements: string[];
}

export const TECHNICAL_PROMPTS: Record<string, TechnicalPrompt> = {
  // PLOMERÍA AVANZADA
  'plomeria_fuga_grifo': {
    category: 'Plomería - Fugas de Grifo',
    keywords: ['fuga', 'grifo', 'gotea', 'agua', 'lavabo', 'llave', 'válvula'],
    technicalContext: 'Las fugas en grifos generalmente se deben a desgaste de empaques, cartuchos defectuosos, o problemas en el asiento de la válvula.',
    diagnosticQuestions: [
      '¿El grifo gotea constantemente o solo cuando está abierto?',
      '¿El goteo es desde la boquilla o desde la base del grifo?',
      '¿Qué tipo de grifo es? (monomando, dos manijas, etc.)',
      '¿Cuánto tiempo lleva el problema?'
    ],
    commonSolutions: [
      'Cambio de empaques de goma',
      'Reemplazo de cartucho cerámico',
      'Limpieza y ajuste del asiento de válvula',
      'Reemplazo completo del grifo si es muy antiguo'
    ],
    safetyWarnings: [
      'Cerrar la llave de paso antes de trabajar',
      'Verificar que no haya fugas después de la reparación',
      'Usar herramientas adecuadas para evitar dañar las conexiones'
    ],
    costFactors: [
      'Tipo de grifo (básico vs premium)',
      'Accesibilidad de la instalación',
      'Necesidad de herramientas especializadas',
      'Disponibilidad de repuestos'
    ],
    professionalRequirements: [
      'Experiencia en reparación de grifos',
      'Conocimiento de diferentes marcas y modelos',
      'Herramientas especializadas (extractores, llaves)',
      'Disponibilidad de repuestos'
    ]
  },

  'plomeria_fuga_tuberia': {
    category: 'Plomería - Fugas de Tubería',
    keywords: ['tubería', 'fuga', 'agua', 'pared', 'techo', 'humedad', 'mancha'],
    technicalContext: 'Las fugas en tuberías pueden ser por corrosión, conexiones flojas, o daños estructurales. Requieren diagnóstico inmediato.',
    diagnosticQuestions: [
      '¿Dónde se localiza la fuga? (pared, techo, piso)',
      '¿Es agua limpia o con residuos?',
      '¿Hay manchas de humedad visibles?',
      '¿La presión del agua ha disminuido?'
    ],
    commonSolutions: [
      'Reparación con abrazadera de emergencia',
      'Reemplazo de sección de tubería',
      'Soldadura en tuberías de cobre',
      'Reemplazo completo del tramo afectado'
    ],
    safetyWarnings: [
      'CORTAR AGUA INMEDIATAMENTE',
      'Verificar daños estructurales',
      'Evitar contacto con agua contaminada',
      'Revisar instalación eléctrica cercana'
    ],
    costFactors: [
      'Ubicación de la fuga (accesible vs empotrada)',
      'Tipo de material de tubería',
      'Necesidad de romper paredes/techos',
      'Urgencia del trabajo'
    ],
    professionalRequirements: [
      'Experiencia en detección de fugas',
      'Equipo de localización por ultrasonido',
      'Conocimiento de códigos de construcción',
      'Disponibilidad 24/7 para emergencias'
    ]
  },

  // ELECTRICIDAD AVANZADA
  'electricidad_cortocircuito': {
    category: 'Electricidad - Cortocircuitos',
    keywords: ['cortocircuito', 'corto', 'chispa', 'fuego', 'cable', 'cableado', 'interruptor'],
    technicalContext: 'Los cortocircuitos son fallas eléctricas peligrosas que requieren intervención inmediata de un electricista certificado.',
    diagnosticQuestions: [
      '¿Hay olor a quemado o humo?',
      '¿Los interruptores se disparan constantemente?',
      '¿Hay chispas visibles?',
      '¿Qué aparatos estaban funcionando cuando ocurrió?'
    ],
    commonSolutions: [
      'Reemplazo de cableado dañado',
      'Reparación de conexiones flojas',
      'Instalación de protecciones adicionales',
      'Actualización del sistema eléctrico'
    ],
    safetyWarnings: [
      'NO TOCAR NADA - PELIGRO DE ELECTROCUCIÓN',
      'Cortar energía en el tablero principal',
      'Evacuar el área si hay humo',
      'Llamar a emergencias si hay fuego'
    ],
    costFactors: [
      'Extensión del daño en el cableado',
      'Accesibilidad de las conexiones',
      'Necesidad de actualizar protecciones',
      'Cumplimiento de códigos eléctricos'
    ],
    professionalRequirements: [
      'Electricista certificado obligatorio',
      'Conocimiento de NOM-001-SEDE',
      'Equipo de medición y prueba',
      'Seguro de responsabilidad civil'
    ]
  },

  'electricidad_iluminacion': {
    category: 'Electricidad - Problemas de Iluminación',
    keywords: ['luz', 'bombilla', 'foco', 'led', 'parpadea', 'no enciende', 'iluminación'],
    technicalContext: 'Los problemas de iluminación pueden ser por bombillas defectuosas, conexiones flojas, o problemas en el circuito.',
    diagnosticQuestions: [
      '¿El problema es en una bombilla o en toda la habitación?',
      '¿La bombilla parpadea o no enciende?',
      '¿Qué tipo de bombilla es? (LED, incandescente, fluorescente)',
      '¿El interruptor funciona correctamente?'
    ],
    commonSolutions: [
      'Reemplazo de bombilla',
      'Ajuste de conexiones en portalámparas',
      'Reemplazo de interruptor defectuoso',
      'Actualización a iluminación LED'
    ],
    safetyWarnings: [
      'Cortar energía antes de trabajar',
      'Verificar que la bombilla sea del voltaje correcto',
      'No tocar conexiones con las manos mojadas',
      'Usar escalera estable para trabajos en altura'
    ],
    costFactors: [
      'Tipo de bombilla (básica vs LED premium)',
      'Accesibilidad de la instalación',
      'Necesidad de cableado adicional',
      'Cantidad de puntos de luz'
    ],
    professionalRequirements: [
      'Conocimiento de diferentes tipos de iluminación',
      'Experiencia en instalaciones LED',
      'Herramientas de medición eléctrica',
      'Disponibilidad de repuestos'
    ]
  },

  // HVAC AVANZADO
  'hvac_aire_no_enfría': {
    category: 'HVAC - Aire Acondicionado No Enfría',
    keywords: ['aire', 'acondicionado', 'minisplit', 'no enfría', 'caliente', 'clima'],
    technicalContext: 'Los problemas de enfriamiento en aire acondicionado pueden ser por falta de gas refrigerante, filtros sucios, o problemas en el compresor.',
    diagnosticQuestions: [
      '¿El aire sale pero no está frío?',
      '¿Cuándo fue la última limpieza de filtros?',
      '¿Hay ruidos extraños en la unidad exterior?',
      '¿La unidad exterior está funcionando?'
    ],
    commonSolutions: [
      'Limpieza de filtros y serpentines',
      'Recarga de gas refrigerante',
      'Limpieza de unidad exterior',
      'Reemplazo de compresor si es necesario'
    ],
    safetyWarnings: [
      'No manipular gas refrigerante sin certificación',
      'Cortar energía antes de limpiar',
      'Usar equipo de protección personal',
      'Verificar que no haya fugas de gas'
    ],
    costFactors: [
      'Tipo de sistema (inverter vs convencional)',
      'Cantidad de gas refrigerante necesaria',
      'Accesibilidad de la unidad exterior',
      'Necesidad de herramientas especializadas'
    ],
    professionalRequirements: [
      'Técnico certificado en refrigeración',
      'Equipo de medición de presión',
      'Herramientas para manejo de refrigerantes',
      'Conocimiento de diferentes marcas'
    ]
  },

  // SEGURIDAD ELECTRÓNICA
  'seguridad_camaras': {
    category: 'Seguridad - Instalación de Cámaras',
    keywords: ['cámara', 'camara', 'seguridad', 'vigilancia', 'grabación', 'monitoreo'],
    technicalContext: 'La instalación de cámaras de seguridad requiere planificación de cobertura, cableado de red, y configuración de sistemas de grabación.',
    diagnosticQuestions: [
      '¿Qué áreas necesitan vigilancia?',
      '¿Prefiere cámaras cableadas o inalámbricas?',
      '¿Necesita grabación 24/7 o por detección?',
      '¿Tiene acceso a internet estable?'
    ],
    commonSolutions: [
      'Instalación de cámaras IP',
      'Configuración de DVR/NVR',
      'Cableado de red estructurado',
      'Configuración de acceso remoto'
    ],
    safetyWarnings: [
      'Respetar privacidad de vecinos',
      'Cumplir con leyes de videovigilancia',
      'Proteger contraseñas de acceso',
      'Instalar en lugares seguros'
    ],
    costFactors: [
      'Cantidad y calidad de cámaras',
      'Necesidad de cableado adicional',
      'Capacidad de almacenamiento',
      'Complejidad de la instalación'
    ],
    professionalRequirements: [
      'Experiencia en sistemas de seguridad',
      'Conocimiento de redes IP',
      'Herramientas de cableado especializado',
      'Certificación en videovigilancia'
    ]
  }
};

export function detectTechnicalCategory(query: string): string {
  const queryLower = query.toLowerCase();
  
  // Detección avanzada con múltiples criterios
  for (const [key, prompt] of Object.entries(TECHNICAL_PROMPTS)) {
    const matchScore = prompt.keywords.reduce((score, keyword) => {
      return score + (queryLower.includes(keyword) ? 1 : 0);
    }, 0);
    
    if (matchScore >= 2) { // Mínimo 2 palabras clave coincidentes
      return key;
    }
  }
  
  return 'general';
}

export function generateTechnicalResponse(category: string, userQuery: string): {
  diagnosis: string;
  questions: string[];
  solutions: string[];
  warnings: string[];
  costEstimate: string;
  professionalType: string;
} {
  const prompt = TECHNICAL_PROMPTS[category];
  
  if (!prompt) {
    return {
      diagnosis: 'Requiere evaluación técnica presencial para determinar el alcance del problema.',
      questions: ['¿Podrías describir más detalles del problema?'],
      solutions: ['Consulta con un técnico especializado'],
      warnings: ['No intentes reparaciones sin conocimiento técnico'],
      costEstimate: 'Consulta precio con el técnico',
      professionalType: 'Técnico General'
    };
  }

  return {
    diagnosis: `${prompt.technicalContext} Basado en tu descripción, el problema parece estar relacionado con ${prompt.category.toLowerCase()}.`,
    questions: prompt.diagnosticQuestions,
    solutions: prompt.commonSolutions,
    warnings: prompt.safetyWarnings,
    costEstimate: generateCostEstimate(prompt.costFactors),
    professionalType: prompt.professionalRequirements[0] || 'Técnico Especializado'
  };
}

function generateCostEstimate(factors: string[]): string {
  // Lógica para generar estimaciones de costo basadas en factores
  const baseCosts = {
    'plomeria_fuga_grifo': { min: 300, max: 800 },
    'plomeria_fuga_tuberia': { min: 800, max: 2500 },
    'electricidad_cortocircuito': { min: 1200, max: 4000 },
    'electricidad_iluminacion': { min: 200, max: 600 },
    'hvac_aire_no_enfría': { min: 800, max: 2000 },
    'seguridad_camaras': { min: 2000, max: 8000 }
  };
  
  // Por ahora retornamos rangos fijos, pero esto se puede hacer más dinámico
  return 'Consulta precio específico con el técnico';
}
