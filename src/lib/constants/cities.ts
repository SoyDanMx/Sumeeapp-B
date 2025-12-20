/**
 * Lista de ciudades donde SumeeApp opera
 * Componente compartido para uso en toda la aplicación
 */

export const CITIES = [
  "Ciudad de México",
  "Monterrey",
  "Guadalajara",
  "Puebla",
  "Querétaro",
  "Tijuana",
  "León",
  "Mérida",
  "Cancún",
  "Otra",
] as const;

export type City = typeof CITIES[number];

/**
 * Información detallada de ciudades
 */
export interface CityInfo {
  name: string;
  slug: string;
  state: string;
  description: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  services: string[];
  professionals: number;
  completedJobs: number;
}

export const CITIES_DETAILED: CityInfo[] = [
  {
    name: 'Ciudad de México',
    slug: 'ciudad-de-mexico',
    state: 'CDMX',
    description: 'Capital de México y área metropolitana más grande del país. Servicios disponibles en todas las alcaldías.',
    coordinates: {
      lat: 19.4326,
      lng: -99.1332,
    },
    services: ['Electricidad', 'Plomería', 'Montaje y Armado', 'Aire Acondicionado', 'Pintura', 'Limpieza', 'Jardinería', 'Carpintería', 'CCTV', 'Redes y WiFi'],
    professionals: 250,
    completedJobs: 15000,
  },
  {
    name: 'Monterrey',
    slug: 'monterrey',
    state: 'Nuevo León',
    description: 'Ciudad industrial del norte de México. Servicios profesionales disponibles en toda el área metropolitana.',
    coordinates: {
      lat: 25.6866,
      lng: -100.3161,
    },
    services: ['Electricidad', 'Plomería', 'Montaje y Armado', 'Aire Acondicionado', 'Pintura', 'Construcción', 'CCTV'],
    professionals: 120,
    completedJobs: 8000,
  },
  {
    name: 'Guadalajara',
    slug: 'guadalajara',
    state: 'Jalisco',
    description: 'Segunda ciudad más grande de México. Cobertura en toda el área metropolitana de Guadalajara.',
    coordinates: {
      lat: 20.6597,
      lng: -103.3496,
    },
    services: ['Electricidad', 'Plomería', 'Montaje y Armado', 'Aire Acondicionado', 'Pintura', 'Limpieza', 'Jardinería'],
    professionals: 95,
    completedJobs: 6000,
  },
  {
    name: 'Puebla',
    slug: 'puebla',
    state: 'Puebla',
    description: 'Ciudad histórica del centro de México. Servicios disponibles en Puebla capital y zona metropolitana.',
    coordinates: {
      lat: 19.0414,
      lng: -98.2063,
    },
    services: ['Electricidad', 'Plomería', 'Montaje y Armado', 'Pintura', 'Limpieza', 'Jardinería'],
    professionals: 65,
    completedJobs: 3500,
  },
  {
    name: 'Pachuca',
    slug: 'pachuca',
    state: 'Hidalgo',
    description: 'Capital de Hidalgo. Servicios profesionales disponibles en Pachuca y zona metropolitana.',
    coordinates: {
      lat: 20.1239,
      lng: -98.7369,
    },
    services: ['Electricidad', 'Plomería', 'Montaje y Armado', 'Pintura', 'Limpieza'],
    professionals: 45,
    completedJobs: 2500,
  },
];

