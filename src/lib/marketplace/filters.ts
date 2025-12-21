/**
 * Sistema de Filtros del Marketplace
 * Tipos y utilidades para filtrado avanzado tipo MercadoLibre
 */

import { getSubcategoryById } from "./categories";

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
  
  // Subcategoría (tipo de equipo específico)
  subcategoryId: string | null;
  
  // Filtro jerárquico (rama y subrama)
  rama: string | null; // ID de la rama (ej: "videovigilancia")
  subrama: string | null; // ID de la subrama (ej: "camaras")
  
  // Condición
  conditions: string[]; // ["nuevo", "usado_excelente", etc.]
  
  // Precio
  priceRange: PriceRange;
  
  // Ubicación
  locationCity: string | null;
  locationZone: string | null;
  
  // Marcas
  brands: string[]; // ["HIKVISION", "KLEIN", etc.]
  
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
  subcategoryId: null,
  rama: null,
  subrama: null,
  conditions: [],
  priceRange: { min: null, max: null },
  locationCity: null,
  locationZone: null,
  brands: [],
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
  // Nota: category_id en la BD es UUID, pero filters.categoryId puede ser slug
  // Por lo tanto, NO filtramos por categoría aquí si ya viene filtrado desde la BD
  // Este filtro solo se aplica si los productos no vienen pre-filtrados
  // (por ejemplo, cuando se cargan productos destacados sin filtros)
  // Si filters.categoryId es un UUID válido, comparar directamente
  // Si es un slug, los productos ya deberían venir filtrados desde la BD
  if (filters.categoryId) {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(filters.categoryId);
    if (isUUID) {
      // Es UUID, comparar directamente
      filtered = filtered.filter((p) => p.category_id === filters.categoryId);
    }
    // Si es slug, asumimos que los productos ya vienen filtrados desde la BD
  }

  // Filtro jerárquico: rama y subrama (filtrado por palabras clave en título/descripción)
  if (filters.rama || filters.subrama) {
    try {
      const { getRamaById, getSubramaById } = require('@/lib/marketplace/hierarchy');
      
      // Obtener categoryId para jerarquía - usar categorySlug si está disponible
      let categoryIdForHierarchy: string | null = null;
      
      const filtersAny = filters as any;
      if (filtersAny.categorySlug) {
        categoryIdForHierarchy = filtersAny.categorySlug;
      } else if (filters.categoryId) {
        // Si categoryId es un UUID, usar "sistemas" como fallback
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(filters.categoryId);
        categoryIdForHierarchy = isUUID ? "sistemas" : filters.categoryId;
      } else {
        categoryIdForHierarchy = "sistemas"; // Fallback
      }
      
      console.log('🔍 [FILTRO JERÁRQUICO] Iniciando filtrado:', {
        rama: filters.rama,
        subrama: filters.subrama,
        categoryIdForHierarchy,
        categoryId: filters.categoryId,
        productosAntes: filtered.length,
      });
      
      let keywordsToMatch: string[] = [];
      
      if (filters.subrama && filters.rama && categoryIdForHierarchy) {
        const subrama = getSubramaById(categoryIdForHierarchy, filters.rama, filters.subrama);
        console.log('🔍 [FILTRO JERÁRQUICO] Subrama obtenida:', subrama);
        if (subrama?.keywords?.length > 0) {
          keywordsToMatch = subrama.keywords.map(k => k.toLowerCase());
        }
      } else if (filters.rama && categoryIdForHierarchy) {
        const rama = getRamaById(categoryIdForHierarchy, filters.rama);
        console.log('🔍 [FILTRO JERÁRQUICO] Rama obtenida:', rama);
        if (rama?.keywords?.length > 0) {
          keywordsToMatch = rama.keywords.map(k => k.toLowerCase());
        }
      }
      
      console.log('🔍 [FILTRO JERÁRQUICO] Keywords a buscar:', keywordsToMatch);
      
      if (keywordsToMatch.length > 0) {
        const beforeCount = filtered.length;
        filtered = filtered.filter((p) => {
          const titleLower = (p.title || "").toLowerCase();
          const descLower = (p.description || "").toLowerCase();
          const combinedText = `${titleLower} ${descLower}`;
          
          // Verificar si alguna keyword está presente
          const matches = keywordsToMatch.some((keyword) => combinedText.includes(keyword));
          
          return matches;
        });
        
        console.log(`✅ [FILTRO JERÁRQUICO] Aplicado:`, {
          rama: filters.rama,
          subrama: filters.subrama,
          categoryIdForHierarchy,
          keywords: keywordsToMatch.slice(0, 10),
          totalKeywords: keywordsToMatch.length,
          antes: beforeCount,
          despues: filtered.length,
        });
      } else {
        console.warn('⚠️ [FILTRO JERÁRQUICO] No se encontraron keywords:', {
          rama: filters.rama,
          subrama: filters.subrama,
          categoryIdForHierarchy,
        });
      }
    } catch (error) {
      console.error('❌ [FILTRO JERÁRQUICO] Error:', error);
    }
  }

  // Subcategoría (filtrado por palabras clave en título/descripción)
  if (filters.subcategoryId && filters.categoryId) {
    const subcategory = getSubcategoryById(filters.categoryId, filters.subcategoryId);
    
    if (!subcategory) {
      console.warn(`⚠️ Subcategoría no encontrada: categoryId=${filters.categoryId}, subcategoryId=${filters.subcategoryId}`);
    } else if (!subcategory.keywords || subcategory.keywords.length === 0) {
      console.warn(`⚠️ Subcategoría "${subcategory.name}" no tiene keywords definidas`);
    } else {
      const keywords = subcategory.keywords.map((k) => k.toLowerCase().trim());
      
      // Debug en desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 Filtrando por subcategoría "${subcategory.name}":`, {
          keywords,
          productosAntes: filtered.length,
          categoryId: filters.categoryId,
          subcategoryId: filters.subcategoryId,
        });
      }
      
      const productosAntesFiltro = filtered.length;
      const productosOriginales = [...filtered]; // Guardar copia para debug
      
      filtered = filtered.filter((p) => {
        const titleLower = (p.title || "").toLowerCase();
        const descLower = (p.description || "").toLowerCase();
        const combinedText = `${titleLower} ${descLower}`;
        
        // Buscar si alguna keyword está presente en el título o descripción
        // Búsqueda más flexible: busca palabras individuales dentro de keywords compuestas
        const matches = keywords.some((keyword) => {
          const keywordLower = keyword.toLowerCase().trim();
          
          // Normalizar acentos y caracteres especiales para búsqueda más flexible
          const normalizeText = (text: string) => {
            return text
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
              .toLowerCase();
          };
          
          const normalizedTitle = normalizeText(titleLower);
          const normalizedDesc = normalizeText(descLower);
          const normalizedKeyword = normalizeText(keywordLower);
          
          // Si la keyword es una frase (múltiples palabras), buscar cada palabra
          const keywordWords = normalizedKeyword.split(/\s+/).filter(w => w.length > 2); // Filtrar palabras muy cortas
          
          // Si es una keyword simple (una palabra), buscar directamente
          if (keywordWords.length === 1) {
            const singleKeyword = keywordWords[0];
            
            // Buscar en título (normalizado)
            if (normalizedTitle.includes(singleKeyword)) {
              return true;
            }
            
            // Buscar en descripción (normalizado)
            if (normalizedDesc.includes(singleKeyword)) {
              return true;
            }
            
            // También buscar en texto original (por si acaso)
            if (titleLower.includes(keywordLower) || descLower.includes(keywordLower)) {
              return true;
            }
            
            // Buscar palabra completa con regex
            try {
              const escapedKeyword = singleKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              const regex = new RegExp(`\\b${escapedKeyword}`, 'i');
              if (regex.test(combinedText)) {
                return true;
              }
            } catch (e) {
              // Si falla el regex, continuar con búsqueda simple
            }
          } else {
            // Si es una frase, buscar si todas las palabras están presentes (en cualquier orden)
            const allWordsMatch = keywordWords.every(word => {
              return normalizedTitle.includes(word) || normalizedDesc.includes(word);
            });
            
            if (allWordsMatch) {
              return true;
            }
            
            // También buscar la frase completa (normalizada)
            if (normalizedTitle.includes(normalizedKeyword) || normalizedDesc.includes(normalizedKeyword)) {
              return true;
            }
            
            // También buscar en texto original
            if (titleLower.includes(keywordLower) || descLower.includes(keywordLower)) {
              return true;
            }
          }
          
          return false;
        });
        
        return matches;
      });
      
      // Debug adicional: mostrar productos que no coincidieron
      if (process.env.NODE_ENV === 'development' && filtered.length === 0 && productosAntesFiltro > 0) {
        const productosNoCoincidentes = productosOriginales.slice(0, 5).map(p => ({
          titulo: p.title,
          descripcion: p.description?.substring(0, 100),
          categoria_id: p.category_id,
        }));
        console.log(`📋 Ejemplos de productos que NO coincidieron (primeros 5):`, productosNoCoincidentes);
        console.log(`💡 Keywords buscadas:`, keywords);
        console.log(`💡 Sugerencia: Verifica que los productos tengan alguna de estas palabras en su título o descripción.`);
      }
      
      // Debug en desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Productos después del filtro de subcategoría:`, {
          antes: productosAntesFiltro,
          despues: filtered.length,
          eliminados: productosAntesFiltro - filtered.length,
        });
        
        // Mostrar información útil cuando no hay resultados
        if (filtered.length === 0 && productosAntesFiltro > 0) {
          console.log(`⚠️ Ningún producto coincidió con las keywords:`, keywords);
          console.log(`⚠️ Total de productos antes del filtro:`, productosAntesFiltro);
          console.log(`💡 Sugerencia: Verifica que los productos tengan alguna de estas palabras en título o descripción:`, keywords.slice(0, 5));
        } else if (filtered.length === 0 && productosAntesFiltro === 0) {
          console.log(`⚠️ No hay productos cargados para filtrar. Verifica que la categoría tenga productos.`);
        }
      }
    }
  }

  // Condición
  if (filters.conditions.length > 0) {
    filtered = filtered.filter((p) => filters.conditions.includes(p.condition));
  }

  // ✅ FILTRO CRÍTICO: Excluir productos con precio 0
  filtered = filtered.filter((p) => p.price > 0);

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

  // Marcas - Filtrado más preciso
  if (filters.brands.length > 0) {
    filtered = filtered.filter((p) => {
      const titleUpper = (p.title || "").toUpperCase();
      const descUpper = (p.description || "").toUpperCase();
      const combinedText = `${titleUpper} ${descUpper}`;
      
      // Verificar si alguna marca está presente en título o descripción
      return filters.brands.some((brand) => {
        const brandUpper = brand.toUpperCase();
        
        // Buscar marca como palabra completa (no como substring dentro de otra palabra)
        const brandRegex = new RegExp(`\\b${brandUpper.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        
        // También buscar marca al inicio o final del título/descripción
        return (
          brandRegex.test(combinedText) ||
          titleUpper.startsWith(brandUpper) ||
          titleUpper.includes(` ${brandUpper} `) ||
          titleUpper.endsWith(` ${brandUpper}`) ||
          descUpper.includes(brandUpper)
        );
      });
    });
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

