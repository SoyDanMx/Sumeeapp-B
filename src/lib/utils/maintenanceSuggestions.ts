/**
 * Utilidades para calcular sugerencias de mantenimiento del hogar
 * basadas en el historial de servicios completados
 */

export interface MaintenanceRecord {
  id: string;
  servicio: string;
  servicio_solicitado?: string;
  disciplina?: string;
  fecha_completado: Date | string;
  descripcion?: string;
}

export interface MaintenanceSuggestion {
  servicio: string;
  disciplina: string;
  ultimoMantenimiento: Date;
  proximoMantenimiento: Date;
  diasRestantes: number;
  prioridad: 'alta' | 'media' | 'baja';
  descripcion: string;
}

/**
 * Frecuencias recomendadas de mantenimiento por disciplina y tipo de servicio (en días)
 */
const MAINTENANCE_FREQUENCIES: Record<string, Record<string, number>> = {
  plomeria: {
    'Lavado y Desinfección de Tinaco': 180, // 6 meses
    'Lavado y Desinfección de Cisterna': 180, // 6 meses
    'Mantenimiento de Calentador': 180, // 6 meses
    'Mantenimiento de Boiler': 180, // 6 meses
    'Revisión de Tuberías': 365, // 12 meses
    'Mantenimiento de Bomba': 180, // 6 meses
    'Revisión General de Plomería': 365, // 12 meses
    default: 180, // 6 meses para servicios generales de plomería
  },
  electricidad: {
    'Revisión de Instalación Eléctrica': 365, // 12 meses
    'Mantenimiento de Tablero': 365, // 12 meses
    'Revisión de Contactos y Apagadores': 180, // 6 meses
    'Revisión General de Electricidad': 365, // 12 meses
    default: 365, // 12 meses para servicios generales de electricidad
  },
  limpieza: {
    'Limpieza Profunda': 90, // 3 meses
    'Limpieza de Alfombras': 180, // 6 meses
    'Limpieza de Ventanas': 90, // 3 meses
    'Limpieza de Muebles': 180, // 6 meses
    default: 90, // 3 meses para servicios generales de limpieza
  },
  carpinteria: {
    'Mantenimiento de Muebles': 365, // 12 meses
    'Revisión de Puertas y Ventanas': 180, // 6 meses
    default: 365, // 12 meses
  },
  pintura: {
    'Mantenimiento de Pintura': 730, // 24 meses
    default: 730, // 24 meses
  },
  default: {
    default: 180, // 6 meses por defecto
  },
};

/**
 * Obtiene la frecuencia recomendada de mantenimiento para un servicio específico
 */
function getMaintenanceFrequency(
  disciplina: string,
  servicio: string
): number {
  const disciplinaLower = disciplina?.toLowerCase() || 'default';
  const servicioLower = servicio?.toLowerCase() || '';

  // Buscar frecuencia específica para el servicio
  const disciplinaFreqs = MAINTENANCE_FREQUENCIES[disciplinaLower] || MAINTENANCE_FREQUENCIES.default;
  
  // Buscar coincidencia parcial en el nombre del servicio
  for (const [key, frequency] of Object.entries(disciplinaFreqs)) {
    if (key !== 'default' && servicioLower.includes(key.toLowerCase())) {
      return frequency;
    }
  }

  // Usar frecuencia por defecto de la disciplina o general
  return disciplinaFreqs.default || MAINTENANCE_FREQUENCIES.default.default;
}

/**
 * Calcula sugerencias de mantenimiento basadas en el historial de servicios completados
 */
