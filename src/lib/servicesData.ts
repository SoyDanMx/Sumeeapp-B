/**
 * Datos de servicios para páginas dinámicas
 * Estructura escalable para todas las categorías de servicios
 */

export interface ServiceData {
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  hoverColor: string;
  services: string[];
  benefits: string[];
  isPopular?: boolean;
}

export const servicesData: Record<string, ServiceData> = {
  plomeria: {
    name: 'Plomería',
    slug: 'plomeria',
    description: 'Reparaciones, instalaciones y mantenimiento de plomería con técnicos verificados. Respuesta en menos de 2 horas.',
    icon: '🔧',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    hoverColor: 'hover:bg-blue-100',
    services: [
      'Reparación de fugas',
      'Instalación de tinacos',
      'Desazolve de drenajes',
      'Cambio de válvulas',
      'Instalación de calentadores',
      'Reparación de llaves',
      'Instalación de sanitarios',
      'Mantenimiento preventivo'
    ],
    benefits: [
      'Respuesta Rápida - Técnicos disponibles 24/7 para emergencias',
      'Garantía Total - Todos nuestros trabajos tienen garantía',
      'Cotización Gratuita - Sin compromiso, precio justo y transparente'
    ],
    isPopular: true
  },
  electricidad: {
    name: 'Electricidad',
    slug: 'electricidad',
    description: 'Instalaciones eléctricas, reparaciones y mantenimiento con electricistas certificados. Trabajos seguros y garantizados.',
    icon: '⚡',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    hoverColor: 'hover:bg-yellow-100',
    services: [
      'Instalación de contactos',
      'Reparación de cortocircuitos',
      'Instalación de luminarias',
      'Cableado eléctrico',
      'Instalación de ventiladores',
      'Reparación de tableros',
      'Instalación de timbres',
      'Mantenimiento eléctrico'
    ],
    benefits: [
      'Electricistas Certificados - Profesionales con licencia',
      'Trabajos Seguros - Cumplimos todas las normas eléctricas',
      'Garantía de Calidad - Trabajos garantizados por 1 año'
    ],
    isPopular: true
  },
  'aire-acondicionado': {
    name: 'Aire Acondicionado',
    slug: 'aire-acondicionado',
    description: 'Instalación, reparación y mantenimiento de sistemas de aire acondicionado. Técnicos especializados en todas las marcas.',
    icon: '❄️',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    hoverColor: 'hover:bg-cyan-100',
    services: [
      'Instalación de minisplits',
      'Mantenimiento preventivo',
      'Reparación de equipos',
      'Limpieza de filtros',
      'Recarga de gas refrigerante',
      'Instalación de ductos',
      'Reparación de compresores',
      'Instalación de termostatos'
    ],
    benefits: [
      'Técnicos Especializados - Experiencia en todas las marcas',
      'Mantenimiento Preventivo - Evita fallas costosas',
      'Garantía Extendida - Hasta 2 años en instalaciones'
    ],
    isPopular: true
  },
  cerrajeria: {
    name: 'Cerrajería',
    slug: 'cerrajeria',
    description: 'Servicios de cerrajería las 24 horas. Cambio de cerraduras, apertura de puertas y sistemas de seguridad.',
    icon: '🔑',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    hoverColor: 'hover:bg-gray-100',
    services: [
      'Cambio de cerraduras',
      'Apertura de puertas',
      'Instalación de candados',
      'Reparación de cerraduras',
      'Duplicado de llaves',
      'Instalación de cerrojos',
      'Sistemas de seguridad',
      'Cerrajería automotriz'
    ],
    benefits: [
      'Servicio 24/7 - Disponibles en emergencias',
      'Técnicos Certificados - Profesionales de confianza',
      'Respuesta Rápida - Llegamos en menos de 30 minutos'
    ]
  },
  pintura: {
    name: 'Pintura',
    slug: 'pintura',
    description: 'Servicios de pintura residencial y comercial. Pintores profesionales con materiales de calidad.',
    icon: '🎨',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    hoverColor: 'hover:bg-purple-100',
    services: [
      'Pintura de interiores',
      'Pintura de exteriores',
      'Preparación de superficies',
      'Pintura de techos',
      'Pintura de muebles',
      'Barnizado de madera',
      'Pintura texturizada',
      'Restauración de pintura'
    ],
    benefits: [
      'Materiales de Calidad - Solo marcas reconocidas',
      'Pintores Profesionales - Experiencia comprobada',
      'Garantía de Acabado - Trabajos perfectos garantizados'
    ]
  },
  limpieza: {
    name: 'Limpieza',
    slug: 'limpieza',
    description: 'Servicios de limpieza residencial y comercial. Personal capacitado y productos ecológicos.',
    icon: '✨',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    hoverColor: 'hover:bg-green-100',
    services: [
      'Limpieza residencial',
      'Limpieza de oficinas',
      'Limpieza post-obra',
      'Limpieza de ventanas',
      'Limpieza de alfombras',
      'Limpieza profunda',
      'Limpieza de muebles',
      'Limpieza de cocinas'
    ],
    benefits: [
      'Personal Capacitado - Empleados de confianza',
      'Productos Ecológicos - Cuidamos tu salud y el medio ambiente',
      'Flexibilidad de Horarios - Adaptamos a tus necesidades'
    ]
  },
  jardineria: {
    name: 'Jardinería',
    slug: 'jardineria',
    description: 'Mantenimiento de jardines, poda de árboles y diseño de espacios verdes. Jardineros especializados.',
    icon: '🌿',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    hoverColor: 'hover:bg-emerald-100',
    services: [
      'Mantenimiento de jardines',
      'Poda de árboles',
      'Diseño de jardines',
      'Instalación de césped',
      'Riego automático',
      'Fertilización',
      'Control de plagas',
      'Limpieza de jardines'
    ],
    benefits: [
      'Jardineros Especializados - Conocimiento en plantas',
      'Diseño Personalizado - Jardines únicos para tu espacio',
      'Mantenimiento Continuo - Servicios regulares disponibles'
    ]
  },
  carpinteria: {
    name: 'Carpintería',
    slug: 'carpinteria',
    description: 'Trabajos en madera, muebles a medida y reparaciones. Carpinteros con años de experiencia.',
    icon: '🪵',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    hoverColor: 'hover:bg-amber-100',
    services: [
      'Muebles a medida',
      'Reparación de muebles',
      'Instalación de closets',
      'Trabajos en madera',
      'Restauración de muebles',
      'Instalación de puertas',
      'Trabajos de ebanistería',
      'Reparación de ventanas'
    ],
    benefits: [
      'Muebles a Medida - Diseños únicos para tu espacio',
      'Carpinteros Experimentados - Años de experiencia',
      'Materiales de Calidad - Solo maderas seleccionadas'
    ]
  },
  construccion: {
    name: 'Arquitectos & Ingenieros',
    slug: 'construccion',
    description: 'Especialistas en construcción, remodelación y diseño arquitectónico. Profesionales certificados.',
    icon: '🏗️',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    hoverColor: 'hover:bg-indigo-100',
    services: [
      'Diseño arquitectónico',
      'Remodelación de casas',
      'Construcción de muros',
      'Instalación de pisos',
      'Construcción de techos',
      'Ampliaciones',
      'Permisos de construcción',
      'Supervisión de obra'
    ],
    benefits: [
      'Profesionales Certificados - Arquitectos e ingenieros licenciados',
      'Diseños Únicos - Proyectos personalizados',
      'Permisos Incluidos - Te ayudamos con la documentación'
    ]
  },
  tablaroca: {
    name: 'Tablaroca',
    slug: 'tablaroca',
    description: 'Instalación de tablaroca, cielos falsos y divisiones. Especialistas en construcción en seco.',
    icon: '🧱',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    hoverColor: 'hover:bg-orange-100',
    services: [
      'Instalación de tablaroca',
      'Cielos falsos',
      'Divisiones de oficina',
      'Reparación de tablaroca',
      'Instalación de molduras',
      'Pintura de tablaroca',
      'Instalación de puertas',
      'Trabajos de acabados'
    ],
    benefits: [
      'Especialistas en Construcción en Seco - Técnica especializada',
      'Trabajos Limpios - Sin escombros ni polvo excesivo',
      'Terminados Perfectos - Acabados profesionales'
    ]
  },
  cctv: {
    name: 'CCTV',
    slug: 'cctv',
    description: 'Sistemas de seguridad y videovigilancia. Instalación de cámaras y monitoreo 24/7.',
    icon: '📹',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    hoverColor: 'hover:bg-indigo-100',
    services: [
      'Instalación de cámaras',
      'Sistemas de monitoreo',
      'Grabación digital',
      'Cámaras IP',
      'Sistemas de alarma',
      'Control de acceso',
      'Monitoreo remoto',
      'Mantenimiento de sistemas'
    ],
    benefits: [
      'Tecnología Avanzada - Sistemas de última generación',
      'Monitoreo 24/7 - Seguridad las 24 horas',
      'Instalación Profesional - Sistemas confiables'
    ]
  },
  wifi: {
    name: 'WiFi',
    slug: 'wifi',
    description: 'Instalación y configuración de redes WiFi, internet y sistemas de conectividad.',
    icon: '📶',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    hoverColor: 'hover:bg-pink-100',
    services: [
      'Instalación de WiFi',
      'Configuración de routers',
      'Ampliación de señal',
      'Reparación de internet',
      'Instalación de cableado',
      'Configuración de redes',
      'Optimización de velocidad',
      'Soporte técnico'
    ],
    benefits: [
      'Técnicos Especializados - Expertos en redes',
      'Cobertura Completa - WiFi en toda tu casa',
      'Soporte Continuo - Asistencia cuando la necesites'
    ]
  },
  fumigacion: {
    name: 'Fumigación',
    slug: 'fumigacion',
    description: 'Control de plagas y fumigación. Servicios seguros y efectivos para tu hogar o negocio.',
    icon: '🐛',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    hoverColor: 'hover:bg-red-100',
    services: [
      'Fumigación residencial',
      'Control de cucarachas',
      'Eliminación de roedores',
      'Fumigación de jardines',
      'Control de termitas',
      'Fumigación comercial',
      'Tratamiento preventivo',
      'Inspección de plagas'
    ],
    benefits: [
      'Productos Seguros - Fórmulas no tóxicas para humanos',
      'Control Efectivo - Eliminación garantizada',
      'Tratamiento Preventivo - Evita futuras infestaciones'
    ]
  }
};

/**
 * Obtiene los datos de un servicio por su slug
 */
export function getServiceBySlug(slug: string): ServiceData | null {
  return servicesData[slug] || null;
}

/**
 * Obtiene todos los servicios populares
 */
export function getPopularServices(): ServiceData[] {
  return Object.values(servicesData).filter(service => service.isPopular);
}

/**
 * Obtiene todos los servicios
 */
export function getAllServices(): ServiceData[] {
  return Object.values(servicesData);
}