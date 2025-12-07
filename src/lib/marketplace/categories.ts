/**
 * Sistema de Categorías del Marketplace
 * Estructura organizada tipo MercadoLibre con slugs SEO-friendly
 */

import {
  faBolt,
  faWrench,
  faHammer,
  faTools,
  faPaintRoller,
  faTree,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";

export interface MarketplaceCategory {
  id: string;
  slug: string; // URL-friendly slug
  name: string;
  namePlural: string;
  icon: IconDefinition;
  color: string;
  gradient: string;
  description: string;
  subcategories?: string[];
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
    subcategories: ["herramientas-electricas", "cables", "interruptores", "iluminacion"],
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
    subcategories: ["llaves", "tuberias", "accesorios", "herramientas-especializadas"],
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
    subcategories: ["demolicion", "medicion", "nivelacion", "equipos-pesados"],
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
    subcategories: ["llaves-mecanicas", "destornilladores", "equipos-automotrices"],
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
    subcategories: ["rodillos", "brochas", "pistolas", "accesorios"],
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
    subcategories: ["podadoras", "rastrillos", "equipos-riego", "herramientas-manuales"],
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
 * Genera la URL de una categoría
 */
export function getCategoryUrl(category: MarketplaceCategory | string): string {
  const slug = typeof category === "string" 
    ? (getCategoryById(category)?.slug || category)
    : category.slug;
  return `/marketplace/categoria/${slug}`;
}