export function calculateMaintenanceSuggestions(
  completedServices: MaintenanceRecord[]
): MaintenanceSuggestion[] {
  const suggestions: MaintenanceSuggestion[] = [];
  const serviceGroups = new Map<string, MaintenanceRecord[]>();

  // Agrupar servicios por disciplina y tipo
  completedServices.forEach((service) => {
    const disciplina = service.disciplina || 'general';
    const servicio = service.servicio_solicitado || service.servicio || 'Servicio';
    const key = `${disciplina}|${servicio}`;

    if (!serviceGroups.has(key)) {
      serviceGroups.set(key, []);
    }
    serviceGroups.get(key)!.push(service);
  });

  // Calcular sugerencias para cada grupo
  serviceGroups.forEach((services, key) => {
    // Obtener el servicio más reciente del grupo
    const sortedServices = services.sort((a, b) => {
      const dateA = new Date(a.fecha_completado).getTime();
      const dateB = new Date(b.fecha_completado).getTime();
      return dateB - dateA;
    });

    const lastService = sortedServices[0];
    const disciplina = lastService.disciplina || 'general';
    const servicio = lastService.servicio_solicitado || lastService.servicio || 'Servicio';
    const ultimoMantenimiento = new Date(lastService.fecha_completado);
    const frecuencia = getMaintenanceFrequency(disciplina, servicio);
    const proximoMantenimiento = new Date(ultimoMantenimiento);
    proximoMantenimiento.setDate(proximoMantenimiento.getDate() + frecuencia);

    const ahora = new Date();
    const diasRestantes = Math.ceil(
      (proximoMantenimiento.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Determinar prioridad basada en días restantes
    let prioridad: 'alta' | 'media' | 'baja' = 'baja';
    if (diasRestantes <= 30) {
      prioridad = 'alta';
    } else if (diasRestantes <= 90) {
      prioridad = 'media';
    }

    // Solo agregar sugerencias para servicios que necesitan mantenimiento periódico
    // Excluir servicios de emergencia o reparaciones únicas
    const esMantenimientoPeriodico = 
      servicio.toLowerCase().includes('mantenimiento') ||
      servicio.toLowerCase().includes('revisión') ||
      servicio.toLowerCase().includes('revision') ||
      servicio.toLowerCase().includes('lavado') ||
      servicio.toLowerCase().includes('limpieza') ||
      disciplina.toLowerCase() === 'limpieza';

    // También incluir servicios de instalación que requieren mantenimiento
    const requiereMantenimiento = 
      servicio.toLowerCase().includes('tinaco') ||
      servicio.toLowerCase().includes('calentador') ||
      servicio.toLowerCase().includes('boiler') ||
      servicio.toLowerCase().includes('bomba') ||
      servicio.toLowerCase().includes('instalación') ||
      servicio.toLowerCase().includes('instalacion');

    if (esMantenimientoPeriodico || requiereMantenimiento) {
      suggestions.push({
        servicio,
        disciplina,
        ultimoMantenimiento,
        proximoMantenimiento,
        diasRestantes,
        prioridad,
        descripcion: `Último mantenimiento realizado el ${ultimoMantenimiento.toLocaleDateString('es-MX', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}. Se recomienda realizar el próximo mantenimiento ${diasRestantes <= 0 ? 'lo antes posible' : `en ${diasRestantes} días`}.`,
      });
    }
  });

  // Ordenar por prioridad y días restantes
  return suggestions.sort((a, b) => {
    const priorityOrder = { alta: 0, media: 1, baja: 2 };
    const priorityDiff = priorityOrder[a.prioridad] - priorityOrder[b.prioridad];
    if (priorityDiff !== 0) return priorityDiff;
    return a.diasRestantes - b.diasRestantes;
  });
}

/**
 * Formatea la fecha relativa para mostrar en la UI
 */
export function formatRelativeDate(date: Date): string {
  const ahora = new Date();
  const diffMs = date.getTime() - ahora.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `Hace ${Math.abs(diffDays)} día${Math.abs(diffDays) !== 1 ? 's' : ''}`;
  } else if (diffDays === 0) {
    return 'Hoy';
  } else if (diffDays === 1) {
    return 'Mañana';
  } else if (diffDays < 7) {
    return `En ${diffDays} días`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `En ${weeks} semana${weeks !== 1 ? 's' : ''}`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `En ${months} mes${months !== 1 ? 'es' : ''}`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `En ${years} año${years !== 1 ? 's' : ''}`;
  }
}

