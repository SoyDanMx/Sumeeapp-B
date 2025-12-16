/**
 * Sistema de Categorías del Marketplace
 * Estructura organizada tipo MercadoLibre con slugs SEO-friendly
 * Incluye subcategorías detalladas para filtrado avanzado
 */

import {
  faBolt,
  faWrench,
  faHammer,
  faTools,
  faPaintRoller,
  faTree,
  faServer,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";

export interface MarketplaceSubcategory {
  id: string;
  name: string;
  keywords: string[]; // Palabras clave para búsqueda en título/descripción
}

export interface MarketplaceCategory {
  id: string;
  slug: string; // URL-friendly slug
  name: string;
  namePlural: string;
  icon: IconDefinition;
  color: string;
  gradient: string;
  description: string;
  subcategories: MarketplaceSubcategory[];
  filters?: {
    condition?: boolean;
    priceRange?: boolean;
    location?: boolean;
    powerType?: boolean;
  };
}

export const MARKETPLACE_CATEGORIES: MarketplaceCategory[] = [
  {
    id: "electricidad",
    slug: "electricidad",
    name: "Electricidad",
    namePlural: "Herramientas Eléctricas",
    icon: faBolt,
    color: "yellow",
    gradient: "from-yellow-400 to-yellow-600",
    description: "Herramientas eléctricas, cables, interruptores y accesorios eléctricos",
    subcategories: [
      { id: "herramientas-electricas", name: "Herramientas Eléctricas", keywords: ["taladro", "atornillador", "sierra", "esmeril", "lijadora", "pulidora", "caladora", "soldadora"] },
      { id: "cables", name: "Cables y Alambres", keywords: ["cable", "alambre", "conductor", "cableado", "cable eléctrico", "cable electrico", "calibre", "awg", "thwn", "thw", "nyp", "cable calibre"] },
      { id: "interruptores", name: "Interruptores y Tomacorrientes", keywords: ["interruptor", "tomacorriente", "enchufe", "apagador", "switch", "contacto"] },
      { id: "iluminacion", name: "Iluminación", keywords: ["foco", "lámpara", "led", "luminaria", "reflector", "spot", "plafón"] },
      { id: "cajas-y-tuberias", name: "Cajas y Tuberías", keywords: ["caja", "tubería", "conduit", "canaleta", "registro"] },
      { id: "accesorios-electricos", name: "Accesorios Eléctricos", keywords: ["cinta", "aislante", "terminal", "conector", "cable", "manguera"] },
    ],
    filters: {
      condition: true,
      priceRange: true,
      location: true,
      powerType: true,
    },
  },
  {
    id: "plomeria",
    slug: "plomeria",
    name: "Plomería",
    namePlural: "Herramientas de Plomería",
    icon: faWrench,
    color: "blue",
    gradient: "from-blue-400 to-blue-600",
    description: "Herramientas y accesorios para trabajos de plomería",
    subcategories: [
      { id: "bombas-agua", name: "Bombas de Agua", keywords: ["bomba", "bomba de agua", "bomba sumergible", "bomba centrífuga", "bomba periférica"] },
      { id: "tuberia-pvc", name: "Tubería PVC", keywords: ["tubería pvc", "pvc", "tubo pvc", "caño pvc", "conduit pvc"] },
      { id: "tuberia-cobre", name: "Tubería de Cobre", keywords: ["tubería cobre", "cobre", "tubo cobre", "caño cobre", "tubería de cobre"] },
      { id: "tuberia-hierro", name: "Tubería de Hierro", keywords: ["tubería hierro", "hierro", "tubo hierro", "caño hierro", "galvanizado"] },
      { id: "llaves-y-valvulas", name: "Llaves y Válvulas", keywords: ["llave", "válvula", "valvula", "llave de paso", "llave de bola", "compuerta"] },
      { id: "conexiones-y-accesorios", name: "Conexiones y Accesorios", keywords: ["codo", "tee", "reducción", "unión", "tapón", "niple", "adaptador", "manguera"] },
      { id: "herramientas-plomeria", name: "Herramientas de Plomería", keywords: ["llave", "pinza", "tenaza", "destapacaños", "sopapa", "desarmador"] },
      { id: "sanitarios", name: "Sanitarios", keywords: ["wc", "inodoro", "lavabo", "lavamanos", "mingitorio", "taza"] },
    ],
    filters: {
      condition: true,
      priceRange: true,
      location: true,
    },
  },
  {
    id: "construccion",
    slug: "construccion",
    name: "Construcción",
    namePlural: "Herramientas de Construcción",
    icon: faHammer,
    color: "orange",
    gradient: "from-orange-500 to-red-500",
    description: "Herramientas pesadas y equipos para construcción",
    subcategories: [
      { id: "demolicion", name: "Demolición", keywords: ["martillo", "demolición", "rompedor", "picota", "mazo", "barreta"] },
      { id: "medicion", name: "Medición y Nivelación", keywords: ["nivel", "plomada", "cinta", "metro", "escuadra", "regla", "medición"] },
      { id: "mezcladoras", name: "Mezcladoras y Revolvedoras", keywords: ["mezcladora", "revolvedora", "batidora", "concreto", "cemento"] },
      { id: "equipos-pesados", name: "Equipos Pesados", keywords: ["compactadora", "vibrador", "cortadora", "sierra", "pulidora"] },
      { id: "andamios", name: "Andamios y Escaleras", keywords: ["andamio", "escalera", "escalera de tijera", "escalera extensible"] },
      { id: "herramientas-manuales", name: "Herramientas Manuales", keywords: ["paleta", "llana", "cuchara", "pala", "pico", "azadón"] },
    ],
    filters: {
      condition: true,
      priceRange: true,
      location: true,
    },
  },
  {
    id: "mecanica",
    slug: "mecanica",
    name: "Mecánica",
    namePlural: "Herramientas Mecánicas",
    icon: faTools,
    color: "gray",
    gradient: "from-gray-500 to-gray-700",
    description: "Herramientas para trabajos mecánicos y automotrices",
    subcategories: [
      { id: "llaves-mecanicas", name: "Llaves Mecánicas", keywords: ["llave", "llave inglesa", "llave francesa", "llave de tubo", "llave allen", "llave torx", "llave combinada", "llave ajustable", "llave de carraca", "llave de impacto"] },
      { id: "destornilladores", name: "Destornilladores y Desarmadores", keywords: ["destornillador", "desarmador", "phillips", "plano", "estrella", "torx", "phillips", "pozidriv", "hexagonal"] },
      { id: "equipos-automotrices", name: "Equipos Automotrices", keywords: ["gato", "elevador", "compresor", "llave de rueda", "herramienta automotriz", "gato hidráulico", "gato mecánico", "elevador de autos"] },
      { id: "herramientas-especializadas", name: "Herramientas Especializadas", keywords: ["pinza", "tenaza", "alicate", "cortador", "remachadora", "pinza de presión", "pinza de punta", "alicate de corte", "tenaza de corte"] },
      { id: "medicion-mecanica", name: "Medición Mecánica", keywords: ["calibrador", "vernier", "micrómetro", "escalímetro", "regla", "nivel", "escuadra", "transportador", "metro"] },
      { id: "herramientas-electricas-mecanica", name: "Herramientas Eléctricas Mecánicas", keywords: ["taladro", "atornillador", "llave de impacto eléctrica", "pulidora", "esmeril", "lijadora", "sierra"] },
      { id: "tornillos-y-tuercas", name: "Tornillos y Tuercas", keywords: ["tornillo", "tuerca", "perno", "arandela", "chaveta", "remache", "clavo", "grapa"] },
      { id: "lubricantes-y-aceites", name: "Lubricantes y Aceites", keywords: ["aceite", "lubricante", "grasa", "wd-40", "penetrante", "aceite motor", "aceite transmisión"] },
    ],
    filters: {
      condition: true,
      priceRange: true,
      location: true,
    },
  },
  {
    id: "pintura",
    slug: "pintura",
    name: "Pintura",
    namePlural: "Herramientas de Pintura",
    icon: faPaintRoller,
    color: "purple",
    gradient: "from-purple-500 to-pink-500",
    description: "Rodillos, brochas, pistolas y accesorios para pintura",
    subcategories: [
      { id: "rodillos", name: "Rodillos y Mangos", keywords: ["rodillo", "rodillo de pintura", "manga", "mangos", "rodillo liso", "rodillo texturizado", "rodillo de espuma", "mango telescópico"] },
      { id: "brochas", name: "Brochas y Pinceles", keywords: ["brocha", "pincel", "brocha de pintura", "pincel de pintura", "brocha plana", "brocha redonda", "pincel angular", "brocha de esponja"] },
      { id: "pistolas", name: "Pistolas de Pintura", keywords: ["pistola", "pistola de pintura", "airless", "compresor", "pistola airless", "pistola de aire", "pulverizador", "spray"] },
      { id: "accesorios-pintura", name: "Accesorios de Pintura", keywords: ["bandeja", "cubeta", "papel", "masking", "cinta", "lona", "plástico", "cinta de enmascarar", "papel de lija", "lija"] },
      { id: "escaleras-pintura", name: "Escaleras y Andamios", keywords: ["escalera", "andamio", "plataforma", "trabajo en altura", "escalera de tijera", "escalera extensible", "andamio tubular"] },
      { id: "pinturas-y-barnices", name: "Pinturas y Barnices", keywords: ["pintura", "barniz", "esmalte", "látex", "acrílico", "vinilo", "pintura epóxica", "pintura anticorrosiva"] },
      { id: "preparacion-superficie", name: "Preparación de Superficie", keywords: ["masilla", "sellador", "imprimante", "primer", "enduido", "lijadora", "pulidora", "lijado"] },
      { id: "herramientas-especiales", name: "Herramientas Especiales", keywords: ["raspador", "espátula", "cuchilla", "cuchillo de pintor", "removedor", "decapante", "limpiador"] },
    ],
    filters: {
      condition: true,
      priceRange: true,
      location: true,
    },
  },
  {
    id: "jardineria",
    slug: "jardineria",
    name: "Jardinería",
    namePlural: "Herramientas de Jardinería",
    icon: faTree,
    color: "green",
    gradient: "from-green-500 to-emerald-600",
    description: "Herramientas y equipos para jardinería y paisajismo",
    subcategories: [
      { id: "podadoras", name: "Podadoras y Cortadoras", keywords: ["podadora", "cortadora", "desbrozadora", "tijera", "tijeras de podar", "podadora eléctrica", "podadora de altura", "cortadora de césped", "cortadora manual"] },
      { id: "rastrillos", name: "Rastrillos y Palas", keywords: ["rastrillo", "pala", "azadón", "pico", "rastro", "pala de jardín", "azada", "rastrillo de hojas", "rastrillo de jardín"] },
      { id: "equipos-riego", name: "Equipos de Riego", keywords: ["manguera", "aspersor", "regadera", "riego", "bomba", "sistema de riego", "manguera de riego", "aspersor rotativo", "regadera de jardín", "bomba de agua"] },
      { id: "herramientas-manuales", name: "Herramientas Manuales", keywords: ["tijera", "pala", "rastrillo", "azadón", "pico", "herramienta manual", "tijeras de jardín", "transplantador", "desplantador", "cuchillo de jardín"] },
      { id: "maquinaria-jardineria", name: "Maquinaria de Jardinería", keywords: ["cortadora", "podadora", "soplador", "trituradora", "máquina", "cortadora de césped", "soplador de hojas", "trituradora de ramas", "motosierra"] },
      { id: "fertilizantes-y-sustratos", name: "Fertilizantes y Sustratos", keywords: ["fertilizante", "abono", "sustrato", "tierra", "compost", "humus", "turba", "perlita", "vermiculita"] },
      { id: "macetas-y-contenedores", name: "Macetas y Contenedores", keywords: ["maceta", "macetero", "contenedor", "jardín", "maceta de barro", "maceta plástica", "jardín vertical", "maceta colgante"] },
      { id: "semillas-y-plantas", name: "Semillas y Plantas", keywords: ["semilla", "planta", "bulbo", "esqueje", "semilla de césped", "planta de jardín", "árbol", "arbusto"] },
      { id: "accesorios-jardineria", name: "Accesorios de Jardinería", keywords: ["guante", "rodillera", "delantal", "carretilla", "cubo", "regadera", "pulverizador", "tijeras de podar"] },
    ],
    filters: {
      condition: true,
      priceRange: true,
      location: true,
    },
  },
  {
    id: "sistemas",
    slug: "sistemas",
    name: "Sistemas",
    namePlural: "Sistemas e Informática",
    icon: faServer,
    color: "indigo",
    gradient: "from-indigo-500 to-purple-600",
    description: "Equipos de cómputo, redes, sistemas fotovoltaicos, cámaras CCTV y tecnología",
    subcategories: [
      { id: "minisplits", name: "Minisplits y Climatización", keywords: ["minisplit", "mini split", "aire acondicionado", "climatización", "aufit", "inverter", "seer", "btu", "r32", "r410", "split", "aire"] },
      { id: "redes", name: "Redes e Infraestructura", keywords: ["router", "switch", "access point", "red", "networking", "wifi", "ethernet", "cable utp", "patch panel", "rack"] },
      { id: "videovigilancia", name: "Videovigilancia y CCTV", keywords: ["cámara", "cctv", "dvr", "nvr", "videovigilancia", "seguridad", "ip camera", "cámara ip", "grabador", "monitor"] },
      { id: "computo", name: "Equipos de Cómputo", keywords: ["computadora", "laptop", "servidor", "workstation", "pc", "notebook", "desktop", "estación de trabajo"] },
      { id: "almacenamiento", name: "Almacenamiento", keywords: ["disco duro", "hdd", "ssd", "nas", "storage", "almacenamiento", "raid", "backup"] },
      { id: "fotovoltaicos", name: "Sistemas Fotovoltaicos", keywords: ["solar", "fotovoltaico", "panel solar", "inversor", "batería", "energía solar", "sistema solar"] },
      { id: "accesorios-sistemas", name: "Accesorios y Componentes", keywords: ["cable", "conector", "adaptador", "fuente de poder", "ups", "regulador", "protector"] },
    ],
    filters: {
      condition: true,
      priceRange: true,
      location: true,
    },
  },
];

/**
 * Obtiene una categoría por su slug
 */
export function getCategoryBySlug(slug: string): MarketplaceCategory | undefined {
  return MARKETPLACE_CATEGORIES.find((cat) => cat.slug === slug);
}

/**
 * Obtiene una categoría por su ID
 */
export function getCategoryById(id: string): MarketplaceCategory | undefined {
  return MARKETPLACE_CATEGORIES.find((cat) => cat.id === id);
}

/**
 * Obtiene una subcategoría por su ID
 */
export function getSubcategoryById(categoryId: string, subcategoryId: string): MarketplaceSubcategory | undefined {
  const category = getCategoryById(categoryId);
  return category?.subcategories.find((sub) => sub.id === subcategoryId);
}

/**
 * Genera la URL de una categoría
 */
export function getCategoryUrl(category: MarketplaceCategory | string): string {
  const slug = typeof category === "string" 
    ? (getCategoryById(category)?.slug || category)
    : category.slug;
  return `/marketplace/categoria/${slug}`;
}
