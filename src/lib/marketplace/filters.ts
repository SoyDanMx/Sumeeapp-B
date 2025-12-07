/**
 * Sistema de Filtros del Marketplace
 * Tipos y utilidades para filtrado avanzado tipo MercadoLibre
 */

export type SortOption = 
  | "relevance"
  | "price_asc"
  | "price_desc"
  | "newest"
  | "oldest"
  | "most_viewed"
  | "most_liked";

export type ViewMode = "grid" | "list";

export interface PriceRange {
  min: number | null;
  max: number | null;
}

export interface MarketplaceFilters {
  // Búsqueda
  searchQuery: string;
  
  // Categoría
  categoryId: string | null;
  
  // Condición
  conditions: string[]; // ["nuevo", "usado_excelente", etc.]
  
  // Precio
  priceRange: PriceRange;
  
  // Ubicación
  locationCity: string | null;
  locationZone: string | null;
  
  // Tipo de energía (para herramientas eléctricas)
  powerType: string | null; // "electric", "cordless", "electric_all"
  
  // Ordenamiento
  sortBy: SortOption;
  
  // Vista
  viewMode: ViewMode;
  
  // Paginación
  page: number;
  itemsPerPage: number;
}

export const DEFAULT_FILTERS: MarketplaceFilters = {
  searchQuery: "",
  categoryId: null,
  conditions: [],
  priceRange: { min: null, max: null },
  locationCity: null,
  locationZone: null,
  powerType: null,
  sortBy: "relevance",
  viewMode: "grid",
  page: 1,
  itemsPerPage: 24,
};

/**
 * Aplica filtros a una lista de productos
 */
export function applyFilters<T extends { 
  title: string;
  description: string;
  category_id: string;
  condition: string;
  price: number;
  location_city?: string | null;
  location_zone?: string | null;
  power_type?: string | null;
  created_at: string;
  views_count: number;
  likes_count: number;
}>(
  products: T[],
  filters: MarketplaceFilters
): T[] {
  let filtered = [...products];

  // Búsqueda por texto
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
    );
  }

  // Categoría
  if (filters.categoryId) {
    filtered = filtered.filter((p) => p.category_id === filters.categoryId);
  }

  // Condición
  if (filters.conditions.length > 0) {
    filtered = filtered.filter((p) => filters.conditions.includes(p.condition));
  }

  // Rango de precio
  if (filters.priceRange.min !== null) {
    filtered = filtered.filter((p) => p.price >= filters.priceRange.min!);
  }
  if (filters.priceRange.max !== null) {
    filtered = filtered.filter((p) => p.price <= filters.priceRange.max!);
  }

  // Ubicación
  if (filters.locationCity) {
    filtered = filtered.filter((p) => p.location_city === filters.locationCity);
  }
  if (filters.locationZone) {
    filtered = filtered.filter((p) => p.location_zone === filters.locationZone);
  }

  // Tipo de energía
  if (filters.powerType) {
    if (filters.powerType === "electric_all") {
      filtered = filtered.filter(
        (p) => p.power_type === "electric" || p.power_type === "cordless"
      );
    } else {
      filtered = filtered.filter((p) => p.power_type === filters.powerType);
    }
  }

  // Ordenamiento
  filtered = sortProducts(filtered, filters.sortBy);

  return filtered;
}

/**
 * Ordena productos según la opción seleccionada
 */
function sortProducts<T extends {
  price: number;
  created_at: string;
  views_count: number;
  likes_count: number;
}>(
  products: T[],
  sortBy: SortOption
): T[] {
  const sorted = [...products];

  switch (sortBy) {
    case "price_asc":
      return sorted.sort((a, b) => a.price - b.price);
    
    case "price_desc":
      return sorted.sort((a, b) => b.price - a.price);
    
    case "newest":
      return sorted.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    
    case "oldest":
      return sorted.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    
    case "most_viewed":
      return sorted.sort((a, b) => b.views_count - a.views_count);
    
    case "most_liked":
      return sorted.sort((a, b) => b.likes_count - a.likes_count);
    
    case "relevance":
    default:
      // Orden por relevancia: más nuevos primero, luego por vistas
      return sorted.sort((a, b) => {
        const dateDiff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (Math.abs(dateDiff) < 7 * 24 * 60 * 60 * 1000) {
          // Si tienen menos de 7 días de diferencia, ordenar por vistas
          return b.views_count - a.views_count;
        }
        return dateDiff;
      });
  }
}

/**
 * Obtiene el texto descriptivo de una opción de ordenamiento
 */
export function getSortLabel(sortBy: SortOption): string {
  const labels: Record<SortOption, string> = {
    relevance: "Más relevantes",
    price_asc: "Menor precio",
    price_desc: "Mayor precio",
    newest: "Más recientes",
    oldest: "Más antiguos",
    most_viewed: "Más vistos",
    most_liked: "Más populares",
  };
  return labels[sortBy];
}

