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
  // Nuevos campos para mejorar respuestas
  urgency: 'baja' | 'media' | 'alta' | 'crítica';
  estimatedTime: string;
  valuePropositions: string[];
  actionSteps: string[];
  membershipBenefits: string[];
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
    ],
    urgency: 'baja',
    estimatedTime: '1-2 horas',
    valuePropositions: [
      'Reparaciones rápidas y efectivas',
      'Mantenimiento preventivo',
      'Ahorro de agua',
      'Prevención de daños mayores'
    ],
    actionSteps: [
      'Identificar la fuente de la fuga',
      'Reemplazar el componente dañado',
      'Ajustar la presión de la válvula',
      'Limpieza de la conexión'
    ],
    membershipBenefits: [
      'Asistencia 24/7',
      'Descuentos en repuestos',
      'Prioridad en atención',
      'Garantía de 30 días'
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
    ],
    urgency: 'alta',
    estimatedTime: '2-4 horas',
    valuePropositions: [
      'Prevención de daños mayores',
      'Mantenimiento de la integridad de la tubería',
      'Ahorro de agua',
      'Prevención de daños estructurales'
    ],
    actionSteps: [
      'Identificar la fuente de la fuga',
      'Aislar el área afectada',
      'Reparar la fuga',
      'Reemplazar el tramo dañado'
    ],
    membershipBenefits: [
      'Asistencia 24/7',
      'Descuentos en repuestos',
      'Prioridad en atención',
      'Garantía de 30 días'
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
    ],
    urgency: 'crítica',
    estimatedTime: '1-2 horas',
    valuePropositions: [
      'Prevención de incendios',
      'Protección de equipos',
      'Ahorro de energía',
      'Seguridad de la instalación'
    ],
    actionSteps: [
      'Identificar la fuente del cortocircuito',
      'Aislar el área afectada',
      'Reparar el cortocircuito',
      'Reemplazar el cableado dañado'
    ],
    membershipBenefits: [
      'Asistencia 24/7',
      'Descuentos en repuestos',
      'Prioridad en atención',
      'Garantía de 30 días'
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
    ],
    urgency: 'baja',
    estimatedTime: '1-2 horas',
    valuePropositions: [
      'Ahorro de energía',
      'Mejor iluminación',
      'Ahorro en repuestos',
      'Prevención de averías'
    ],
    actionSteps: [
      'Identificar la causa del problema',
      'Reemplazar la bombilla defectuosa',
      'Ajustar la conexión',
      'Verificar el interruptor'
    ],
    membershipBenefits: [
      'Asistencia 24/7',
      'Descuentos en repuestos',
      'Prioridad en atención',
      'Garantía de 30 días'
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
    ],
    urgency: 'media',
    estimatedTime: '2-4 horas',
    valuePropositions: [
      'Ahorro de energía',
      'Mejor confort térmico',
      'Prevención de averías',
      'Ahorro en mantenimiento'
    ],
    actionSteps: [
      'Identificar la causa del problema',
      'Limpieza de filtros y serpentines',
      'Recarga de gas refrigerante',
      'Limpieza de unidad exterior'
    ],
    membershipBenefits: [
      'Asistencia 24/7',
      'Descuentos en repuestos',
      'Prioridad en atención',
      'Garantía de 30 días'
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
    ],
    urgency: 'baja',
    estimatedTime: '1-2 horas',
    valuePropositions: [
      'Prevención de robos',
      'Seguridad de la propiedad',
      'Monitoreo en tiempo real',
      'Prueba de intrusión'
    ],
    actionSteps: [
      'Planificar la cobertura',
      'Instalar cámaras',
      'Configurar DVR/NVR',
      'Prueba de funcionamiento'
    ],
    membershipBenefits: [
      'Asistencia 24/7',
      'Descuentos en repuestos',
      'Prioridad en atención',
      'Garantía de 30 días'
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
  urgency?: string;
  estimatedTime?: string;
  valuePropositions?: string[];
  actionSteps?: string[];
  membershipBenefits?: string[];
} {
  const prompt = TECHNICAL_PROMPTS[category];
  
  if (!prompt) {
    // Respuesta mejorada para casos generales
    return {
      diagnosis: `Entiendo tu problema. Para darte una solución precisa y personalizada, necesito conectar contigo con uno de nuestros técnicos verificados que podrá evaluar tu situación específica.`,
      questions: [
        '¿Podrías describir más detalles del problema?',
        '¿Cuándo empezó a ocurrir?',
        '¿Es algo urgente o puede esperar?'
      ],
      solutions: [
        'Consulta diagnóstica con técnico especializado',
        'Evaluación presencial del problema',
        'Presupuesto sin compromiso'
      ],
      warnings: ['No intentes reparaciones sin conocimiento técnico para evitar daños mayores'],
      costEstimate: '$350 - $500 MXN (Tarifa de revisión inicial, deducible del servicio)',
      professionalType: 'Técnico Especializado',
      urgency: 'media',
      estimatedTime: '2-4 horas',
      valuePropositions: [
        'Profesionales verificados y certificados',
        'Garantía de 30 días en todos los trabajos',
        'Respuesta en menos de 2 horas',
        'Precios transparentes sin sorpresas'
      ],
      actionSteps: [
        'Conecta con un técnico verificado',
        'Agenda tu servicio',
        'Recibe diagnóstico y presupuesto',
        'Aprueba el trabajo y recibe garantía'
      ],
      membershipBenefits: [
        'Contacto directo con técnicos',
        'Respuesta prioritaria',
        'Descuentos exclusivos',
        'Seguimiento completo del servicio'
      ]
    };
  }

  // Generar diagnóstico más conversacional y valioso
  const personalizedDiagnosis = generatePersonalizedDiagnosis(prompt, userQuery);
  
  return {
    diagnosis: personalizedDiagnosis,
    questions: prompt.diagnosticQuestions,
    solutions: prompt.commonSolutions,
    warnings: prompt.safetyWarnings,
    costEstimate: generateCostEstimate(prompt.costFactors, category),
    professionalType: prompt.professionalRequirements[0] || 'Técnico Especializado',
    urgency: prompt.urgency,
    estimatedTime: prompt.estimatedTime,
    valuePropositions: prompt.valuePropositions,
    actionSteps: prompt.actionSteps,
    membershipBenefits: prompt.membershipBenefits
  };
}

