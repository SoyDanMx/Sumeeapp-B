import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { MarketplaceProduct } from "@/types/supabase";
import { supabase } from "@/lib/supabase/client";

// Cache para resolución de slug a UUID (evita queries repetidas)
const categorySlugCache = new Map<string, string>();

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface UseMarketplacePaginationOptions {
  pageSize?: number;
  categoryId?: string | null;
  searchQuery?: string;
  filters?: {
    minPrice?: number | null;
    maxPrice?: number | null;
    condition?: string[];
    powerType?: string | null;
  };
  forceInitialLoad?: boolean; // Forzar carga inicial incluso sin filtros
}

export function useMarketplacePagination(options: UseMarketplacePaginationOptions = {}) {
  const { pageSize = 24, categoryId, searchQuery, filters, forceInitialLoad = false } = options;

  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize,
    total: 0,
    totalPages: 0,
    hasMore: false,
  });

  // Usar ref para evitar recrear callbacks cuando cambian los filtros
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  
  // Ref para mantener el estado de paginación más reciente
  const paginationRef = useRef(pagination);
  paginationRef.current = pagination;

  const fetchProducts = useCallback(
    async (page: number, append: boolean = false) => {
      try {
        setLoading(true);
        setError(null);

        // Validar página y pageSize
        const validPage = Math.max(1, page); // Asegurar que page sea al menos 1
        const validPageSize = Math.max(1, pageSize); // Asegurar que pageSize sea al menos 1
        
        const from = (validPage - 1) * validPageSize;
        const to = from + validPageSize - 1;
        
        // Validar que from y to sean válidos
        if (from < 0 || to < 0 || from > to) {
          console.error("⚠️ [PAGINACIÓN] Rango inválido:", { from, to, page: validPage, pageSize: validPageSize });
          throw new Error(`Rango de paginación inválido: from=${from}, to=${to}`);
        }

        // Usar ref para obtener los filtros actuales sin causar recreación del callback
        const currentFilters = filtersRef.current;

        // Resolver categoryId: si es slug, obtener UUID primero (con cache)
        let categoryUUID = categoryId;
        if (categoryId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId)) {
          // Verificar cache primero
          if (categorySlugCache.has(categoryId)) {
            categoryUUID = categorySlugCache.get(categoryId)!;
          } else {
            // Es un slug, intentar obtener el UUID de la categoría
            try {
              const { data: categoryData } = await supabase
                .from("marketplace_categories")
                .select("id")
                .eq("slug", categoryId)
                .single();
              
              if (categoryData && (categoryData as any).id) {
                categoryUUID = (categoryData as any).id;
                // Guardar en cache solo si categoryUUID es válido
                if (categoryUUID) {
                  categorySlugCache.set(categoryId, categoryUUID);
                }
              } else {
                // Si no se encuentra, intentar usar el slug directamente (compatibilidad hacia atrás)
                console.warn(`Categoría no encontrada por slug: ${categoryId}, usando slug directamente`);
              }
            } catch (err) {
              // Si falla (tabla no existe o error), usar slug directamente
              console.warn("Error obteniendo UUID de categoría, usando slug:", err);
            }
          }
        }

        // Construir consulta base
        // OPTIMIZACIÓN: Solo hacer JOIN con profiles si realmente necesitamos datos del seller
        // Para productos oficiales (Sumee Supply), no necesitamos el JOIN
        // Usar count: "exact" siempre para calcular correctamente hasMore
        let query = supabase
          .from("marketplace_products")
          .select(
            `
            *
          `,
            { count: "exact" }
          )
          .eq("status", "active");

        // Aplicar filtros
        if (categoryUUID) {
          query = query.eq("category_id", categoryUUID);
        }

        if (searchQuery && searchQuery.trim() !== "") {
          // Búsqueda en título y descripción usando ilike (case-insensitive)
          // Sintaxis correcta para Supabase: campo.operador.valor
          const trimmedQuery = searchQuery.trim();
          // Usar la sintaxis correcta de Supabase para .or() con ilike
          query = query.or(`title.ilike.%${trimmedQuery}%,description.ilike.%${trimmedQuery}%`);
        }

        if (currentFilters?.minPrice !== null && currentFilters?.minPrice !== undefined) {
          query = query.gte("price", currentFilters.minPrice);
        }

        if (currentFilters?.maxPrice !== null && currentFilters?.maxPrice !== undefined) {
          query = query.lte("price", currentFilters.maxPrice);
        }

        if (currentFilters?.condition && currentFilters.condition.length > 0) {
          query = query.in("condition", currentFilters.condition);
        }

        if (currentFilters?.powerType) {
          if (currentFilters.powerType === "electric_all") {
            query = query.or("power_type.eq.electric,power_type.eq.cordless");
          } else {
            query = query.eq("power_type", currentFilters.powerType);
          }
        }

        // Ordenar y paginar
        const queryResult = await query
          .order("created_at", { ascending: false })
          .range(from, to);
        
        const { data, error: queryError, count } = queryResult;

        if (queryError) {
          console.error("❌ [PAGINACIÓN] Error en query de productos:", {
            error: queryError,
            message: queryError.message,
            details: queryError.details,
            hint: queryError.hint,
            code: queryError.code,
            from,
            to,
            page: validPage,
            pageSize: validPageSize,
          });
          
          // Proporcionar más información del error
          const errorMessage = queryError.message 
            || queryError.details 
            || queryError.hint 
            || JSON.stringify(queryError) 
            || "Error desconocido al obtener productos";
          throw new Error(errorMessage);
        }

        if (data) {
          // OPTIMIZACIÓN: Mapear productos sin JOIN innecesario
          // Determinar seller basado en contact_phone (más rápido que JOIN)
          const mappedProducts: MarketplaceProduct[] = (data as any[]).map(
            (item) => {
              const isOfficialStore = item.contact_phone === "5636741156";

              return {
                ...item,
                seller: {
                  full_name: isOfficialStore ? "Sumee Supply" : "Usuario Sumee",
                  avatar_url: null,
                  verified: true,
                  calificacion_promedio: isOfficialStore ? 5.0 : 4.9,
                  review_count: isOfficialStore ? 1250 : 12,
                },
              };
            }
          );

          // Calcular total y páginas
          const total = count !== undefined && count !== null ? count : pagination.total;
          const totalPages = total > 0 ? Math.ceil(total / pageSize) : 0;
          
          // Calcular hasMore: hay más si estamos en una página anterior a la última
          // Si no tenemos count pero recibimos una página completa, asumir que hay más
          const hasMore = count !== undefined && count !== null
            ? page < totalPages
            : data.length === pageSize; // Si recibimos una página completa, probablemente hay más

          // Debug en desarrollo
          if (process.env.NODE_ENV === 'development') {
            console.log('📊 [PAGINACIÓN] Estado:', {
              page,
              totalPages,
              total,
              count,
              dataLength: data.length,
              hasMore,
              append,
            });
          }

          // Actualizar paginación ANTES de actualizar productos
          setPagination({
            page,
            pageSize,
            total,
            totalPages,
            hasMore,
          });

          if (append) {
            // Filtrar duplicados al hacer append (evitar productos con mismo ID)
            setProducts((prev) => {
              const existingIds = new Set(prev.map(p => p.id));
              const newProducts = mappedProducts.filter(p => !existingIds.has(p.id));
              return [...prev, ...newProducts];
            });
          } else {
            setProducts(mappedProducts);
          }
        }
      } catch (err: any) {
        console.error("Error fetching products:", err);
        setError(err.message || "Error al cargar productos");
      } finally {
        setLoading(false);
      }
    },
    [pageSize, categoryId, searchQuery]
  );

  const loadPage = useCallback(
    (page: number) => {
      fetchProducts(page, false);
    },
    [fetchProducts]
  );

  const loadNextPage = useCallback(() => {
    // Usar ref para obtener valores más recientes
    const currentPagination = paginationRef.current;
    
    if (!loading && currentPagination.hasMore) {
      const nextPage = currentPagination.page + 1;
      console.log('🔄 [PAGINACIÓN] Cargando página', nextPage, 'de', currentPagination.totalPages);
      fetchProducts(nextPage, true);
    } else {
      console.log('⚠️ [PAGINACIÓN] No se puede cargar más:', {
        loading,
        hasMore: currentPagination.hasMore,
        currentPage: currentPagination.page,
        totalPages: currentPagination.totalPages,
        total: currentPagination.total,
      });
    }
  }, [loading, fetchProducts]);

  const reset = useCallback(() => {
    setProducts([]);
    setPagination((prev) => ({ ...prev, page: 1, total: 0, totalPages: 0, hasMore: false }));
    fetchProducts(1, false);
  }, [fetchProducts]);

  // Cargar primera página cuando cambian los filtros
  // Usar un flag para evitar múltiples ejecuciones
  const isInitialMount = useRef(true);
  
  // Crear una clave única para detectar cambios en los filtros
  const filtersKey = useMemo(() => {
    return JSON.stringify({
      categoryId,
      searchQuery,
      minPrice: filters?.minPrice,
      maxPrice: filters?.maxPrice,
      condition: filters?.condition ? [...filters.condition].sort().join(',') : null,
      powerType: filters?.powerType,
      forceInitialLoad,
    });
  }, [categoryId, searchQuery, filters?.minPrice, filters?.maxPrice, filters?.condition, filters?.powerType, forceInitialLoad]);
  
  useEffect(() => {
    // Evitar ejecución en el mount inicial si no hay filtros Y no se fuerza la carga
    if (isInitialMount.current && !forceInitialLoad && !categoryId && !searchQuery && !filters) {
      isInitialMount.current = false;
      return;
    }
    
    isInitialMount.current = false;
    setProducts([]);
    setPagination((prev) => ({ ...prev, page: 1, total: 0, totalPages: 0, hasMore: false }));
    fetchProducts(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey, fetchProducts]);

  return {
    products,
    loading,
    error,
    pagination,
    loadPage,
    loadNextPage,
    reset,
    refresh: () => fetchProducts(pagination.page, false),
  };
}