function generatePersonalizedDiagnosis(prompt: TechnicalPrompt, userQuery: string): string {
  const urgencyEmoji = {
    'baja': '📅',
    'media': '⚠️',
    'alta': '🔴',
    'crítica': '🚨'
  };
  
  return `${urgencyEmoji[prompt.urgency]} **Diagnóstico:** ${prompt.technicalContext}

Basado en tu descripción "${userQuery.substring(0, 100)}...", el problema está relacionado con **${prompt.category}**.

**⏱️ Tiempo estimado de solución:** ${prompt.estimatedTime}
**💰 Rango de inversión:** ${generateCostEstimate(prompt.costFactors, '')}

**🎯 Nuestros técnicos verificados pueden:**
${prompt.valuePropositions.map(vp => `✅ ${vp}`).join('\n')}

**📋 Próximos pasos:**
${prompt.actionSteps.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}`;
}

function generateCostEstimate(factors: string[], category: string): string {
  const baseCosts: Record<string, { min: number; max: number }> = {
    'plomeria_fuga_grifo': { min: 350, max: 650 },
    'plomeria_fuga_tuberia': { min: 800, max: 2500 },
    'electricidad_cortocircuito': { min: 1200, max: 4000 },
    'electricidad_iluminacion': { min: 350, max: 800 },
    'hvac_aire_no_enfría': { min: 800, max: 2000 },
    'seguridad_camaras': { min: 2000, max: 8000 }
  };
  
  const costs = baseCosts[category] || { min: 350, max: 800 };
  
  return `$${costs.min.toLocaleString()} - $${costs.max.toLocaleString()} MXN\n💡 La tarifa de revisión ($350-$450) es deducible del servicio final.`;
}
